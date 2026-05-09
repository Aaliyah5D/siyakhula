import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import { MOCK_CAMPAIGNS } from "@/lib/constants";

const regions = ["All Regions", "Limpopo", "KwaZulu-Natal", "Mpumalanga", "Free State"];

const DiscoverFarms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCampaigns = MOCK_CAMPAIGNS.filter((c) => {
    const matchesSearch =
      c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegion === "All Regions" || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-24">
        <div className="container max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sprout className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Discover</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Discover Farm Campaigns
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse verified maize farm campaigns across South Africa. Invest directly via Solana.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by farmer name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-11 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Region
                </p>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedRegion === region
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Results */}
          <p className="text-xs text-muted-foreground mb-4">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16">
              <Sprout className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No campaigns match your search. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoverFarms;
