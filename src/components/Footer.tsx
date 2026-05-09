import React from "react";
import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-soil text-primary-foreground/80">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-primary-foreground">
                Siyakhula
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Bridging global capital and South African soil — turning a farmer's voice into a blockchain-verified investment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/farmer/register" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Farmer Registration</Link></li>
              <li><Link to="/investor/dashboard" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Investor Dashboard</Link></li>
              <li><Link to="/discover" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Discover Farms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">
              Technology
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-primary-foreground/60">Solana Blockchain</span></li>
              <li><span className="text-sm text-primary-foreground/60">ElevenLabs Voice AI</span></li>
              <li><span className="text-sm text-primary-foreground/60">GPT-4 Vision</span></li>
              <li><span className="text-sm text-primary-foreground/60">IPFS Storage</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">
              Hackathon
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-primary-foreground/60">dev3pack Hackathon 2026</span></li>
              <li><span className="text-sm text-primary-foreground/60">Built on Solana Devnet</span></li>
              <li><span className="text-sm text-primary-foreground/60">Focused on Maize crop</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            &copy; 2026 Siyakhula. Built with purpose for South African farmers.
          </p>
          <p className="text-xs text-primary-foreground/40">
            "Siyakhula" — Zulu for "We are growing"
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
