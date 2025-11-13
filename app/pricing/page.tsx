"use client";

import { Check, Sparkles, Zap, Crown, Rocket, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function PricingContent() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Auto-trigger checkout after signup
  useEffect(() => {
    const checkoutProductId = searchParams.get('checkout');

    if (isSignedIn && checkoutProductId && user) {
      // User just signed up and needs to complete checkout
      const triggerCheckout = async () => {
        try {
          setLoadingPlan('auto-checkout');

          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: checkoutProductId,
              email: user.emailAddresses[0]?.emailAddress,
              name: user.fullName || user.firstName || "Customer",
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to create checkout session");
          }

          // Redirect to Dodo Payments checkout
          window.location.href = data.checkoutUrl;
        } catch (error) {
          console.error("Auto-checkout error:", error);
          toast.error("Unable to start checkout. Please try clicking the pack again.");
          setLoadingPlan(null);
          // Remove checkout param from URL
          router.replace('/pricing');
        }
      };

      triggerCheckout();
    }
  }, [isSignedIn, searchParams, user, router]);

  const creditPacks = [
    {
      name: "Starter Pack",
      icon: Sparkles,
      credits: 20,
      price: "$4.95",
      pricePerCredit: "$0.25",
      description: "Perfect for getting started",
      features: [
        "20 resume & cover letter generations",
        "AI-powered resume tailoring",
        "ATS-optimized formatting",
        "Match score analysis",
        "PDF export with templates",
        "Generation history access",
        "Credits never expire",
      ],
      cta: "Buy Starter Pack",
      popular: false,
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      badgeText: null,
      savings: null,
      productId: process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID,
    },
    {
      name: "Popular Pack",
      icon: Zap,
      credits: 50,
      price: "$9.95",
      pricePerCredit: "$0.20",
      description: "Best value for active job seekers",
      features: [
        "50 resume & cover letter generations",
        "Everything in Starter Pack",
        "Detailed match score breakdown",
        "Skills, experience & education analysis",
        "Priority processing",
        "Email support",
        "20% savings per credit",
      ],
      cta: "Buy Popular Pack",
      popular: true,
      gradient: "from-primary/20 to-blue-600/20",
      iconColor: "text-primary",
      borderColor: "border-primary",
      badgeText: "BEST VALUE",
      savings: "Save 20%",
      productId: process.env.NEXT_PUBLIC_DODO_POPULAR_PRODUCT_ID,
    },
    {
      name: "Professional Pack",
      icon: Crown,
      credits: 150,
      price: "$19.95",
      pricePerCredit: "$0.13",
      description: "For serious career changers",
      features: [
        "150 resume & cover letter generations",
        "Everything in Popular Pack",
        "Fastest processing priority",
        "Advanced analytics dashboard",
        "Priority email support",
        "Early access to new features",
        "47% savings per credit",
      ],
      cta: "Buy Professional Pack",
      popular: false,
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
      badgeText: "MOST CREDITS",
      savings: "Save 47%",
      productId: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID,
    },
    {
      name: "Ultimate Pack",
      icon: Rocket,
      credits: 500,
      price: "$49.95",
      pricePerCredit: "$0.10",
      description: "Maximum value for power users",
      features: [
        "500 resume & cover letter generations",
        "Everything in Professional Pack",
        "VIP processing priority",
        "Dedicated support channel",
        "Custom template requests",
        "Lifetime feature access",
        "60% savings per credit",
      ],
      cta: "Buy Ultimate Pack",
      popular: false,
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      badgeText: "ULTIMATE VALUE",
      savings: "Save 60%",
      productId: process.env.NEXT_PUBLIC_DODO_ULTIMATE_PRODUCT_ID,
    },
  ];

  const handlePlanSelection = async (packName: string, productId: string | null | undefined) => {
    if (!productId) {
      toast.error("Product configuration error. Please contact support.");
      return;
    }

    // If not signed in, redirect to signup with pack intent
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=${encodeURIComponent(`/pricing?checkout=${productId}`)}`);
      return;
    }

    try {
      setLoadingPlan(packName);

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
      {/* Background textures */}
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
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <Button size="sm">{isSignedIn ? "Dashboard" : "Sign In"}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 md:mb-6 px-4 py-1.5 text-xs md:text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            One-Time Purchase • Credits Never Expire
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
              Credit Pack
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Buy credits once, use them whenever you need. No subscriptions, no monthly fees.
          </p>

          {/* Value Proposition Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Get started free with 3 credits • No credit card required</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto mb-12">
          {creditPacks.map((pack) => {
            const Icon = pack.icon;
            return (
              <Card
                key={pack.name}
                className={`relative overflow-hidden border-2 ${
                  pack.popular
                    ? "border-primary shadow-2xl shadow-primary/20 lg:scale-105"
                    : pack.borderColor
                } bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {pack.badgeText && (
                  <div className={`absolute top-0 right-0 ${pack.popular ? 'bg-gradient-to-r from-primary to-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg`}>
                    {pack.badgeText}
                  </div>
                )}

                <div className="p-5 md:p-6">
                  {/* Icon and Credits */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${pack.gradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`h-6 w-6 ${pack.iconColor}`} />
                    </div>
                    {pack.savings && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                        {pack.savings}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-1">{pack.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{pack.description}</p>

                  {/* Price and Credits */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold tracking-tight">{pack.price}</span>
                      <span className="text-muted-foreground text-sm">one-time</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary font-semibold">{pack.credits} Credits</span>
                      <span className="text-muted-foreground">{pack.pricePerCredit}/credit</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-6 ${
                      pack.popular
                        ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                        : ""
                    }`}
                    variant={pack.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePlanSelection(pack.name, pack.productId)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === pack.name || loadingPlan === 'auto-checkout' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      pack.cta
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-2">
                    {pack.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            pack.popular ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Check
                            className={`h-2.5 w-2.5 ${pack.popular ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Free Tier Banner */}
        <Card className="max-w-4xl mx-auto mb-16 p-6 md:p-8 bg-gradient-to-br from-blue-500/10 via-card/50 to-cyan-500/10 backdrop-blur-sm border-blue-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Try Resumi Free</h3>
              </div>
              <p className="text-muted-foreground">
                Get 1 free credit to test our AI-powered resume tailoring. No credit card required, no subscription needed.
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-500/30 hover:bg-blue-500/10"
              onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")}
            >
              {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Do credits expire?</h3>
              <p className="text-sm text-muted-foreground">
                No! Your credits never expire. Buy them once and use them whenever you need, even years later.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Can I buy more credits later?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can purchase additional credit packs anytime. Your credits will stack and you can use any pack's benefits.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! If you're not satisfied, contact us within 7 days for a full refund of unused credits, no questions asked.
              </p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
              <h3 className="font-semibold mb-2">How do I track my credit usage?</h3>
              <p className="text-sm text-muted-foreground">
                Your remaining credits are always visible in your dashboard. You'll also get notifications when you're running low.
              </p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-card/50 to-blue-500/10 backdrop-blur-sm border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need help choosing?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our team is here to help you find the perfect credit pack for your job search needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:support@resumi.cv">Contact Support</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
