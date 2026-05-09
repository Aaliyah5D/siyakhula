import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  Sprout,
  BarChart3,
  Search,
  SlidersHorizontal,
  Volume2,
  MapPin,
  Wheat,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import MilestoneTracker from "@/components/MilestoneTracker";
import { MOCK_CAMPAIGNS } from "@/lib/constants";
import { useProgram } from "@/hooks/useProgram";

const InvestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"portfolio" | "discover">("portfolio");
  const [searchQuery, setSearchQuery] = useState("");
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

  const portfolioStats = {
    totalInvested: "3.2 SOL",
    activeFarms: 2,
    projectedReturns: "+0.58 SOL",
    realizedReturns: "+0.12 SOL",
  };

  const myInvestments = MOCK_CAMPAIGNS.slice(0, 2);
  const discoverableFarms = MOCK_CAMPAIGNS.filter((c) =>
    c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-24">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Investor Dashboard
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">
                Track your investments and discover new farm campaigns.
              </p>
              {solBalance !== null && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Balance: {solBalance.toFixed(4)} SOL
                </span>
              )}
            </div>
          </motion.div>

          {/* On-chain program info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground font-medium">Siyakhula Program (Devnet)</span>
            </div>
            <a
              href="https://explorer.solana.com/address/4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
            >
              4k8UjX74M3hbkLu...LSghp <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[
              { label: "Total Invested", value: portfolioStats.totalInvested, icon: Wallet, color: "text-primary" },
              { label: "Active Farms", value: portfolioStats.activeFarms.toString(), icon: Sprout, color: "text-leaf" },
              { label: "Projected Returns", value: portfolioStats.projectedReturns, icon: TrendingUp, color: "text-harvest-gold" },
              { label: "Realized Returns", value: portfolioStats.realizedReturns, icon: BarChart3, color: "text-sky" },
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

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 max-w-xs">
            {(["portfolio", "discover"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "portfolio" ? "My Portfolio" : "Discover Farms"}
              </button>
            ))}
          </div>

          {activeTab === "portfolio" ? (
            <div className="space-y-6">
              <h2 className="font-display text-lg font-bold text-foreground">Active Investments</h2>

              {myInvestments.map((farm, i) => (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Link to={`/farm/${farm.id}`} className="block group">
                    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elegant transition-all">
                      <div className="h-1.5 bg-gradient-primary" />
                      <div className="p-5 md:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Wheat className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{farm.farmerName}'s Maize Farm</h3>
                                {farm.collateralVerified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-leaf/10 border border-leaf/20">
                                    <ShieldCheck className="w-3 h-3 text-leaf" />
                                    <span className="text-[10px] font-semibold text-leaf">Collateral Verified</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />{farm.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{(farm.totalRaised * 0.3).toFixed(2)} SOL</p>
                            <p className="text-[10px] text-muted-foreground">Your investment</p>
                          </div>
                        </div>

                        <MilestoneTracker currentIndex={farm.milestoneIndex} compact />

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{farm.lastUpdate}</span>
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                              View <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Projected ROI</span>
                            <span className="text-sm font-bold text-primary">+18.2%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search farms by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {discoverableFarms.map((campaign, i) => (
                  <CampaignCard key={campaign.id} campaign={campaign} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InvestorDashboard;
