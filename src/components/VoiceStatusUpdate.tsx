import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Volume2,
  FileText,
  CheckCircle2,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceRecorder from "./VoiceRecorder";
import {
  speakToFarmer,
  generateInvestorSummary,
} from "@/lib/elevenlabs";

interface VoiceUpdate {
  transcript: string;
  summary: string;
  timestamp: Date;
}

interface VoiceStatusUpdateProps {
  farmerName: string;
}

type Phase =
  | "idle"
  | "recording"
  | "summarizing"
  | "readback"
  | "done";

const VoiceStatusUpdate: React.FC<VoiceStatusUpdateProps> = ({
  farmerName,
}) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [updates, setUpdates] = useState<VoiceUpdate[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentSummary, setCurrentSummary] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranscript = async (text: string) => {
    setCurrentTranscript(text);
    setPhase("summarizing");

    // Generate investor-friendly summary
    const summary = await generateInvestorSummary(text, farmerName);
    setCurrentSummary(summary);

    // Read the summary back to the farmer via TTS
    setPhase("readback");
    setIsSpeaking(true);
    await speakToFarmer(
      `Here's what your investors will see: ${summary}`
    );
    setIsSpeaking(false);

    // Save update
    const update: VoiceUpdate = {
      transcript: text,
      summary,
      timestamp: new Date(),
    };
    setUpdates((prev) => [update, ...prev]);
    setPhase("done");
  };

  const handleNewUpdate = () => {
    setCurrentTranscript("");
    setCurrentSummary("");
    setPhase("recording");
  };

  const handleReplay = async (text: string) => {
    setIsSpeaking(true);
    await speakToFarmer(text);
    setIsSpeaking(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Mic className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          Voice Status Update
        </h3>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* IDLE — show record button */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Record a voice update for your investors. Speak naturally — we'll
                create an investor-friendly summary using AI.
              </p>
              <Button
                onClick={handleNewUpdate}
                className="h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold"
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Update
              </Button>
            </motion.div>
          )}

          {/* RECORDING */}
          {phase === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <VoiceRecorder
                onTranscript={handleTranscript}
                prompt="Tell your investors about your farm's progress..."
                fallbackText="I just finished planting; the rows look even, about 3 hectares done. Rain is expected next week which will help the seedlings."
                processingLabel="Understanding your farm..."
                size="lg"
              />
            </motion.div>
          )}

          {/* SUMMARIZING */}
          {phase === "summarizing" && (
            <motion.div
              key="summarizing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">
                Preparing your investor summary...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Creating a clear update from your words
              </p>
            </motion.div>
          )}

          {/* READBACK */}
          {phase === "readback" && (
            <motion.div
              key="readback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Transcript */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your Words
                  </span>
                </div>
                <p className="text-sm text-foreground italic">
                  "{currentTranscript}"
                </p>
              </div>

              {/* Summary being read back */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-2 mb-1">
                  <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-primary">
                    Reading back summary...
                  </span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  {currentSummary}
                </p>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Success */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/15">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Update Sent to Investors
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Your voice update and AI summary have been published.
                    Siyabonga!
                  </p>
                </div>
              </div>

              {/* Transcript */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your Words
                  </span>
                </div>
                <p className="text-sm text-foreground italic">
                  "{currentTranscript}"
                </p>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider text-primary">
                      Investor Summary
                    </span>
                  </div>
                  <button
                    onClick={() => handleReplay(currentSummary)}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    {isSpeaking ? "Playing..." : "Listen"}
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium">
                  {currentSummary}
                </p>
              </div>

              {/* Record another */}
              <Button
                onClick={handleNewUpdate}
                variant="outline"
                className="w-full h-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Another Update
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous updates */}
        {updates.length > 1 && phase !== "recording" && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
              Previous Updates
            </p>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {updates.slice(1).map((upd, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">
                      {upd.timestamp.toLocaleString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => handleReplay(upd.summary)}
                      disabled={isSpeaking}
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      Listen
                    </button>
                  </div>
                  <p className="text-xs text-foreground">{upd.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceStatusUpdate;