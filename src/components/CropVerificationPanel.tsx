import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, CheckCircle2, AlertTriangle, Loader2, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VerificationResult {
  stage: string;
  confidence: number;
  notes: string;
}

const CropVerificationPanel: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI analysis (in production, send to GPT-4 Vision)
    setTimeout(() => {
      setResult({
        stage: "Seedling Phase",
        confidence: 87,
        notes: "Healthy seedling emergence detected across visible rows. Estimated 2-3 weeks since planting. Uniform spacing observed. No visible stress or pest damage.",
      });
      setAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Eye className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">AI Crop Verification</h3>
      </div>

      <div className="p-5">
        {!uploadedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Upload crop photo for AI verification
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Drag & drop or click to browse. JPG, PNG up to 10MB.
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Button
                variant="outline"
                className="rounded-lg border-primary text-primary hover:bg-primary/5 hover:text-primary"
                asChild
              >
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo or Upload
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
              {preview && (
                <img src={preview} alt="Crop" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setPreview(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 px-2 py-1 bg-foreground/70 text-background text-xs rounded-md hover:bg-foreground/90"
              >
                Remove
              </button>
            </div>

            {/* Analyze button */}
            {!result && !analyzing && (
              <Button
                onClick={handleAnalyze}
                className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold"
              >
                <Eye className="w-4 h-4 mr-2" />
                Analyze with AI
              </Button>
            )}

            {/* Analyzing state */}
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center"
              >
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Verifying your seedlings...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  GPT-4 Vision is analyzing your crop photo
                </p>
              </motion.div>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div
                    className={`p-4 rounded-lg border ${
                      result.confidence >= 70
                        ? "bg-primary/5 border-primary/20"
                        : "bg-harvest-gold/10 border-harvest-gold/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {result.confidence >= 70 ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-harvest-gold" />
                      )}
                      <span className="text-sm font-bold text-foreground">
                        Stage Detected: {result.stage}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-bold text-primary">{result.confidence}%</span>
                      </div>
                      <Progress value={result.confidence} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.notes}
                    </p>
                  </div>

                  {result.confidence >= 70 && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-xs text-primary font-medium">
                        Milestone verified! 20% of funds (0.45 SOL) released to your wallet.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropVerificationPanel;
