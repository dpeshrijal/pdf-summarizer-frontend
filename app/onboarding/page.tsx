"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Sparkles, Zap } from "lucide-react";

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <div className="space-y-8 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your AI Resume Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's get you set up in just a few minutes. We'll help you create professional,
          tailored resumes for every job application.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid md:grid-cols-3 gap-6 py-8">
        <Card className="border-2">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Generate in Seconds</CardTitle>
            <CardDescription>
              AI-powered resume generation tailored to each job description
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Professional Formatting</CardTitle>
            <CardDescription>
              Perfect layout and structure, optimized for ATS systems
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Your Info, Organized</CardTitle>
            <CardDescription>
              Store your professional details once, use them everywhere
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* What's Next */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>We'll guide you through a quick 2-step setup:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
              1
            </div>
            <div>
              <div className="font-semibold">Your Professional Profile</div>
              <div className="text-sm text-muted-foreground">
                Add your contact info and social links (LinkedIn, GitHub, etc.)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
              2
            </div>
            <div>
              <div className="font-semibold">Upload Your Master Resume</div>
              <div className="text-sm text-muted-foreground">
                Upload a comprehensive resume with all your experience and skills
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={() => router.push("/onboarding/profile")}
          className="text-lg px-8 py-6"
        >
          Get Started
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Takes less than 5 minutes • Your data is secure and private
      </p>
    </div>
  );
}
