import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import Index from "./pages/Index";
import FarmerRegister from "./pages/FarmerRegister";
import FarmerDashboard from "./pages/FarmerDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import FarmCampaign from "./pages/FarmCampaign";
import InsurancePage from "./pages/InsurancePage";
import DiscoverFarms from "./pages/DiscoverFarms";
import NotFound from "./pages/NotFound";

import "@solana/wallet-adapter-react-ui/styles.css";

const App: React.FC = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/farmer/register" element={<FarmerRegister />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/investor/dashboard" element={<InvestorDashboard />} />
            <Route path="/farm/:id" element={<FarmCampaign />} />
            <Route path="/farm/:id/insurance" element={<InsurancePage />} />
            <Route path="/discover" element={<DiscoverFarms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
