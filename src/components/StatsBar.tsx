import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Sprout, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total Invested", value: "12.4 SOL", icon: TrendingUp, suffix: "" },
  { label: "Active Campaigns", value: "4", icon: Sprout, suffix: "farms" },
  { label: "Farmers Funded", value: "3", icon: Users, suffix: "" },
  { label: "Avg. ROI", value: "18%", icon: BarChart3, suffix: "projected" },
];

const StatsBar: React.FC = () => {
  return (
    <div className="bg-card border-y border-border">
      <div className="container py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.label}
                {stat.suffix && <span className="text-muted-foreground/60 ml-1">{stat.suffix}</span>}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
