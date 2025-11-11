"use client";

import { Button } from "@/components/ui/button";
import { X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  creditsRemaining?: number;
}

export function UpgradeModal({ open, onClose, creditsRemaining = 0 }: UpgradeModalProps) {
  const router = useRouter();

  if (!open) return null;

  const handleBuyCredits = () => {
    router.push('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-background border rounded-xl shadow-2xl max-w-md m-4 w-full">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-blue-600/10 border-b p-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {creditsRemaining === 0 ? "Out of Credits!" : "Need More Credits?"}
            </h2>
            <p className="text-muted-foreground">
              {creditsRemaining === 0
                ? "You've used all your credits. Purchase more to continue generating resumes!"
                : `You have ${creditsRemaining} credits remaining. Get more to keep going!`
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Credits never expire</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Buy once, use whenever you need
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Best value at higher tiers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save up to 60% per credit with larger packs
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-base"
              onClick={handleBuyCredits}
            >
              View Credit Packs
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              Maybe Later
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-4 text-center text-xs text-muted-foreground bg-muted/20">
          <p>Starting at just $4.95 for 20 credits</p>
        </div>
      </div>
    </div>
  );
}
