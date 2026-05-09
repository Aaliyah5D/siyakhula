import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GetStartedModalProps {
  open: boolean;
  onClose: () => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    // Simulate magic link send
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setEmail("");
      setSending(false);
      setSent(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-soil/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-elegant overflow-hidden"
          >
            {/* Header gradient bar */}
            <div className="h-1.5 bg-gradient-primary" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8">
              {!sent ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Email Sign-in
                    </h2>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your email and we'll send you a secure magic link to sign in instantly.
                  </p>

                  <form onSubmit={handleSendMagicLink} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={sending || !email}
                      className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Magic Link...
                        </>
                      ) : (
                        <>
                          Send Magic Link
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-5 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No wallet needed. We secure your account automatically.
                    </p>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    We've sent a magic link to
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-4">{email}</p>
                  <p className="text-xs text-muted-foreground">
                    Click the link in your email to sign in. A secure wallet will be created automatically behind the scenes.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GetStartedModal;
