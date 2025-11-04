"use client";

import { SignIn } from '@clerk/nextjs';
import { FileText, Sparkles, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
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
                <FileText className="h-5 w-5 text-primary-foreground" />
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden md:block space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent animate-gradient">
                  Resumi
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Continue crafting resumes that get you noticed by recruiters and hired faster.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Tailoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes job descriptions and optimizes your resume for each application.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Higher Response Rates</h3>
                  <p className="text-sm text-muted-foreground">
                    Users report 3x more interview callbacks with tailored resumes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">ATS-Optimized</h3>
                  <p className="text-sm text-muted-foreground">
                    Beat applicant tracking systems with keyword-optimized content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Component */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
              {/* Mobile Title */}
              <div className="md:hidden text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to continue to Resumi
                </p>
              </div>

              {/* Clerk Sign In Component */}
              <div className="flex justify-center">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "bg-card/50 backdrop-blur-sm border-border/40 shadow-2xl",
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
