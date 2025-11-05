"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, ArrowLeft, FileText } from "lucide-react";
import { getUserProfile, saveUserProfile } from "@/lib/api/profileApi";
import type { UserProfileInput } from "@/lib/types/userProfile";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your professional profile</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Profile</CardTitle>
          <CardDescription>
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
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrl">Custom URL</Label>
                <Input
                  id="customUrl"
                  value={formData.customUrl}
                  onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                  placeholder="https://medium.com/@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrlLabel">Custom URL Label</Label>
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
