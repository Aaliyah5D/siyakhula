import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CampaignCard from "./CampaignCard";
import { MOCK_CAMPAIGNS } from "@/lib/constants";

const FeaturedCampaigns: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-12 gap-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              Active Campaigns
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Invest in Growing Farms
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Browse verified farm campaigns and invest directly. Every milestone is AI-verified on-chain.
            </p>
          </div>
          <Link to="/discover">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 hover:text-primary rounded-xl">
              View All Farms
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {MOCK_CAMPAIGNS.slice(0, 4).map((campaign, i) => (
            <CampaignCard key={campaign.id} campaign={campaign} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
