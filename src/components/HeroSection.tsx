import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sprout, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farmland.jpg";
import GetStartedModal from "./GetStartedModal";

const HeroSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="South African farmland"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/40"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative container pt-24 pb-16 md:pt-0 md:pb-0">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm mb-6">
                <Sprout className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-primary-foreground/90">
                  Built on Solana — Powered by AI
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.1] mb-5">
                Siyakhula
                <span className="block text-accent text-2xl md:text-3xl lg:text-4xl font-sans font-medium mt-2">
                  We Are Growing
                </span>
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/75 leading-relaxed max-w-lg mb-8">
                AI-verified crop funding on Solana. Invest in African soil. 
                Share in the harvest. Milestone-based, transparent, fair.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto h-14 px-8 bg-primary-foreground text-soil font-semibold text-base rounded-xl hover:bg-primary-foreground/90 transition-all hover:shadow-glow"
                >
                  <Sprout className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link to="/investor/dashboard">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-8 border-primary-foreground/30 text-primary-foreground font-semibold text-base rounded-xl bg-primary-foreground/5 hover:bg-primary-foreground/10 hover:text-primary-foreground backdrop-blur-sm"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    I'm an Investor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path
              d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
              fill="hsl(40 20% 98%)"
            />
          </svg>
        </div>
      </section>

      <GetStartedModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default HeroSection;
