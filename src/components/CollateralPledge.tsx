import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLLATERAL_TYPES = [
  "Land Rights Deed",
  "Tractor/Equipment Lien",
  "Future Harvest Guarantee",
] as const;

type CollateralType = (typeof COLLATERAL_TYPES)[number];

interface CollateralPledgeProps {
  onStatusChange?: (pledged: boolean) => void;
}

const CollateralPledge: React.FC<CollateralPledgeProps> = ({ onStatusChange }) => {
  const [collateralType, setCollateralType] = useState<CollateralType | "">("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        setVerified(false);
      }
    },
    []
  );

  const handleVerify = () => {
    if (!collateralType || !uploadedFile) return;
    setVerifying(true);
    // Simulate Gemini AI verification
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      onStatusChange?.(true);
    }, 3000);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          Collateral Pledge
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Collateral Type Dropdown */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
            Collateral Type
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            >
              <span
                className={
                  collateralType
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                }
              >
                {collateralType || "Select collateral type..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 w-full mt-1 rounded-xl border border-border bg-card shadow-elegant overflow-hidden"
                >
                  {COLLATERAL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setCollateralType(type);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-sm text-left transition-colors hover:bg-primary/5 ${
                        collateralType === type
                          ? "text-primary font-medium bg-primary/5"
                          : "text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
            Collateral Documentation
          </label>
          {!uploadedFile ? (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Upload Collateral Documentation
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, or DOC up to 10MB
                </p>
              </div>
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {uploadedFile.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setVerified(false);
                  onStatusChange?.(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Gemini AI caption */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gemini AI will verify these documents.
          </p>
        </div>

        {/* Verify / Status */}
        {!verified ? (
          <Button
            onClick={handleVerify}
            disabled={!collateralType || !uploadedFile || verifying}
            className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gemini AI Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Submit Collateral Pledge
              </>
            )}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">
                Collateral Verified
              </p>
              <p className="text-[10px] text-muted-foreground">
                {collateralType} verified by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CollateralPledge;
