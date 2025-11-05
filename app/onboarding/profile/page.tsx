"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Loader2, User, Mail, Phone, MapPin, Linkedin, Github, Globe, Link as LinkIcon } from "lucide-react";
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const urlPattern = /^https?:\/\/.+/;
    if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Must start with http:// or https://";
    }
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      newErrors.githubUrl = "Must start with http:// or https://";
    }
    if (formData.portfolioUrl && !urlPattern.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = "Must start with http:// or https://";
    }
    if (formData.customUrl && !urlPattern.test(formData.customUrl)) {
      newErrors.customUrl = "Must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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

  return (
    <div className="container mx-auto px-4 py-12 relative">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-primary" />
            <div className="h-2 w-16 rounded-full bg-muted" />
          </div>
          <div className="text-sm text-muted-foreground w-20 text-right">Step 1/2</div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Your Professional Profile</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            This information will be used in all your generated resumes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-background/60 backdrop-blur-sm border-2 border-border rounded-2xl p-8 shadow-xl space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Required Fields */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b">
                <div className="h-6 w-6 rounded-md bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-xs">*</span>
                </div>
                Required Information
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </div>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className={`h-12 rounded-xl ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`h-12 rounded-xl ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2">
                Optional (but recommended)
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone
                    </div>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Location
                    </div>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2">
                Professional Links
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-base">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-500" />
                      LinkedIn
                    </div>
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                    className={`h-12 rounded-xl ${errors.linkedinUrl ? "border-destructive" : ""}`}
                  />
                  {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github" className="text-base">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-foreground" />
                      GitHub
                    </div>
                  </Label>
                  <Input
                    id="github"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/johndoe"
                    className={`h-12 rounded-xl ${errors.githubUrl ? "border-destructive" : ""}`}
                  />
                  {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio" className="text-base">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      Portfolio / Website
                    </div>
                  </Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://johndoe.com"
                    className={`h-12 rounded-xl ${errors.portfolioUrl ? "border-destructive" : ""}`}
                  />
                  {errors.portfolioUrl && <p className="text-sm text-destructive">{errors.portfolioUrl}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customUrl" className="text-base">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-purple-500" />
                        Other Link
                      </div>
                    </Label>
                    <Input
                      id="customUrl"
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                      placeholder="https://medium.com/@johndoe"
                      className={`h-12 rounded-xl ${errors.customUrl ? "border-destructive" : ""}`}
                    />
                    {errors.customUrl && <p className="text-sm text-destructive">{errors.customUrl}</p>}
                  </div>

                  {formData.customUrl && (
                    <div className="space-y-2">
                      <Label htmlFor="customUrlLabel" className="text-base">Link Label</Label>
                      <Input
                        id="customUrlLabel"
                        value={formData.customUrlLabel}
                        onChange={(e) => setFormData({ ...formData, customUrlLabel: e.target.value })}
                        placeholder="Medium, Behance..."
                        className="h-12 rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/onboarding/upload")}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-8 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
