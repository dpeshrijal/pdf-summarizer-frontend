"use client";

import { useState, useEffect } from "react";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding, getUserProfile } from "@/lib/api/profileApi";
import { hasCreditsAvailable, deductCredit, shouldResetBillingCycle, resetMonthlyCredits } from "@/lib/api/subscriptionApi";
import { toast } from "sonner";

// Components
import { ResumeUpload } from "./components/ResumeUpload";
import { JobDescription } from "./components/JobDescription";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { GenerationHistory } from "./components/GenerationHistory";
import { UpgradeModal } from "./components/UpgradeModal";

// API Utilities
import {
  fetchUserResumes,
  fetchGenerationHistory,
  uploadPdfToS3,
  checkResumeStatus,
  startGeneration,
  checkGenerationStatus,
  type Resume,
  type Generation,
} from "@/lib/utils/dashboardApi";
import type { GenerationOutput } from "@/lib/types/resumeSchema";

interface AIGeneratedDocs {
  // Can be either structured or old format
  structured?: GenerationOutput;
  // Old format (backward compatibility)
  tailoredResume?: string;
  coverLetter?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  // State - Declare before useEffects
  const [previousResumes, setPreviousResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const [jobDescription, setJobDescription] = useState<string>("");
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedDocs, setGeneratedDocs] = useState<AIGeneratedDocs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generationHistory, setGenerationHistory] = useState<Generation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, isLoaded, router]);

  // Check onboarding - localStorage FIRST (synchronous), then API
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isSignedIn || !user?.id || !isLoaded) {
        setIsCheckingOnboarding(false);
        return;
      }

      // INSTANT CHECK: localStorage (no API call, no delay)
      const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user.id}`);
      if (hasSeenOnboarding) {
        setIsCheckingOnboarding(false);
        return;
      }

      // API CHECK: Only if localStorage doesn't have it
      try {
        const completed = await hasCompletedOnboarding(user.id);
        if (completed) {
          localStorage.setItem(`onboarding_seen_${user.id}`, 'true');
          setIsCheckingOnboarding(false);
          return;
        }
        // User needs onboarding - redirect
        router.replace("/onboarding");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isSignedIn, user?.id, isLoaded, router]);

  // Fetch previous resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        const token = await getToken();
        if (!token) return;

        const resumes = await fetchUserResumes(token);
        setPreviousResumes(resumes);
      } catch (error) {
        console.error("Error fetching previous resumes:", error);
      } finally {
        setIsLoadingResumes(false);
      }
    };

    loadResumes();
  }, [isSignedIn, isLoaded, getToken]);

  // Function to reload generation history (for refreshing after new generation)
  const reloadGenerationHistory = async () => {
    if (!isSignedIn || !isLoaded) return;

    try {
      const token = await getToken();
      if (!token) return;

      const history = await fetchGenerationHistory(token);
      setGenerationHistory(history);
    } catch (error) {
      console.error("Error fetching generation history:", error);
    }
  };

  // Fetch generation history on mount
  useEffect(() => {
    const loadGenerationHistory = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        const token = await getToken();
        if (!token) return;

        const history = await fetchGenerationHistory(token);
        setGenerationHistory(history);
      } catch (error) {
        console.error("Error fetching generation history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadGenerationHistory();
  }, [isSignedIn, isLoaded, getToken]);

  // Load user profile and check billing cycle
  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn || !user?.id || !isLoaded) return;

      try {
        const profileData = await getUserProfile(user.id);
        if (profileData.hasProfile && profileData.profile) {
          setUserProfile(profileData.profile);

          // Check if billing cycle needs reset
          if (shouldResetBillingCycle(profileData.profile)) {
            await resetMonthlyCredits(user.id, profileData.profile);
            // Reload profile
            const updatedProfile = await getUserProfile(user.id);
            setUserProfile(updatedProfile.profile);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [isSignedIn, user?.id, isLoaded]);

  // Handler: Select previous resume
  const handleSelectPreviousResume = (resumeFileId: string) => {
    setSelectedResumeId(resumeFileId);
    setFileId(resumeFileId);
    setUploadStatus("Resume selected successfully! You can now proceed to Step 2.");
    setGeneratedDocs(null);
  };

  // Handler: Upload new resume
  const handleMasterResumeUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("Preparing upload...");
    setGeneratedDocs(null);
    setSelectedResumeId(null);

    try {
      const token = await getToken();
      if (!token) {
        setUploadStatus("Authentication error. Please sign in again.");
        setIsUploading(false);
        return;
      }

      // Get presigned URL and fileId from backend
      const presignResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}?fileName=${file.name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (presignResponse.status === 401) {
        setUploadStatus("Authentication expired. Please sign in again.");
        setIsUploading(false);
        return;
      }

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL.");
      }

      const { uploadUrl, fileId: newFileId } = await presignResponse.json();
      setUploadStatus("Uploading resume...");

      // Upload to S3
      await uploadPdfToS3(uploadUrl, file, newFileId);

      setUploadStatus("Processing your resume...");
      setFileId(newFileId);

      // Poll for processing status
      const pollForReadyStatus = async () => {
        const token = await getToken();
        if (!token) {
          setUploadStatus("Authentication error during processing.");
          setIsUploading(false);
          return;
        }

        const result = await checkResumeStatus(token, newFileId);

        if (result.processingStatus === "READY_FOR_QUERY") {
          setUploadStatus("Resume processed successfully!");
          setIsUploading(false);
          // Refresh the resume list
          const resumes = await fetchUserResumes(token);
          setPreviousResumes(resumes);
        } else if (result.processingStatus === "FAILED") {
          // Get the detailed error message from Lambda
          const errorMessage = (result as any).summary || "Processing failed. Please try another file.";
          setUploadStatus(`Error: ${errorMessage}`);
          setIsUploading(false);
          setFileId(null);
        } else {
          setTimeout(pollForReadyStatus, 5000);
        }
      };

      setTimeout(pollForReadyStatus, 5000);
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsUploading(false);
    }
  };

  // Handler: Generate tailored resume
  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setGenerationStatus("Please paste a job description.");
      return;
    }
    if (!fileId) {
      setGenerationStatus("Please upload your resume first.");
      return;
    }

    // Check if user has credits available
    if (!hasCreditsAvailable(userProfile)) {
      setShowUpgradeModal(true);
      toast.error("You've run out of credits! Please upgrade to continue.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Starting generation...");
    setGeneratedDocs(null);

    try {
      const token = await getToken();
      if (!token) {
        setGenerationStatus("Authentication error. Please sign in again.");
        setIsGenerating(false);
        return;
      }

      // Deduct credit before starting generation
      if (user?.id && userProfile) {
        await deductCredit(user.id, userProfile);
        // Reload profile to show updated credits
        const updatedProfile = await getUserProfile(user.id);
        setUserProfile(updatedProfile.profile);
      }

      const { jobId } = await startGeneration(token, fileId, jobDescription);
      setGenerationStatus("AI is tailoring your resume...");

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const token = await getToken();
          if (!token) {
            clearInterval(pollInterval);
            setGenerationStatus("Authentication error.");
            setIsGenerating(false);
            return;
          }

          const statusData = await checkGenerationStatus(token, jobId);

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);

            // Handle both new structured format and old text format
            console.log("Status data received:", statusData);
            console.log("Has structuredData?", !!statusData.structuredData);

            if (statusData.structuredData) {
              // New format: parse JSON string
              try {
                console.log("Parsing structured data...");
                const parsedData: GenerationOutput = JSON.parse(statusData.structuredData);
                console.log("Parsed data:", parsedData);
                setGeneratedDocs({
                  structured: parsedData,
                });
              } catch (e) {
                console.error("Failed to parse structured data:", e);
                console.log("Raw structuredData:", statusData.structuredData);
                // Fallback to old format if parsing fails
                setGeneratedDocs({
                  tailoredResume: statusData.tailoredResume,
                  coverLetter: statusData.coverLetter,
                });
              }
            } else {
              // Old format: use text directly
              console.log("Using old text format");
              setGeneratedDocs({
                tailoredResume: statusData.tailoredResume,
                coverLetter: statusData.coverLetter,
              });
            }

            setGenerationStatus("Documents generated successfully!");
            setIsGenerating(false);

            // Refresh generation history to show the new entry
            reloadGenerationHistory();
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setGenerationStatus(
              `Generation failed: ${statusData.errorMessage || "Unknown error"}`
            );
            setIsGenerating(false);
          }
        } catch (error) {
          clearInterval(pollInterval);
          setGenerationStatus("Error checking status");
          setIsGenerating(false);
        }
      }, 5000);
    } catch (error) {
      setGenerationStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsGenerating(false);
    }
  };

  // Show minimal loading screen while checking onboarding
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-5 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Resumi
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Credits Display */}
              {userProfile && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs font-medium text-primary">
                    {userProfile.subscriptionTier === 'unlimited'
                      ? 'Unlimited'
                      : `${userProfile.creditsRemaining || 3} credits`
                    }
                  </span>
                </div>
              )}
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="cursor-pointer text-xs md:text-sm">
                  Pricing
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="cursor-pointer text-xs md:text-sm">
                  Settings
                </Button>
              </Link>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Loader - Shows while data is loading */}
        {isLoadingResumes || isLoadingHistory ? (
          <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
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
        ) : (
          <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {/* Hero Section */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4">
                Create Your{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent animate-gradient">
                  Perfect Resume
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
                Upload your resume, paste a job description, and get a tailored resume in 30
                seconds
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span>ATS-Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span>30 Seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span>100% Secure</span>
                </div>
              </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              <ResumeUpload
                previousResumes={previousResumes}
                selectedResumeId={selectedResumeId}
                onSelectResume={handleSelectPreviousResume}
                onUpload={handleMasterResumeUpload}
                uploadStatus={uploadStatus}
                isUploading={isUploading}
              />

              <JobDescription
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                generationStatus={generationStatus}
                canGenerate={uploadStatus.includes("successfully")}
              />
            </div>

            {/* Results Section */}
            {generatedDocs && (
              <ResultsDisplay
                structured={generatedDocs.structured}
                tailoredResume={generatedDocs.tailoredResume}
                coverLetter={generatedDocs.coverLetter}
              />
            )}

            {/* Generation History */}
            <GenerationHistory history={generationHistory} />
          </main>
        )}

        {/* Footer */}
        <footer className="border-t mt-12 md:mt-20 bg-card/50">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Resumi</span>
              </div>
              <p>© 2025 Resumi. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={userProfile?.subscriptionTier || 'free'}
        creditsRemaining={userProfile?.creditsRemaining || 0}
      />
    </div>
  );
}
