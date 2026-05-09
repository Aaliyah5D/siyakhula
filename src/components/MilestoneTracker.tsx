import React from "react";
import { motion } from "framer-motion";
import { Check, Clock, Lock, Sprout, Tractor, Leaf, Sun, Wheat } from "lucide-react";
import { MILESTONES } from "@/lib/constants";

interface MilestoneTrackerProps {
  currentIndex: number;
  compact?: boolean;
}

const milestoneIcons = [Tractor, Sprout, Leaf, Sun, Wheat, Check];

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ currentIndex, compact = false }) => {
  return (
    <div className={compact ? "" : "py-4"}>
      {/* Progress bar */}
      <div className="relative flex items-center justify-between mb-2">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-border rounded-full" />
        {/* Filled track */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min((currentIndex / (MILESTONES.length - 1)) * 100, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {MILESTONES.map((milestone, i) => {
          const Icon = milestoneIcons[i];
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLocked = i > currentIndex;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isComplete
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-accent border-primary text-primary animate-pulse-soft"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              {!compact && (
                <span
                  className={`mt-2 text-[10px] md:text-xs text-center max-w-[70px] md:max-w-[90px] leading-tight font-medium ${
                    isComplete || isCurrent ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {milestone.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {currentIndex < MILESTONES.length
              ? `Next: ${MILESTONES[currentIndex]?.name} — ${MILESTONES[currentIndex]?.trigger}`
              : "All milestones complete!"}
          </span>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;
