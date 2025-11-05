"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap, Crown, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState } from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'pro' | 'unlimited';
  creditsRemaining?: number;
}

export function UpgradeModal({ open, onClose, currentTier = 'free', creditsRemaining = 0 }: UpgradeModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!open) return null;

  const plans = [
    {
      name: 'Pro',
      price: '$19.95',
      period: 'per month',
      credits: '200 generations',
      features: [
        '200 resume generations per month',
        'Detailed match score breakdown',
        'Skills & experience analysis',
        'Priority processing',
        'Email support',
      ],
      icon: Zap,
      gradient: 'from-primary to-blue-600',
      disabled: currentTier === 'pro' || currentTier === 'unlimited',
      productId: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID,
    },
    {
      name: 'Unlimited',
      price: '$49.95',
      period: 'per month',
      credits: 'Unlimited generations',
      features: [
        'Unlimited resume generations',
        'Everything in Pro',
        'Fastest processing priority',
        'Advanced analytics',
        'Priority email support',
        'Early access to features',
      ],
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      disabled: currentTier === 'unlimited',
      productId: process.env.NEXT_PUBLIC_DODO_UNLIMITED_PRODUCT_ID,
    },
  ];

  const handleUpgrade = async (planName: string, productId: string | undefined) => {
    if (!productId) {
      toast.error("Product configuration error. Please contact support.");
      return;
    }

    try {
      setLoadingPlan(planName);

      // Call checkout API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName || user?.firstName || "Customer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Dodo Payments checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-background border rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4 w-full">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            {creditsRemaining === 0
              ? "You've used all your credits this month. Upgrade to continue generating resumes!"
              : `You have ${creditsRemaining} credits remaining. Upgrade for more!`
            }
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden border-2 ${
                  plan.popular
                    ? 'border-primary shadow-xl shadow-primary/20'
                    : 'border-border'
                } ${plan.disabled ? 'opacity-60' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}

                <div className="p-6">
                  {/* Icon and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.credits}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.disabled || loadingPlan !== null}
                    onClick={() => handleUpgrade(plan.name, plan.productId)}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : plan.disabled ? (
                      currentTier === plan.name.toLowerCase()
                        ? 'Current Plan'
                        : 'Not Available'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day money-back guarantee.</p>
          <p>Cancel anytime, no questions asked.</p>
        </div>
      </div>
    </div>
  );
}
