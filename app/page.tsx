"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sparkles, Zap, Shield, CheckCircle, Upload, Download, Brain, Target, TrendingUp, History, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />

      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Resumi</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/pricing" className="cursor-pointer">
                <Button variant="ghost" size="sm" className="cursor-pointer text-xs md:text-sm">Pricing</Button>
              </Link>
              <Link href="/sign-in" className="cursor-pointer">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex cursor-pointer text-xs md:text-sm">Sign In</Button>
              </Link>
              <Link href="/sign-up" className="cursor-pointer">
                <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer text-xs md:text-sm">
                  Get Started <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - Redesigned */}
        <section className="container mx-auto px-4 py-12 md:py-24 relative">
          {/* Floating Elements for Visual Interest - Hidden on mobile */}
          <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" />
          <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: '1s' }} />

          <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium backdrop-blur-sm shadow-lg shadow-primary/5">
              <Brain className="h-3 w-3 md:h-4 md:w-4" />
              <span>Powered by Advanced AI • Match Scoring • Smart Validation</span>
            </div>

            {/* Main Headline - Responsive sizing */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight px-2">
              Get More{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent animate-gradient">
                Interviews
              </span>
              <br />
              Land Better Jobs
            </h1>

            {/* Shorter subheadline - Better mobile sizing */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              AI tailors your resume to each job in seconds. Beat ATS systems and impress hiring managers.
            </p>

            {/* CTA Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 md:pt-6 px-4">
              <Link href="/sign-up" className="cursor-pointer w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 py-5 md:py-6 shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all cursor-pointer">
                  Start Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span>30 second setup</span>
              </div>
            </div>

            {/* Visual Demo Card - Optimized for mobile */}
            <div className="pt-8 md:pt-12 pb-4 md:pb-8">
              <div className="relative max-w-4xl mx-auto">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl blur-2xl opacity-20" />

                {/* Demo Card - Responsive padding */}
                <div className="relative bg-card border rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base md:text-lg mb-1">1. Upload</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Drop your resume</p>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base md:text-lg mb-1">2. Paste Job</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Add job description</p>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Download className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base md:text-lg mb-1">3. Download</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Get tailored resume</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* AI Intelligence Showcase - NEW */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm mb-6">
              <Brain className="h-4 w-4" />
              <span>Powered by Advanced AI</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Intelligence That Gets You{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Hired
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI doesn't just rewrite. It analyzes, optimizes, and scores your match to help you win
            </p>
          </div>

          {/* Feature Grid with Visual Examples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Match Score */}
            <div className="group relative flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col w-full">
                <div className="mb-6">
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Animated Score Circle */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-lg" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">88</div>
                        <div className="text-xs text-white/80">Match</div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">ATS Match Score</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  See exactly how well you match each job with detailed breakdowns
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Skills Match</span>
                    <span className="font-semibold text-blue-600">92%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-semibold text-green-600">85%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Smart Validation */}
            <div className="group relative flex">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Smart Validation</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  AI detects if your upload is a real resume and guides you to success
                </p>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-green-700 mb-1">Resume Verified</div>
                      <div className="text-muted-foreground">Contains experience, skills, and education</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Generation History */}
            <div className="group relative flex">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-6">
                  <History className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Smart History</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Track all your applications with scores and instant downloads
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      72
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">Frontend Developer</div>
                      <div className="text-xs text-muted-foreground">Ailytics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      92
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">Senior Engineer</div>
                      <div className="text-xs text-muted-foreground">Tech Corp</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Why Resumi?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Stop spending hours customizing resumes. Let AI do the heavy lifting while you focus on preparing for interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-5 md:p-6 border shadow-sm">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Generate a tailored resume and cover letter in under 30 seconds. No manual editing required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-5 md:p-6 border shadow-sm group hover:border-primary/50 transition-all">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-3 md:mb-4">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Advanced AI analyzes job descriptions, scores your match, and optimizes your resume with perfect keywords.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-5 md:p-6 border shadow-sm">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">ATS Optimized</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Beat applicant tracking systems with resumes optimized for both robots and humans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Hidden on mobile, shown in hero */}
      <section className="hidden md:block container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              From master resume to job offer, streamlined
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base md:text-lg">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Upload Your Master Resume</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Upload your comprehensive resume once. We'll store it securely and use it as the foundation for all your applications.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base md:text-lg">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Paste Job Description</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Copy and paste any job description. Our AI analyzes requirements, skills, and keywords to match perfectly.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base md:text-lg">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Download & Apply</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Get your tailored resume and custom cover letter instantly. Download as PDF and apply with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="container mx-auto px-4 py-12 md:py-20 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Everything You Need to Stand Out
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">Keyword Optimization</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Automatically matches job description keywords</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">Custom Cover Letters</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Personalized cover letters for each application</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">Professional Formatting</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Clean, ATS-friendly PDF output</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">Secure & Private</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Your data is encrypted and never shared</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">Unlimited Generations</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Apply to as many jobs as you want</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm md:text-base font-semibold mb-1">No Experience Required</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Simple interface, powerful results</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            Ready to Land Your Next Job?
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90">
            Join professionals who are getting more interviews with Resumi
          </p>
          <Link href="/sign-up" className="cursor-pointer inline-block">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 cursor-pointer">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </Link>
        </div>
      </section>

        {/* Footer */}
        <footer className="border-t bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold">Resumi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 Resumi. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
