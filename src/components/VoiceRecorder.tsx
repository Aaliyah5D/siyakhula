import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { transcribeAudio } from "@/lib/elevenlabs";

interface VoiceRecorderProps {
  onTranscript: (text: string, audioBlob?: Blob) => void;
  prompt?: string;
  isProcessing?: boolean;
  /** Simulated response used when no API key is set */
  fallbackText?: string;
  /** Status label shown during processing */
  processingLabel?: string;
  /** Minimum button size for mobile-first design */
  size?: "md" | "lg";
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  prompt,
  isProcessing = false,
  fallbackText,
  processingLabel,
  size = "md",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusText, setStatusText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);

  const btnSize = size === "lg" ? "w-28 h-28 md:w-32 md:h-32" : "w-24 h-24 md:w-28 md:h-28";
  const iconSize = size === "lg" ? "w-10 h-10" : "w-8 h-8";

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Audio level visualisation
      const audioContext = new AudioContext();
      audioCtxRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Cleanup streams
        stream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current?.state !== "closed") {
          audioCtxRef.current?.close();
        }
        cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        if (audioBlob.size < 500) {
          // Too short / empty recording
          setStatusText("");
          return;
        }

        // Transcribe via ElevenLabs
        setIsTranscribing(true);
        setStatusText(processingLabel || "Understanding your voice...");
        try {
          const result = await transcribeAudio(audioBlob, fallbackText);
          onTranscript(result.text, audioBlob);
        } catch (err) {
          console.error("Transcription failed:", err);
          onTranscript(fallbackText || "Could not understand audio. Please try again.");
        } finally {
          setIsTranscribing(false);
          setStatusText("");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusText("Listening...");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setStatusText("Microphone access is needed. Please allow it in your browser.");
      setTimeout(() => setStatusText(""), 3000);
    }
  }, [onTranscript, fallbackText, processingLabel]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current?.state !== "closed") {
        audioCtxRef.current?.close();
      }
    };
  }, []);

  const busy = isProcessing || isTranscribing;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Prompt text */}
      <AnimatePresence mode="wait">
        {prompt && (
          <motion.p
            key={prompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-base md:text-lg text-foreground font-medium max-w-md px-4"
          >
            "{prompt}"
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mic button with pulse rings */}
      <div className="relative">
        {/* Animated green pulse rings */}
        {isRecording && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/25"
              animate={{ scale: [1, 2.0], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/15"
              animate={{ scale: [1, 2.4], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
            />
          </>
        )}

        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={busy}
          className={`relative ${btnSize} rounded-full flex items-center justify-center transition-all touch-manipulation ${
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-lg"
              : busy
              ? "bg-muted text-muted-foreground"
              : "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow animate-mic-pulse"
          }`}
          style={{ minWidth: 48, minHeight: 48 }}
          whileTap={{ scale: 0.93 }}
          animate={isRecording ? { scale: 1 + audioLevel * 0.15 } : {}}
        >
          {busy ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : isRecording ? (
            <Square className={iconSize} />
          ) : (
            <Mic className={iconSize} />
          )}
        </motion.button>
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={statusText || "idle"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-xs text-muted-foreground text-center min-h-[1.25rem]"
        >
          {statusText
            ? statusText
            : busy
            ? processingLabel || "Processing your voice..."
            : isRecording
            ? "Listening... tap to stop"
            : "Tap the microphone to speak"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default VoiceRecorder;
