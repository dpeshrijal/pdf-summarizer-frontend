"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, User, CheckCircle, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/api/profileApi";
import { toast } from "sonner";

function OnboardingWelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);
  const paymentSuccess = searchParams.get('payment') === 'success';

  // Initialize profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      if (!isLoaded || !isSignedIn || !user?.id) {
        setIsInitializing(false);
        return;
      }

      try {
        const profileData = await getUserProfile(user.id);

        // If user already completed onboarding, redirect to dashboard
        if (profileData.hasProfile && profileData.profile?.onboardingComplete) {
          if (paymentSuccess) {
            toast.success("Payment successful! Your credits have been added.");
            router.replace('/dashboard?payment=success');
          } else {
            router.replace('/dashboard');
          }
          return;
        }

        // If profile doesn't exist or incomplete, create/ensure minimal profile exists
        if (!profileData.hasProfile) {
          console.log("Creating initial profile for user:", user.id);
          await saveUserProfile(user.id, {
            name: user.fullName || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            phone: "",
            location: "",
            linkedinUrl: "",
            githubUrl: "",
            portfolioUrl: "",
            customUrl: "",
            customUrlLabel: "",
          });
        }

        // Show payment success message if applicable
        if (paymentSuccess) {
          toast.success("Payment successful! Let's set up your profile to get started.");
        }

        setIsInitializing(false);
      } catch (error) {
        console.error("Error initializing profile:", error);
        setIsInitializing(false);
      }
    };

    initializeProfile();
  }, [isLoaded, isSignedIn, user?.id, user?.fullName, user?.firstName, user?.primaryEmailAddress, paymentSuccess, router]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 relative">
      {/* Floating Elements */}
      <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" />
      <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">Your credits have been added. Let's set up your profile to get started.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Sparkles className="h-10 w-10 text-primary-foreground animate-pulse" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                Resumi
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Let's set up your profile in 2 quick steps
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-background/60 backdrop-blur-sm border-2 border-border hover:border-primary/50 rounded-2xl p-8 space-y-4 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Professional Profile</h3>
                <p className="text-muted-foreground">
                  Add your contact info and professional links so they're always accurate
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-background/60 backdrop-blur-sm border-2 border-border hover:border-primary/50 rounded-2xl p-8 space-y-4 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Master Resume</h3>
                <p className="text-muted-foreground">
                  Upload your comprehensive resume with all your experience and skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-background/60 backdrop-blur-sm border-2 border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">What You'll Get</h3>
            <p className="text-muted-foreground">Everything you need to land your dream job</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">Generate in Seconds</div>
                <div className="text-sm text-muted-foreground">AI-powered resume tailored to each job</div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">ATS Optimized</div>
                <div className="text-sm text-muted-foreground">Beat applicant tracking systems</div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="font-semibold mb-1">Always Consistent</div>
                <div className="text-sm text-muted-foreground">Perfect formatting every time</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={() => router.push("/onboarding/profile")}
            className="text-lg px-10 py-7 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Takes less than 3 minutes • Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWelcome() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingWelcomeContent />
    </Suspense>
  );
}
