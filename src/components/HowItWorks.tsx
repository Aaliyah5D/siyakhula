import React from "react";
import { motion } from "framer-motion";
import { Mic, Lock, Eye, Wallet } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Voice Register",
    description: "Farmers register by simply speaking. Our AI understands their farm details, land size, and funding needs.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Lock,
    title: "Smart Contract Locks Funds",
    description: "Investors deposit SOL or USDC into a Solana escrow. Funds are locked and released only when milestones are verified.",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: Eye,
    title: "AI Verifies Growth",
    description: "Farmers upload crop photos. GPT-4 Vision analyzes growth stages automatically, triggering milestone fund releases.",
    color: "bg-harvest-gold/20 text-earth",
  },
  {
    icon: Wallet,
    title: "Share the Harvest",
    description: "At harvest, profits are split between farmer and investors per the smart contract terms. Fair and transparent.",
    color: "bg-primary/10 text-primary",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            From Voice to Harvest in 4 Steps
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            A seamless journey from farmer registration to shared profits, powered by AI and Solana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative z-10 inline-flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
