import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, Wheat, ShieldCheck, AlertCircle } from "lucide-react";
import MilestoneTracker from "./MilestoneTracker";

interface Campaign {
  id: string;
  farmerName: string;
  location: string;
  cropType: string;
  landHectares: number;
  fundingGoal: number;
  totalRaised: number;
  milestoneIndex: number;
  status: string;
  profitSplitBps: number;
  investors: number;
  riskTier: string;
  lastUpdate: string;
  description: string;
  collateralVerified?: boolean;
  collateralType?: string | null;
  invoiceUploaded?: boolean;
}

interface CampaignCardProps {
  campaign: Campaign;
  index?: number;
}

/** Derive display status: both collateral & invoice required for "Awaiting Funding" */
function deriveDisplayStatus(campaign: Campaign): string {
  if (campaign.status === "Funded" || campaign.status === "Harvested") return campaign.status;
  if (campaign.collateralVerified && campaign.invoiceUploaded) return "Awaiting Funding";
  if (!campaign.collateralVerified || !campaign.invoiceUploaded) return "Pending Documents";
  return campaign.status;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, index = 0 }) => {
  const percentFunded = Math.min((campaign.totalRaised / campaign.fundingGoal) * 100, 100);
  const farmerSharePct = campaign.profitSplitBps / 100;
  const displayStatus = deriveDisplayStatus(campaign);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/farm/${campaign.id}`} className="block group">
        <div className="rounded-xl border border-border bg-card shadow-card hover:shadow-elegant transition-all duration-300 overflow-hidden">
          {/* Header stripe */}
          <div className="h-2 bg-gradient-primary" />

          <div className="p-5 md:p-6">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wheat className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    {campaign.farmerName}'s Farm
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {campaign.location}
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  displayStatus === "Awaiting Funding"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : displayStatus === "Funded"
                    ? "bg-primary/10 text-primary"
                    : displayStatus === "Pending Documents"
                    ? "bg-harvest-gold/20 text-earth"
                    : "bg-harvest-gold/20 text-earth"
                }`}
              >
                {displayStatus}
              </span>
            </div>

            {/* Collateral Verified Badge */}
            {campaign.collateralVerified ? (
              <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-leaf/10 border border-leaf/20 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
                <span className="text-[11px] font-semibold text-leaf">Collateral Verified</span>
              </div>
            ) : (
              <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-harvest-gold/10 border border-harvest-gold/20 w-fit">
                <AlertCircle className="w-3.5 h-3.5 text-harvest-gold" />
                <span className="text-[11px] font-semibold text-earth-light">Collateral Pending</span>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Land</p>
                <p className="text-sm font-bold text-foreground">{campaign.landHectares} ha</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Split</p>
                <p className="text-sm font-bold text-foreground">{farmerSharePct}% farmer</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</p>
                <p className={`text-sm font-bold ${
                  campaign.riskTier === "Low" ? "text-primary" : campaign.riskTier === "Medium" ? "text-harvest-gold" : "text-destructive"
                }`}>
                  {campaign.riskTier}
                </p>
              </div>
            </div>

            {/* Milestone tracker */}
            <MilestoneTracker currentIndex={campaign.milestoneIndex} compact />

            {/* Funding progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{campaign.totalRaised} SOL raised</span>
                <span className="font-bold text-primary">{percentFunded.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentFunded}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {campaign.investors} investors
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Goal: {campaign.fundingGoal} SOL
                </span>
              </div>
            </div>

            {/* Last update */}
            <p className="mt-3 text-[11px] text-muted-foreground italic border-t border-border pt-3">
              {campaign.lastUpdate}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CampaignCard;
