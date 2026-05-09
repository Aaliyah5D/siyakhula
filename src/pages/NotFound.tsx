import React from "react";
import { Link } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sprout className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">404</h1>
        <p className="text-muted-foreground mb-6">
          This field hasn't been planted yet. Let's get you back to fertile ground.
        </p>
        <Link to="/">
          <Button className="h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
