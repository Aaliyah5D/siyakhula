import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Wheat,
  Shield,
  Volume2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MilestoneTracker from "@/components/MilestoneTracker";
import { MOCK_CAMPAIGNS, MILESTONES } from "@/lib/constants";
import { useProgram } from "@/hooks/useProgram";
import { useToast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";

const FarmCampaign: React.FC = () => {
  const { id } = useParams();
  const { connected, publicKey } = useWallet();
  const sdk = useProgram();
  const { toast } = useToast();
  const [investAmount, setInvestAmount] = useState("");
  const [investToken, setInvestToken] = useState<"SOL" | "USDC">("SOL");
  const [isInvesting, setIsInvesting] = useState(false);

  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0];
  const percentFunded = Math.min((campaign.totalRaised / campaign.fundingGoal) * 100, 100);
  const daysRemaining = 45;

  const aiUpdates = [
    { date: "Mar 28, 2026", stage: "Vegetative Growth", confidence: 92, note: "Strong canopy development. Leaf area index above expected for 6-week mark." },
    { date: "Mar 12, 2026", stage: "Seedling Phase", confidence: 87, note: "Healthy seedling emergence across all rows. Uniform spacing confirmed." },
    { date: "Feb 25, 2026", stage: "Planting", confidence: 94, note: "Seed rows detected in soil. Proper spacing and depth observed." },
    { date: "Feb 10, 2026", stage: "Land Preparation", confidence: 96, note: "Tilled soil confirmed. GPS coordinates verified. Field boundaries established." },
  ];

  const voiceNotes = [
    { date: "Mar 30, 2026", text: "The maize is looking strong this week. We had good rain on Tuesday and the canopy is filling in nicely. I'm optimistic about this season." },
    { date: "Mar 15, 2026", text: "Seedlings are coming up well. No pest issues so far. Applied first round of fertilizer yesterday." },
  ];

  const handleInvest = async () => {
    if (!sdk || !publicKey || !connected) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return;
    }

    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    setIsInvesting(true);
    try {
      // For demo: use a placeholder campaign address
      // In production, this would be the actual on-chain campaign PDA
      toast({ title: "Processing investment...", description: "Asking the blockchain..." });

      // Try to find the campaign on chain; if not, show demo message
      const allCampaigns = await sdk.fetchAllCampaigns();
      if (allCampaigns.success && allCampaigns.data && allCampaigns.data.length > 0) {
        const campaignAddr = allCampaigns.data[0].publicKey;
        const result = await sdk.invest({ campaignAddress: campaignAddr, amountSol: amount });

        if (result.success) {
          toast({
            title: "Investment successful!",
            description: `Invested ${amount} SOL. Tx: ${result.data!.signature.slice(0, 12)}...`,
          });
          setInvestAmount("");
        } else {
          toast({ title: "Investment failed", description: result.error, variant: "destructive" });
        }
      } else {
        toast({
          title: "Demo Mode",
          description: `Investment of ${amount} ${investToken} would be sent to the Solana smart contract. Create a campaign first via the farmer registration flow.`,
        });
      }
    } catch (error) {
      console.error("Investment error:", error);
      toast({ title: "Investment failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-24">
        <div className="container max-w-5xl">
          <Link
            to="/investor/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
              >
                <div className="p-6 bg-gradient-primary text-primary-foreground">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Wheat className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-display font-bold">
                        {campaign.farmerName}'s Maize Farm
                      </h1>
                      <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
                        <MapPin className="w-3.5 h-3.5" />
                        {campaign.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed">{campaign.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                  {[
                    { label: "Crop", value: campaign.cropType, icon: Wheat },
                    { label: "Land", value: `${campaign.landHectares} ha`, icon: MapPin },
                    { label: "Season", value: campaign.seasonStart.slice(0, 7), icon: Calendar },
                    { label: "Profit Split", value: `${campaign.profitSplitBps / 100}% farmer`, icon: TrendingUp },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-card text-center">
                      <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Milestone timeline */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Milestone Timeline</h2>
                <MilestoneTracker currentIndex={campaign.milestoneIndex} />

                <div className="mt-6 space-y-0">
                  {MILESTONES.map((ms, i) => {
                    const isComplete = i < campaign.milestoneIndex;
                    const isCurrent = i === campaign.milestoneIndex;
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isComplete ? "bg-primary border-primary text-primary-foreground"
                            : isCurrent ? "bg-accent border-primary text-primary"
                            : "bg-muted border-border text-muted-foreground"
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          {i < MILESTONES.length - 1 && <div className={`w-0.5 h-12 ${isComplete ? "bg-primary" : "bg-border"}`} />}
                        </div>
                        <div className="pb-6">
                          <p className={`text-sm font-semibold ${isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                            {ms.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ms.releaseBps / 100}% released — {ms.trigger}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* AI Crop Updates */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4">AI Crop Updates</h2>
                <div className="space-y-4">
                  {aiUpdates.map((update, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{update.stage}</span>
                          <span className="text-[10px] text-muted-foreground">{update.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{update.note}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${update.confidence}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-primary">{update.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Farmer voice notes */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Farmer Voice Notes</h2>
                <div className="space-y-3">
                  {voiceNotes.map((note, i) => (
                    <div key={i} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-2">
                        <button className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div>
                          <p className="text-xs font-medium text-foreground">{campaign.farmerName}</p>
                          <p className="text-[10px] text-muted-foreground">{note.date}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{note.text}"</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* On-chain info */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4">On-Chain Details</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Program ID</span>
                    <a
                      href="https://explorer.solana.com/address/4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp?cluster=devnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-mono"
                    >
                      4k8UjX7...LSghp <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-foreground font-medium">Solana Devnet</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Instructions</span>
                    <span className="text-foreground font-medium">8 (invest, verify_milestone, release_funds, ...)</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-card shadow-card overflow-hidden sticky top-24"
              >
                <div className="p-4 bg-primary/5 border-b border-border">
                  <h3 className="font-display text-base font-bold text-foreground">Invest in This Farm</h3>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="font-bold text-foreground">{campaign.totalRaised} / {campaign.fundingGoal} SOL</span>
                    </div>
                    <div className="h-3 bg-border rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${percentFunded}%` }} transition={{ duration: 1 }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{percentFunded.toFixed(0)}% funded</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysRemaining} days left</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{campaign.investors} investors</span>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Token</label>
                    <div className="flex gap-2">
                      {(["SOL", "USDC"] as const).map((token) => (
                        <button
                          key={token}
                          onClick={() => setInvestToken(token)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            investToken === token ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className="w-full h-12 px-4 pr-16 rounded-lg border border-input bg-background text-foreground text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{investToken}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[0.1, 0.25, 0.5, 1].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setInvestAmount(amt.toString())}
                          className="flex-1 py-1.5 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {connected ? (
                    <Button
                      onClick={handleInvest}
                      disabled={!investAmount || parseFloat(investAmount) <= 0 || isInvesting}
                      className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 disabled:opacity-50"
                    >
                      {isInvesting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        `Invest ${investAmount || "0"} ${investToken}`
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-center text-muted-foreground">Connect your wallet to invest</p>
                      <div className="flex justify-center"><WalletMultiButton /></div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Risk Tier</span>
                      <span className={`font-bold ${campaign.riskTier === "Low" ? "text-primary" : campaign.riskTier === "Medium" ? "text-harvest-gold" : "text-destructive"}`}>
                        {campaign.riskTier}
                      </span>
                    </div>
                    <Link to={`/farm/${campaign.id}/insurance`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Shield className="w-3 h-3" />
                      View Yield Insurance Details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmCampaign;
