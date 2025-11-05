"use client";

import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PricingPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const tiers = [
    {
      name: "Free",
      icon: Sparkles,
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Resumi",
      features: [
        "3 resume generations per month",
        "AI-powered resume tailoring",
        "ATS-optimized formatting",
        "Cover letter generation",
        "Match score analysis",
        "PDF export",
        "Generation history",
      ],
      cta: "Get Started Free",
      popular: false,
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      productId: null, // Free plan - no product ID
    },
    {
      name: "Pro",
      icon: Zap,
      price: "$19.95",
      period: "per month",
      description: "For active job seekers",
      features: [
        "200 resume generations per month",
        "Everything in Free",
        "Detailed match score breakdown",
        "Skills, experience & education analysis",
        "Full generation history access",
        "Priority processing",
        "Email support",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      gradient: "from-primary/20 to-blue-600/20",
      iconColor: "text-primary",
      borderColor: "border-primary",
      productId: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID,
    },
    {
      name: "Unlimited",
      icon: Crown,
      price: "$49.95",
      period: "per month",
      description: "For power users & career changers",
      features: [
        "Unlimited resume generations",
        "Everything in Pro",
        "No monthly limits",
        "Fastest processing priority",
        "Advanced analytics",
        "Priority email support",
        "Early access to new features",
      ],
      cta: "Go Unlimited",
      popular: false,
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
      productId: process.env.NEXT_PUBLIC_DODO_UNLIMITED_PRODUCT_ID,
    },
  ];

  const handlePlanSelection = async (tierName: string, productId: string | null | undefined) => {
    // Free plan - just redirect to dashboard
    if (tierName === "Free") {
      if (isSignedIn) {
        router.push("/dashboard");
      } else {
        router.push("/sign-up");
      }
      return;
    }

    // Paid plans - need to be signed in
    if (!isSignedIn) {
      toast.error("Please sign up to choose your plan");
      router.push("/sign-up");
      return;
    }

    if (!productId) {
      toast.error("Product configuration error. Please contact support.");
      return;
    }

    try {
      setLoadingPlan(tierName);

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background textures - same as landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <span className="text-lg font-bold text-primary-foreground">R</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Resumi
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  Pricing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <Badge className="mb-4 md:mb-6 px-4 py-1.5 text-xs md:text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent animate-gradient">
              Perfect Plan
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade as you grow. All plans include our core AI-powered resume tailoring.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden border-2 ${
                  tier.popular
                    ? "border-primary shadow-2xl shadow-primary/20 scale-105"
                    : tier.borderColor
                } bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Icon and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${tier.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{tier.name}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-8 ${
                      tier.popular
                        ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePlanSelection(tier.name, tier.productId)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === tier.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tier.popular ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${tier.popular ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! If you're not satisfied within the first 7 days, we'll give you a full refund, no questions asked.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades apply at your next billing cycle.
              </p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-card/50 to-blue-500/10 backdrop-blur-sm border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our team is here to help you choose the right plan and answer any questions you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Contact Sales</Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
