import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  TrendingUp,
  Sprout,
  ExternalLink,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MilestoneTracker from "@/components/MilestoneTracker";
import CropVerificationPanel from "@/components/CropVerificationPanel";
import VoiceStatusUpdate from "@/components/VoiceStatusUpdate";
import CollateralPledge from "@/components/CollateralPledge";
import { useProgram } from "@/hooks/useProgram";

const FarmerDashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const sdk = useProgram();
  const [solBalance, setSolBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (sdk && publicKey) {
        const result = await sdk.fetchSolBalance(publicKey);
        if (result.success) setSolBalance(result.data!);
      }
    };
    fetchBalance();
  }, [sdk, publicKey]);

  const farmerData = {
    name: "Thabo Mokoena",
    location: "Polokwane, Limpopo",
    season: "2026 Season",
    milestoneIndex: 3,
    fundsReceived: 1.35,
    totalFunding: 2.5,
    investors: 8,
    campaignStatus: "Funded",
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-24">
        <div className="container max-w-5xl">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Welcome back, {farmerData.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {farmerData.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {farmerData.season}</span>
                  {solBalance !== null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {solBalance.toFixed(4)} SOL
                    </span>
                  )}
                </div>
              </div>
              <span className="self-start px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {farmerData.campaignStatus}
              </span>
            </div>
          </motion.div>

          {/* On-chain info banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground font-medium">On-Chain Campaign (Devnet)</span>
            </div>
            <a
              href="https://explorer.solana.com/address/4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
            >
              Program: 4k8UjX7...LSghp <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[
              { label: "Funds Received", value: `${farmerData.fundsReceived} SOL`, icon: Wallet, color: "text-primary" },
              { label: "Total Funding", value: `${farmerData.totalFunding} SOL`, icon: TrendingUp, color: "text-leaf" },
              { label: "Investors", value: farmerData.investors.toString(), icon: Users, color: "text-sky" },
              { label: "Milestone", value: `${farmerData.milestoneIndex}/6`, icon: Sprout, color: "text-harvest-gold" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card shadow-card p-4"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-lg md:text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Milestone progress */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6 mb-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Campaign Progress</h2>
            <MilestoneTracker currentIndex={farmerData.milestoneIndex} />
          </motion.div>

          {/* Collateral Pledge - above Supplier Invoice / Crop Verification */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <CollateralPledge />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Status Update — ElevenLabs STT/TTS with AI summary */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <VoiceStatusUpdate farmerName={farmerData.name} />
            </motion.div>

            {/* Crop Verification */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <CropVerificationPanel />
            </motion.div>
          </div>

          {/* Investor list */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Your Investors</h2>
            <div className="space-y-3">
              {[
                { name: "Investor #1", amount: "0.5 SOL", date: "Jan 18, 2026" },
                { name: "Investor #2", amount: "0.3 SOL", date: "Jan 20, 2026" },
                { name: "Investor #3", amount: "0.25 SOL", date: "Jan 22, 2026" },
                { name: "Investor #4", amount: "0.15 SOL", date: "Jan 25, 2026" },
                { name: "Investor #5", amount: "0.2 SOL", date: "Feb 1, 2026" },
                { name: "Investor #6", amount: "0.1 SOL", date: "Feb 3, 2026" },
                { name: "Investor #7", amount: "0.15 SOL", date: "Feb 8, 2026" },
                { name: "Investor #8", amount: "0.15 SOL", date: "Feb 12, 2026" },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{inv.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{inv.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profit projection */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-xl border border-border bg-card shadow-card p-5 md:p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Profit Projection Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Expected Yield (tons)</label>
                <input type="number" defaultValue={25} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Maize Price (R/ton)</label>
                <input type="number" defaultValue={3800} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Farmer Payout</p>
                <p className="text-xl font-bold text-primary">R57,000</p>
                <p className="text-[10px] text-muted-foreground">(60% of R95,000 revenue)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmerDashboard;