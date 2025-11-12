"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, ArrowLeft, FileText, CreditCard, CheckCircle2 } from "lucide-react";
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
          <p className="text-base text-foreground/70 mt-1">Manage your professional profile and credits</p>
        </div>

        {/* Credits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Credits
            </CardTitle>
            <CardDescription className="text-foreground/60">Manage your credit balance and purchase history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credits Balance */}
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-blue-600/10 p-6">
              <div className="relative">
                <p className="text-sm font-medium text-foreground/70 mb-2">Available Credits</p>
                <div className="flex items-baseline gap-3">
                  <div className="text-5xl font-bold text-primary">
                    {getRemainingCredits(userProfile)}
                  </div>
                  <div className="text-sm text-foreground/60">
                    credits remaining
                  </div>
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  Each credit = 1 resume + cover letter generation
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button className="w-full">
                  Buy More Credits
                </Button>
              </Link>
            </div>

            {/* Credits Never Expire Banner */}
            <div className="relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-green-500/8 to-green-500/5 p-5 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-3xl" />
              <div className="relative flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md shadow-green-500/25">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1.5 text-base">
                    Credits Never Expire
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Buy once, use whenever you need. Your credits are always available for your job search journey.
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
