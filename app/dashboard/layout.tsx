"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { hasCompletedOnboarding } from "@/lib/api/profileApi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isSignedIn || !user?.id || !isLoaded) {
        setIsCheckingOnboarding(false);
        return;
      }

      // Check if user has explicitly marked onboarding as seen/skipped
      const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user.id}`);

      // If they've seen it before, don't redirect
      if (hasSeenOnboarding) {
        setIsCheckingOnboarding(false);
        return;
      }

      try {
        const completed = await hasCompletedOnboarding(user.id);

        // If they have a profile, mark onboarding as seen and don't redirect
        if (completed) {
          localStorage.setItem(`onboarding_seen_${user.id}`, 'true');
          setIsCheckingOnboarding(false);
          return;
        }

        // User doesn't have a profile yet - redirect to onboarding
        router.replace("/onboarding");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Don't block access if check fails
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isSignedIn, user?.id, isLoaded, router]);

  // Show loading screen while checking onboarding
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

        <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full blur-2xl opacity-20 animate-pulse" />
              <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
                Preparing Your Workspace
              </h2>
              <p className="text-sm text-muted-foreground">
                Setting up your personalized resume experience...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
