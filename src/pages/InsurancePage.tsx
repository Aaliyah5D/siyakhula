import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Mic,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MOCK_CAMPAIGNS } from "@/lib/constants";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

const InsurancePage: React.FC = () => {
  const { id } = useParams();
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0];

  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    humidity: 62,
    rainfall: 45,
    windSpeed: 12,
    condition: "Partly Cloudy",
  });
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");

  useEffect(() => {
    // Simulate fetching weather data from Open-Meteo API
    const rainfallThreshold = 30; // mm per week
    if (weather.rainfall < rainfallThreshold) {
      setRiskLevel("high");
    } else if (weather.rainfall < rainfallThreshold * 1.5) {
      setRiskLevel("medium");
    } else {
      setRiskLevel("low");
    }
  }, [weather]);

  const insuranceModel = [
    {
      scenario: "Full Harvest",
      description: "Crop reaches full maturity with expected yield",
      farmerGets: "60% of revenue (per profit split)",
      investorGets: "40% of revenue + original investment return",
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/5 border-primary/20",
    },
    {
      scenario: "Partial Loss",
      description: "Crop yields 30-70% of expected output",
      farmerGets: "Proportional share of reduced revenue + 10% labor compensation from remaining escrow",
      investorGets: "Proportional share of reduced revenue based on investment",
      icon: AlertTriangle,
      color: "text-harvest-gold",
      bgColor: "bg-harvest-gold/5 border-harvest-gold/20",
    },
    {
      scenario: "Total Crop Failure",
      description: "Drought, flood, or pest destroys entire crop",
      farmerGets: "10% of total escrow as labor compensation",
      investorGets: "90% of remaining escrow returned proportionally",
      icon: CloudRain,
      color: "text-destructive",
      bgColor: "bg-destructive/5 border-destructive/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-24">
        <div className="container max-w-4xl">
          {/* Back link */}
          <Link
            to={`/farm/${campaign.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaign
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Yield Insurance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Loss Sharing & Yield Insurance
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Siyakhula's smart contract ensures fair treatment for both farmers and investors, 
              even when nature doesn't cooperate. Here's how risk is shared.
            </p>
          </motion.div>

          {/* Weather panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card shadow-card p-5 md:p-6 mb-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky" />
              Weather for {campaign.location}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Temperature", value: `${weather.temperature}°C`, icon: Thermometer, color: "text-harvest-gold" },
                { label: "Humidity", value: `${weather.humidity}%`, icon: Droplets, color: "text-sky" },
                { label: "Rainfall (7d)", value: `${weather.rainfall}mm`, icon: CloudRain, color: "text-primary" },
                { label: "Wind", value: `${weather.windSpeed} km/h`, icon: Wind, color: "text-muted-foreground" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/50 text-center">
                  <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
                  <p className="text-base font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Crop stress indicator */}
            <div
              className={`p-4 rounded-lg border ${
                riskLevel === "low"
                  ? "bg-primary/5 border-primary/20"
                  : riskLevel === "medium"
                  ? "bg-harvest-gold/5 border-harvest-gold/20"
                  : "bg-destructive/5 border-destructive/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {riskLevel === "low" ? (
                  <Sun className="w-4 h-4 text-primary" />
                ) : riskLevel === "medium" ? (
                  <AlertTriangle className="w-4 h-4 text-harvest-gold" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${
                    riskLevel === "low"
                      ? "text-primary"
                      : riskLevel === "medium"
                      ? "text-harvest-gold"
                      : "text-destructive"
                  }`}
                >
                  Crop Stress: {riskLevel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {riskLevel === "low"
                  ? "Rainfall levels are adequate for maize growth in this region. No crop stress detected."
                  : riskLevel === "medium"
                  ? "Rainfall is slightly below optimal for maize. Monitor closely over next 2 weeks."
                  : "Rainfall critically low. Maize crop at risk of drought stress. Irrigation recommended."}
              </p>
            </div>
          </motion.div>

          {/* Insurance model */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <h2 className="font-display text-lg font-bold text-foreground">
              How Loss Sharing Works
            </h2>

            {insuranceModel.map((model, i) => (
              <div
                key={model.scenario}
                className={`rounded-xl border p-5 ${model.bgColor}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${model.color} bg-background/50 flex items-center justify-center`}>
                    <model.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{model.scenario}</h3>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background/60">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Farmer Receives
                    </p>
                    <p className="text-sm text-foreground">{model.farmerGets}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Investor Receives
                    </p>
                    <p className="text-sm text-foreground">{model.investorGets}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Crop failure declaration */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 md:p-6 mb-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Declare Crop Failure
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              If your crop has failed due to drought, flooding, or other natural causes, 
              you can declare a crop failure via voice. This triggers the loss-sharing smart 
              contract after admin verification.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border">
              <Mic className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Voice Declaration</p>
                <p className="text-xs text-muted-foreground">
                  Say something like: "This season's crop failed due to drought"
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Crop failure must be verified by an admin before loss-sharing is triggered. 
              The farmer retains 10% of escrow as labor compensation.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-muted/50 p-5 md:p-6"
          >
            <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Yield Insurance Disclaimer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Siyakhula's yield insurance model is enforced by on-chain smart contract logic. 
              All fund distributions are automated and transparent. This is not traditional 
              insurance — it is a programmatic loss-sharing mechanism. Investors should be aware 
              that agricultural investment carries inherent risk. Past performance of a farm does 
              not guarantee future yields. The 10% labor compensation for farmers in crop failure 
              scenarios is designed to prevent farmer destitution and is a core ethical principle 
              of the Siyakhula protocol.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InsurancePage;
