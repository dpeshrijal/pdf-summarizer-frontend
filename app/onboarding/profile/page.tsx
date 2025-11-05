"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { saveUserProfile } from "@/lib/api/profileApi";
import type { UserProfileInput } from "@/lib/types/userProfile";

export default function OnboardingProfile() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserProfileInput>({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    customUrl: "",
    customUrlLabel: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // URL validation (only if provided)
    const urlPattern = /^https?:\/\/.+/;
    if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Must be a valid URL starting with http:// or https://";
    }
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      newErrors.githubUrl = "Must be a valid URL starting with http:// or https://";
    }
    if (formData.portfolioUrl && !urlPattern.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = "Must be a valid URL starting with http:// or https://";
    }
    if (formData.customUrl && !urlPattern.test(formData.customUrl)) {
      newErrors.customUrl = "Must be a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await saveUserProfile(user.id, formData);
      router.push("/onboarding/upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/upload");
  };

  return (
    <div className="space-y-6 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-muted-foreground">Step 1 of 2</div>
      </div>

      {/* Form */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Your Professional Profile</CardTitle>
          <CardDescription>
            This information will be used in all your generated resumes. You can update it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Required Section */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-muted-foreground">
                Required Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Optional Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="text-sm font-semibold text-muted-foreground">
                Optional Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
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
                <p className="text-xs text-muted-foreground">
                  City and state/country (e.g., "New York, NY" or "London, UK")
                </p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="text-sm font-semibold text-muted-foreground">
                Professional Links
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                  className={errors.linkedinUrl ? "border-destructive" : ""}
                />
                {errors.linkedinUrl && (
                  <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/johndoe"
                  className={errors.githubUrl ? "border-destructive" : ""}
                />
                {errors.githubUrl && (
                  <p className="text-sm text-destructive">{errors.githubUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://johndoe.com"
                  className={errors.portfolioUrl ? "border-destructive" : ""}
                />
                {errors.portfolioUrl && (
                  <p className="text-sm text-destructive">{errors.portfolioUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrl">Other Link (Optional)</Label>
                <Input
                  id="customUrl"
                  value={formData.customUrl}
                  onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                  placeholder="https://medium.com/@johndoe"
                  className={errors.customUrl ? "border-destructive" : ""}
                />
                {errors.customUrl && (
                  <p className="text-sm text-destructive">{errors.customUrl}</p>
                )}
              </div>

              {formData.customUrl && (
                <div className="space-y-2">
                  <Label htmlFor="customUrlLabel">Link Label</Label>
                  <Input
                    id="customUrlLabel"
                    value={formData.customUrlLabel}
                    onChange={(e) => setFormData({ ...formData, customUrlLabel: e.target.value })}
                    placeholder="Medium, Behance, Dribbble, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    What should we call this link? (e.g., "Medium", "Portfolio")
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
