import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sprout,
  Volume2,
  Edit3,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useProgram } from "@/hooks/useProgram";
import { useToast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";
import {
  parseFarmerTranscripts,
  speakToFarmer,
  type FarmerProfile,
} from "@/lib/elevenlabs";

// ---------------------------------------------------------------------------
// 4-step conversational prompts
// ---------------------------------------------------------------------------

const VOICE_PROMPTS = [
  "Tell me your name and where your farm is located.",
  "How many hectares do you want to plant maize on this season?",
  "How much funding do you need, and what profit share would you offer investors?",
  "Tell me about your water source and farming experience.",
];

const SIMULATED_REPLIES: Record<string, string> = {
  [VOICE_PROMPTS[0]]:
    "My name is Thabo Mokoena and my farm is in Polokwane, Limpopo Province.",
  [VOICE_PROMPTS[1]]:
    "I want to plant maize on 5 hectares this season.",
  [VOICE_PROMPTS[2]]:
    "I need about 85,000 rands for this season. I can offer investors 40% of the profit, so I keep 60%.",
  [VOICE_PROMPTS[3]]:
    "I have a borehole with drip irrigation system. I've been farming maize for 7 years now. Good yields last three seasons.",
};

const PROCESSING_LABELS = [
  "Understanding your farm...",
  "Measuring those hectares...",
  "Counting the rands...",
  "Learning about your water supply...",
];

const TTS_INTROS = [
  "Sawubona! Let me get to know you.",
  "Great — let's talk about the size of your operation.",
  "Good. Now let's talk about money and your offer to investors.",
  "Last one — tell me about your water and experience.",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FarmerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const sdk = useProgram();
  const { toast } = useToast();

  const [step, setStep] = useState(-1); // -1 = intro, 0-3 = voice, 4 = confirm
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [parsedData, setParsedData] = useState<FarmerProfile | null>(null);
  const hasSpokenIntro = useRef(false);

  // Speak the intro prompt when a new voice step starts
  useEffect(() => {
    if (step >= 0 && step <= 3 && !hasSpokenIntro.current) {
      hasSpokenIntro.current = true;
      setIsSpeaking(true);
      speakToFarmer(TTS_INTROS[step]).then(() => setIsSpeaking(false));
    }
  }, [step]);

  // Parse transcripts when all 4 are done
  useEffect(() => {
    if (transcripts.length === 4 && step === 4) {
      const parsed = parseFarmerTranscripts(transcripts);
      setParsedData(parsed);

      // Build confirmation and read it aloud
      const confirmText = `Sawubona ${parsed.name}! I've registered your ${parsed.hectares}-hectare maize farm in ${parsed.location}. You're requesting ${parsed.fundingAmount} for this season, offering ${parsed.profitSplit}. Is that correct?`;
      setIsSpeaking(true);
      speakToFarmer(confirmText).then(() => {
        setIsSpeaking(false);
      });
    }
  }, [transcripts, step]);

  const handleTranscript = useCallback(
    (text: string) => {
      setIsProcessing(true);
      // Small delay for UX smoothness
      setTimeout(() => {
        setTranscripts((prev) => [...prev, text]);
        setIsProcessing(false);
        hasSpokenIntro.current = false;
        if (step < 3) {
          setStep(step + 1);
        } else {
          setStep(4);
        }
      }, 600);
    },
    [step]
  );

  const handleStartConversation = async () => {
    setStep(0);
  };

  const handleRedo = () => {
    setTranscripts([]);
    setParsedData(null);
    hasSpokenIntro.current = false;
    setStep(0);
  };

  const handlePlayConfirmation = async () => {
    if (!parsedData) return;
    setIsSpeaking(true);
    const text = `Sawubona ${parsedData.name}! I've registered your ${parsedData.hectares}-hectare maize farm in ${parsedData.location}. You're requesting ${parsedData.fundingAmount} for this season, offering ${parsedData.profitSplit}. Is that correct?`;
    await speakToFarmer(text);
    setIsSpeaking(false);
  };

  const handleConfirm = async () => {
    if (!sdk || !publicKey || !connected) {
      toast({
        title: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Funding conversion — extract numeric value
      const fundingRands = parseInt(
        (parsedData?.fundingAmount || "R85000").replace(/[^0-9]/g, ""),
        10
      );
      const fundingAmountSol = Math.max(0.5, +(fundingRands / 35000).toFixed(2));

      // Profit split extraction
      const splitMatch = (parsedData?.profitSplit || "40%").match(/(\d+)/);
      const investorPct = splitMatch ? parseInt(splitMatch[1], 10) : 40;
      const farmerPct = 100 - investorPct;
      const profitSplitBps = farmerPct * 100;

      const configResult = await sdk.fetchConfig();
      if (!configResult.success) {
        toast({
          title: "Initializing program config...",
          description: "Asking the blockchain...",
        });
        const initResult = await sdk.initializeConfig(1000);
        if (
          !initResult.success &&
          !initResult.error?.includes("already in use")
        ) {
          toast({
            title: "Config initialization failed",
            description: initResult.error,
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }
      }

      const campaignId = sdk.generateCampaignId();
      const now = Math.floor(Date.now() / 1000);
      const sixMonthsLater = now + 180 * 24 * 60 * 60;

      toast({
        title: "Creating your farm campaign...",
        description: "Preparing your soil data...",
      });

      const campaignResult = await sdk.initializeCampaign({
        campaignId,
        cropType: "Maize",
        fundingGoalSol: fundingAmountSol,
        profitSplitBps,
        seasonStart: now,
        seasonEnd: sixMonthsLater,
        ipfsHash: "",
      });

      if (!campaignResult.success) {
        toast({
          title: "Campaign creation failed",
          description: campaignResult.error,
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      toast({
        title: "Setting up milestones...",
        description: "Counting the rows...",
      });

      const campaignAddress = new PublicKey(
        campaignResult.data!.campaignAddress
      );
      const msResult = await sdk.initializeAllMilestones(campaignAddress);

      if (!msResult.success) {
        toast({
          title: "Milestone setup failed",
          description: msResult.error,
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      // Farewell TTS
      await speakToFarmer(
        `Siyabonga ${parsedData?.name || "farmer"}! Your campaign is live on the blockchain. Investors can now discover your farm. Good luck this season!`
      );

      toast({
        title: "Campaign created on Solana!",
        description: `Campaign: ${campaignResult.data!.campaignAddress.slice(0, 12)}...`,
      });

      setTimeout(() => navigate("/farmer/dashboard"), 1500);
    } catch (error) {
      console.error("Campaign creation error:", error);
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-28">
        <div className="container max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sprout className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                Voice Registration
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Sawubona! Let's Get Your Farm Set Up
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Just speak naturally — our AI will understand your farm details. No
              typing needed.
            </p>
          </motion.div>

          {/* Progress dots */}
          {step >= 0 && (
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < step
                      ? "w-8 bg-primary"
                      : i === step
                      ? "w-12 bg-primary animate-pulse-soft"
                      : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>
          )}

          {/* --------------- INTRO (step = -1) --------------- */}
          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center"
              >
                <p className="text-muted-foreground mb-8 max-w-sm">
                  We'll ask you <strong>4 quick questions</strong> about your
                  farm. Just tap the mic and answer in your own words — English
                  or any language comfortable to you.
                </p>

                <Button
                  onClick={handleStartConversation}
                  className="h-14 px-10 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-base"
                >
                  <Sprout className="w-5 h-5 mr-2" />
                  Start Voice Registration
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* --------------- VOICE STEPS (0-3) --------------- */}
            {step >= 0 && step < 4 && (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                {/* Previous transcripts */}
                {transcripts.length > 0 && (
                  <div className="w-full mb-8 space-y-3">
                    {transcripts.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                      >
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            Step {i + 1}
                          </p>
                          <p className="text-sm text-foreground">{t}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* AI is speaking the intro */}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                  >
                    <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      Speaking to you...
                    </span>
                  </motion.div>
                )}

                <VoiceRecorder
                  onTranscript={handleTranscript}
                  prompt={VOICE_PROMPTS[step]}
                  isProcessing={isProcessing}
                  fallbackText={SIMULATED_REPLIES[VOICE_PROMPTS[step]]}
                  processingLabel={PROCESSING_LABELS[step]}
                  size="lg"
                />

                <p className="mt-6 text-xs text-muted-foreground text-center">
                  Step {step + 1} of 4
                </p>
              </motion.div>
            )}

            {/* --------------- CONFIRMATION (step = 4) --------------- */}
            {step === 4 && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {!parsedData ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Preparing your response...
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/20 bg-card shadow-card overflow-hidden">
                    <div className="p-4 bg-gradient-primary">
                      <h2 className="font-display text-lg font-bold text-primary-foreground text-center">
                        Did I Get This Right?
                      </h2>
                    </div>

                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="px-6 pt-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/15">
                          <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                          <span className="text-xs text-primary font-medium">
                            Reading your details back to you...
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      {[
                        { label: "Farmer Name", value: parsedData.name },
                        { label: "Farm Location", value: parsedData.location },
                        {
                          label: "Land Size",
                          value: `${parsedData.hectares} hectares`,
                        },
                        {
                          label: "Funding Needed",
                          value: parsedData.fundingAmount,
                        },
                        {
                          label: "Investor Profit Split",
                          value: parsedData.profitSplit,
                        },
                        {
                          label: "Water Source",
                          value: parsedData.waterSource,
                        },
                        { label: "Experience", value: parsedData.experience },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="flex items-start justify-between gap-4 pb-3 border-b border-border last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {field.label}
                            </p>
                            <p className="text-sm font-medium text-foreground mt-0.5">
                              {field.value}
                            </p>
                          </div>
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border flex flex-col gap-3">
                      {/* Listen again button */}
                      <Button
                        variant="outline"
                        onClick={handlePlayConfirmation}
                        disabled={isSpeaking}
                        className="w-full h-12 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {isSpeaking
                          ? "Speaking..."
                          : "Listen to Confirmation Again"}
                      </Button>

                      {/* Redo */}
                      <Button
                        variant="outline"
                        onClick={handleRedo}
                        className="w-full h-12 rounded-xl border-border text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Start Over — Re-record All Answers
                      </Button>

                      {/* Confirm */}
                      <Button
                        onClick={handleConfirm}
                        disabled={isCreating || isSpeaking}
                        className="w-full h-14 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-base"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating Campaign on Solana...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Yes! Create My Farm Campaign
                          </>
                        )}
                      </Button>

                      <p className="text-[10px] text-center text-muted-foreground">
                        This will create a campaign on Solana Devnet. Siyabonga!
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmerRegister;