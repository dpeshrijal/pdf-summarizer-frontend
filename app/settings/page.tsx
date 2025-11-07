"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, ArrowLeft, FileText, CreditCard, Calendar, CheckCircle2 } from "lucide-react";
import { getUserProfile, saveUserProfile } from "@/lib/api/profileApi";
import { getRemainingCredits } from "@/lib/api/subscriptionApi";
import type { UserProfileInput } from "@/lib/types/userProfile";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState<UserProfileInput>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    customUrl: "",
    customUrlLabel: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await getUserProfile(user.id);
      if (response.hasProfile && response.profile) {
        setUserProfile(response.profile);
        setFormData({
          name: response.profile.name,
          email: response.profile.email,
          phone: response.profile.phone || "",
          location: response.profile.location || "",
          linkedinUrl: response.profile.linkedinUrl || "",
          githubUrl: response.profile.githubUrl || "",
          portfolioUrl: response.profile.portfolioUrl || "",
          customUrl: response.profile.customUrl || "",
          customUrlLabel: response.profile.customUrlLabel || "",
        });
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDisplay = (tier: string = 'free') => {
    switch (tier) {
      case 'pro':
        return { name: 'Pro', color: 'bg-primary' };
      case 'unlimited':
        return { name: 'Unlimited', color: 'bg-purple-500' };
      default:
        return { name: 'Free', color: 'bg-blue-500' };
    }
  };

  const getStatusDisplay = (status: string = 'active') => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
      case 'paused':
        return { text: 'Paused', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' };
      case 'past_due':
        return { text: 'Past Due', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20' };
      default:
        return { text: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await saveUserProfile(user.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Resumi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-base text-foreground/70 mt-1">Manage your professional profile and subscription</p>
        </div>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription className="text-foreground/60">Manage your plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div>
              <p className="text-sm font-medium text-foreground/70 mb-2">Current Plan</p>
              <div className="flex items-center gap-3">
                <Badge className={`${getTierDisplay(userProfile?.subscriptionTier).color} text-white font-semibold px-3 py-1`}>
                  {getTierDisplay(userProfile?.subscriptionTier).name}
                </Badge>
                <Badge className={`${getStatusDisplay(userProfile?.subscriptionStatus).color} font-medium px-3 py-1`}>
                  {getStatusDisplay(userProfile?.subscriptionStatus).text}
                </Badge>
              </div>
            </div>

            {/* Credits Remaining */}
            <div>
              <p className="text-sm font-medium text-foreground/70 mb-2">Credits Remaining</p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">
                  {getRemainingCredits(userProfile) === -1 ? '∞' : getRemainingCredits(userProfile)}
                </div>
                <div className="text-sm text-foreground/60">
                  {getRemainingCredits(userProfile) === -1 ? 'Unlimited' : `/ ${userProfile?.creditsLimit || 3} per month`}
                </div>
              </div>
            </div>

            {/* Billing Cycle */}
            {userProfile?.billingCycleStart && userProfile?.billingCycleEnd && (
              <div>
                <p className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Billing Cycle
                </p>
                <p className="text-sm text-foreground/80 font-medium">
                  {new Date(userProfile.billingCycleStart).toLocaleDateString()} -{" "}
                  {new Date(userProfile.billingCycleEnd).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {userProfile?.subscriptionTier === 'free' && (
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button className="w-full">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
              {userProfile?.subscriptionTier !== 'free' && (
                <>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                      Change Plan
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* 7-Day Money-Back Guarantee - Modern Design */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 p-5">
              {/* Decorative gradient orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl" />

              <div className="relative flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1 text-base">
                    7-Day Money-Back Guarantee
                  </h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200/90 leading-relaxed">
                    Not satisfied? Cancel within 7 days for a full refund, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Professional Profile</CardTitle>
          <CardDescription className="text-foreground/60">
            This information is used in all your generated resumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="linkedin" className="text-foreground font-medium">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="github" className="text-foreground font-medium">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="portfolio" className="text-foreground font-medium">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrl" className="text-foreground font-medium">Custom URL</Label>
                <Input
                  id="customUrl"
                  value={formData.customUrl}
                  onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                  placeholder="https://medium.com/@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrlLabel" className="text-foreground font-medium">Custom URL Label</Label>
                <Input
                  id="customUrlLabel"
                  value={formData.customUrlLabel}
                  onChange={(e) => setFormData({ ...formData, customUrlLabel: e.target.value })}
                  placeholder="Medium, Behance, etc."
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
