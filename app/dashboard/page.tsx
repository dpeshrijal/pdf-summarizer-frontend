"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { Upload, FileText, Sparkles, Download, CheckCircle2, AlertCircle, Loader2, Clock, Building2, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// Define the structure of the AI's response
interface AIGeneratedDocs {
  tailoredResume: string;
  coverLetter: string;
}

export default function Dashboard() {
  const router = useRouter();

  // Get the logged-in user's ID from Clerk
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const userId = user?.id;

  // Get auth token for API calls
  const { getToken } = useAuth();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, isLoaded, router]);

  // Fetch previously uploaded resumes on mount
  useEffect(() => {
    const fetchPreviousResumes = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          process.env.NEXT_PUBLIC_LIST_USER_RESUMES_API_URL!,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const readyResumes = data.resumes.filter(
            (resume: any) => resume.processingStatus === "READY_FOR_QUERY"
          );
          setPreviousResumes(readyResumes);
        }
      } catch (error) {
        console.error("Error fetching previous resumes:", error);
      } finally {
        setIsLoadingResumes(false);
      }
    };

    fetchPreviousResumes();
  }, [isSignedIn, isLoaded, getToken]);

  // Fetch generation history on mount
  useEffect(() => {
    const fetchGenerationHistory = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          process.env.NEXT_PUBLIC_LIST_USER_GENERATIONS_API_URL!,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setGenerationHistory(data.generations);
        }
      } catch (error) {
        console.error("Error fetching generation history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchGenerationHistory();
  }, [isSignedIn, isLoaded, getToken]);

  // State for Step 1: Master Resume Upload
  const [masterResumeFile, setMasterResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [fileId, setFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for previously uploaded resumes
  const [previousResumes, setPreviousResumes] = useState<Array<{fileId: string, originalFilename: string, processingStatus: string}>>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showUploadNew, setShowUploadNew] = useState(false);

  // State for Step 2: Job Description and Generation
  const [jobDescription, setJobDescription] = useState<string>("");
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedDocs, setGeneratedDocs] = useState<AIGeneratedDocs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for generation history
  const [generationHistory, setGenerationHistory] = useState<Array<{
    jobId: string,
    companyName: string,
    jobTitle: string,
    completedAt: number,
    tailoredResume: string,
    coverLetter: string
  }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const handleSelectPreviousResume = (resumeFileId: string) => {
    setSelectedResumeId(resumeFileId);
    setFileId(resumeFileId);
    setUploadStatus("Resume selected successfully! You can now proceed to Step 2.");
    setGeneratedDocs(null);
    setShowUploadNew(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (file.size > maxSize) {
        setUploadStatus(`File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        setMasterResumeFile(null);
        // Reset the input
        event.target.value = "";
        return;
      }

      setMasterResumeFile(file);
      setUploadStatus("");
      setFileId(null);
      setSelectedResumeId(null);
      setGeneratedDocs(null);
    }
  };

  const handleMasterResumeUpload = async () => {
    if (!masterResumeFile) {
      setUploadStatus("Please select your resume first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Preparing upload...");

    try {
      const token = await getToken();
      if (!token) {
        setUploadStatus("Authentication error. Please sign in again.");
        setIsUploading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}?fileName=${masterResumeFile.name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setUploadStatus("Authentication failed. Please sign in again.");
        setIsUploading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to get upload URL.");

      const { uploadUrl, fileId: newFileId } = await response.json();
      setUploadStatus("Uploading resume...");

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: masterResumeFile,
        headers: {
          "Content-Type": "application/pdf",
          "x-amz-meta-fileid": newFileId,
        },
      });
      if (!uploadResponse.ok) throw new Error("Upload failed.");

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

        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_GET_SUMMARY_API_URL}?fileId=${newFileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statusResponse.status === 401) {
          setUploadStatus("Authentication expired. Please sign in again.");
          setIsUploading(false);
          return;
        }

        const result = await statusResponse.json();

        if (result.processingStatus === "READY_FOR_QUERY") {
          setUploadStatus("Resume processed successfully!");
          setIsUploading(false);
        } else if (result.processingStatus === "FAILED") {
          setUploadStatus("Processing failed. Please try another file.");
          setIsUploading(false);
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

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setGenerationStatus("Please paste a job description.");
      return;
    }
    if (!fileId) {
      setGenerationStatus("Please upload your resume first.");
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

      const startResponse = await fetch(
        `${process.env.NEXT_PUBLIC_START_GENERATION_API_URL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileId: fileId,
            jobDescription: jobDescription,
          }),
        }
      );

      if (startResponse.status === 401) {
        setGenerationStatus("Authentication failed. Please sign in again.");
        setIsGenerating(false);
        return;
      }
      if (startResponse.status === 403) {
        setGenerationStatus("You don't have permission to access this file.");
        setIsGenerating(false);
        return;
      }
      if (!startResponse.ok) {
        throw new Error(`Server error: ${startResponse.status}`);
      }

      const { jobId } = await startResponse.json();
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

          const statusResponse = await fetch(
            `${process.env.NEXT_PUBLIC_GET_GENERATION_STATUS_API_URL}?jobId=${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (statusResponse.status === 401) {
            clearInterval(pollInterval);
            setGenerationStatus("Authentication expired.");
            setIsGenerating(false);
            return;
          }
          if (statusResponse.status === 403) {
            clearInterval(pollInterval);
            setGenerationStatus("Permission denied.");
            setIsGenerating(false);
            return;
          }
          if (!statusResponse.ok) {
            throw new Error(`Status check failed`);
          }

          const statusData = await statusResponse.json();

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setGeneratedDocs({
              tailoredResume: statusData.tailoredResume,
              coverLetter: statusData.coverLetter,
            });
            setGenerationStatus("Documents generated successfully!");
            setIsGenerating(false);
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

  const downloadAsPDF = async (text: string, filename: string) => {
    // Dynamic import to avoid SSR issues with jsPDF
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set margins - professional spacing
    const marginLeft = 18;
    const marginRight = 18;
    const marginTop = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - marginLeft - marginRight;

    let yPosition = marginTop;

    // Helper function to check if we need a new page
    const checkNewPage = (spaceNeeded: number = 10) => {
      if (yPosition + spaceNeeded > pageHeight - 20) {
        doc.addPage();
        yPosition = marginTop;
        return true;
      }
      return false;
    };

    // Helper to add a horizontal line (black only)
    const addHorizontalLine = (yPos: number, thickness: number = 0.5) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(thickness);
      doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    };

    // Parse the resume into structured sections
    const lines = text.split("\n");

    // ============================================
    // HEADER SECTION - Name and Contact
    // ============================================
    let nameFound = false;
    let contactFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // First non-empty line is the name
      if (!nameFound) {
        checkNewPage(15);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(line.toUpperCase(), pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 10;
        nameFound = true;
        continue;
      }

      // Second line is contact info
      if (
        !contactFound &&
        (line.includes("@") || line.toLowerCase().includes("email"))
      ) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // Parse and format contact info
        const emailMatch = line.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        );
        const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        const linkedinMatch =
          line.match(/linkedin\.com\/in\/[\w-]+/i) ||
          line.match(/LinkedIn:\s*([\w\s]+)/i);
        const githubMatch = line.match(/github\.com\/[\w-]+/i);

        const contactParts = [];
        if (emailMatch) contactParts.push(emailMatch[0]);
        if (phoneMatch) contactParts.push(phoneMatch[0]);
        if (linkedinMatch)
          contactParts.push(linkedinMatch[0].replace("LinkedIn:", "").trim());
        if (githubMatch) contactParts.push(githubMatch[0]);

        const contactLine = contactParts.join("  •  ");
        doc.text(contactLine, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;

        // Add separator line
        addHorizontalLine(yPosition, 0.8);
        yPosition += 8;
        contactFound = true;
        continue;
      }

      // Break after header is complete
      if (nameFound && contactFound) {
        break;
      }
    }

    // ============================================
    // MAIN CONTENT SECTIONS
    // ============================================
    let headerProcessed = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        yPosition += 2;
        continue;
      }

      // Skip header lines (name and contact info) - only process once
      if (!headerProcessed) {
        if (
          trimmedLine.includes("@") ||
          /^[A-Z][a-z]+\s+[A-Z][a-z]+$/i.test(trimmedLine) || // Name pattern
          trimmedLine.toLowerCase().includes("email") ||
          trimmedLine.toLowerCase().includes("git") ||
          trimmedLine.toLowerCase().includes("linkedin")
        ) {
          continue;
        } else {
          // First non-header line found
          headerProcessed = true;
        }
      }

      // Detect section headers (ALL CAPS, standalone lines)
      // Also check for common section names even if not all caps
      const commonSections = [
        "SUMMARY",
        "SKILLS",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "CERTIFICATIONS",
        "CERTIFICATION",
        "EDUCATION",
        "PROJECTS",
      ];
      const isCommonSection = commonSections.includes(
        trimmedLine.toUpperCase()
      );

      const isAllCaps =
        (trimmedLine === trimmedLine.toUpperCase() &&
          trimmedLine.length > 3 &&
          !trimmedLine.includes("|") &&
          !trimmedLine.includes("•") &&
          !/\d{4}/.test(trimmedLine)) ||
        isCommonSection; // Not a date

      if (isAllCaps) {
        // Major section header (SUMMARY, SKILLS, WORK EXPERIENCE, etc.)
        checkNewPage(20);
        yPosition += 4;

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const displayText = trimmedLine.toUpperCase(); // Force uppercase for consistency
        doc.text(displayText, marginLeft, yPosition);

        // Add underline under section header
        const headerWidth = doc.getTextWidth(displayText);
        doc.setLineWidth(0.6);
        doc.line(
          marginLeft,
          yPosition + 1,
          marginLeft + headerWidth,
          yPosition + 1
        );

        yPosition += 8;
        continue;
      }

      // Subsection headers (ends with colon, like "Programming Languages: content")
      const isSubheader =
        /^[A-Z][a-zA-Z\s&]+:\s*.+/.test(trimmedLine) &&
        trimmedLine.split(":")[0].length < 50;

      if (isSubheader) {
        checkNewPage(10);

        // Split header from content
        const colonIndex = trimmedLine.indexOf(":");
        const header = trimmedLine.substring(0, colonIndex + 1); // Include the colon
        const content = trimmedLine.substring(colonIndex + 1).trim();

        // Bold header
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const headerWidth = doc.getTextWidth(header);
        doc.text(header, marginLeft, yPosition);

        // Normal content
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(
          content,
          maxLineWidth - headerWidth - 2
        );

        // First line continues after header
        doc.text(contentLines[0], marginLeft + headerWidth + 1, yPosition);
        yPosition += 5;

        // Remaining lines (if wrapped)
        for (let j = 1; j < contentLines.length; j++) {
          checkNewPage(6);
          doc.text(contentLines[j], marginLeft, yPosition);
          yPosition += 5;
        }
        continue;
      }

      // Job titles / Experience headers (contains company and dates)
      const isJobTitle = /^[A-Z][a-zA-Z\s,]+.*\(.*(\d{4}|present)/i.test(
        trimmedLine
      );

      if (isJobTitle) {
        checkNewPage(15);
        yPosition += 2;

        // Pattern: "Job Title, Company Name (Location) (2022 - Present)"
        // We want to extract the LAST parenthetical with a year as the date
        const datePattern =
          /\((\d{4}\s*[-–—]\s*(?:\d{4}|present|Present))\)\s*$/i;
        const dateMatch = trimmedLine.match(datePattern);

        if (dateMatch) {
          // Get everything before the date parentheses
          const dateStartIndex = trimmedLine.lastIndexOf(
            "(",
            trimmedLine.length - 1
          );
          const titleCompanyLocation = trimmedLine
            .substring(0, dateStartIndex)
            .trim();
          const datePart = "(" + dateMatch[1] + ")";

          // Title/Company/Location on the left (bold, size 11)
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");

          // Calculate date width first to reserve space
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dateWidth = doc.getTextWidth(datePart);

          // Reset to bold for title
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);

          // Check if title+company+location fits on one line with date
          const maxTitleWidthWithDate = maxLineWidth - dateWidth - 5; // Leave space for date
          const testLines = doc.splitTextToSize(
            titleCompanyLocation,
            maxTitleWidthWithDate
          );

          if (testLines.length === 1) {
            // Single line: print title and date on same line
            doc.text(testLines[0], marginLeft, yPosition);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(datePart, pageWidth - marginRight - dateWidth, yPosition);
          } else {
            // Multiple lines needed: wrap using full width for all lines, then put date on separate line
            const titleLines = doc.splitTextToSize(
              titleCompanyLocation,
              maxLineWidth
            );

            // Print all title lines
            for (let i = 0; i < titleLines.length; i++) {
              doc.setFontSize(11);
              doc.setFont("helvetica", "bold");
              doc.text(titleLines[i], marginLeft, yPosition);
              yPosition += 5;
            }

            // Print date on a new line, right-aligned
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(datePart, pageWidth - marginRight - dateWidth, yPosition);
            yPosition -= 5; // Adjust back to maintain consistent spacing
          }
        } else {
          // Fallback if pattern doesn't match
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(trimmedLine, marginLeft, yPosition);
        }

        yPosition += 6;
        continue;
      }

      // Bullet points
      if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
        checkNewPage(8);
        const bulletText = trimmedLine.substring(1).trim();

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");

        // Add bullet
        doc.text("•", marginLeft + 3, yPosition);

        // Add text with proper wrapping
        const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 10);
        for (let j = 0; j < bulletLines.length; j++) {
          if (j > 0) checkNewPage(6);
          doc.text(bulletLines[j], marginLeft + 8, yPosition);
          yPosition += j === bulletLines.length - 1 ? 5 : 4.5;
        }
        continue;
      }

      // Regular paragraph text
      checkNewPage(8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const textLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
      for (const tLine of textLines) {
        checkNewPage(6);
        doc.text(tLine, marginLeft, yPosition);
        yPosition += 5;
      }
    }

    // Save the PDF
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background - Same as landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />

      <div className="relative z-10">
        {/* Enhanced Header - Matching landing page */}
        <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-5 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Resumi</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="cursor-pointer text-xs md:text-sm">
                  Pricing
                </Button>
              </Link>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          {/* Hero Section - Simplified for dashboard */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4">
              Create Your{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent animate-gradient">
                Perfect Resume
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
              Upload your resume, paste a job description, and get a tailored resume in 30 seconds
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Step 1: Upload Resume - Enhanced Design */}
          <Card className="flex flex-col border shadow-xl hover:shadow-2xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/25">
                  1
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg md:text-xl">Upload Your Resume</CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    PDF format, max 5MB
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              {/* Show previously uploaded resumes if available */}
              {!showUploadNew && previousResumes.length > 0 && !isLoadingResumes ? (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Select a previously uploaded resume:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {previousResumes.map((resume) => (
                        <button
                          key={resume.fileId}
                          onClick={() => handleSelectPreviousResume(resume.fileId)}
                          className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedResumeId === resume.fileId
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              selectedResumeId === resume.fileId ? "bg-primary/20" : "bg-muted"
                            }`}>
                              <FileText className={`h-5 w-5 ${
                                selectedResumeId === resume.fileId ? "text-primary" : "text-muted-foreground"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{resume.originalFilename}</p>
                              <p className="text-xs text-muted-foreground">Ready to use</p>
                            </div>
                            {selectedResumeId === resume.fileId && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setShowUploadNew(true);
                      setUploadStatus("");
                      setSelectedResumeId(null);
                      setFileId(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Resume
                  </Button>
                </>
              ) : (
                <>
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-44 md:h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      masterResumeFile
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      {masterResumeFile ? (
                        <>
                          <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            <FileText className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                          </div>
                          <p className="text-sm md:text-base font-semibold px-4 text-center">{masterResumeFile.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {(masterResumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl bg-muted flex items-center justify-center mb-3">
                            <Upload className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                          </div>
                          <p className="text-sm md:text-base font-medium text-foreground mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">PDF file (max. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <Button
                    onClick={handleMasterResumeUpload}
                    disabled={!masterResumeFile || isUploading}
                    className="w-full mt-auto shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Upload & Process
                      </>
                    )}
                  </Button>

                  {showUploadNew && previousResumes.length > 0 && (
                    <Button
                      onClick={() => {
                        setShowUploadNew(false);
                        setMasterResumeFile(null);
                        setUploadStatus("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      Cancel - Use Previous Resume
                    </Button>
                  )}
                </>
              )}

              {uploadStatus && (
                <div
                  className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl text-xs md:text-sm font-medium border-2 ${
                    uploadStatus.includes("successfully")
                      ? "bg-green-100 text-green-800 border-green-300"
                      : uploadStatus.includes("Error") || uploadStatus.includes("failed")
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}
                >
                  {uploadStatus.includes("successfully") ? (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 text-green-600" />
                  ) : uploadStatus.includes("Error") || uploadStatus.includes("failed") ? (
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 text-red-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 animate-spin text-blue-600" />
                  )}
                  <span className="leading-relaxed">{uploadStatus}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Job Description - Enhanced Design */}
          <Card className="flex flex-col border shadow-xl hover:shadow-2xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/25">
                  2
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg md:text-xl">Paste Job Description</CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Copy the full job posting
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <Textarea
                placeholder={
                  !uploadStatus.includes("successfully")
                    ? "Upload and process your resume first..."
                    : "Paste the job description here...&#10;&#10;Example:&#10;Software Engineer at Google&#10;Requirements:&#10;- 3+ years of experience&#10;- Proficiency in Python, Java..."
                }
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[150px] md:min-h-[180px] resize-none text-sm md:text-base"
                disabled={!uploadStatus.includes("successfully")}
              />

              <Button
                onClick={handleGenerate}
                disabled={!fileId || !jobDescription.trim() || isGenerating}
                className="w-full mt-auto shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Generate Tailored Resume
                  </>
                )}
              </Button>

              {generationStatus && (
                <div
                  className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl text-xs md:text-sm font-medium border-2 ${
                    generationStatus.includes("successfully")
                      ? "bg-green-100 text-green-800 border-green-300"
                      : generationStatus.includes("Error") || generationStatus.includes("failed")
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}
                >
                  {generationStatus.includes("successfully") ? (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 text-green-600" />
                  ) : generationStatus.includes("Error") || generationStatus.includes("failed") ? (
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 text-red-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 animate-spin text-blue-600" />
                  )}
                  <span className="leading-relaxed">{generationStatus}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section - Enhanced with celebration feel */}
        {generatedDocs && (
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl blur-2xl opacity-20" />

            <Card className="relative border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
              <CardHeader className="space-y-3 pb-6">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text">
                      Your Documents Are Ready!
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base mt-2">
                      Download your personalized resume and cover letter below
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Button
                  onClick={() =>
                    downloadAsPDF(
                      generatedDocs.tailoredResume,
                      "Tailored_Resume.pdf"
                    )
                  }
                  variant="default"
                  size="lg"
                  className="w-full shadow-xl hover:shadow-2xl transition-all text-base md:text-lg h-12 md:h-14"
                >
                  <Download className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  Download Resume
                </Button>
                <Button
                  onClick={() =>
                    downloadAsPDF(
                      generatedDocs.coverLetter,
                      "Cover_Letter.pdf"
                    )
                  }
                  variant="outline"
                  size="lg"
                  className="w-full border-2 shadow-xl hover:shadow-2xl transition-all text-base md:text-lg h-12 md:h-14"
                >
                  <Download className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  Download Cover Letter
                </Button>
              </div>

              {/* Preview Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Tailored Resume</h4>
                  </div>
                  <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedDocs.tailoredResume}
                    </pre>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Cover Letter</h4>
                  </div>
                  <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedDocs.coverLetter}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Generation History Section - Modern List View */}
        {!isLoadingHistory && generationHistory.length > 0 && (
          <section className="container mx-auto px-4 pb-12 md:pb-16 max-w-7xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <History className="h-5 w-5 text-purple-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Generation History</h2>
              </div>
              <p className="text-sm text-muted-foreground">Access your previously generated resumes and cover letters</p>
            </div>

            <Card className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="divide-y divide-border/50">
                {generationHistory.map((generation) => {
                  const date = new Date(generation.completedAt * 1000);
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={generation.jobId}
                      className="group flex items-center gap-3 md:gap-6 p-4 md:p-5 hover:bg-primary/5 transition-all duration-200"
                    >
                      {/* Icon - Hidden on mobile */}
                      <div className="hidden sm:flex h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>

                      {/* Company & Position Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                            {generation.companyName}
                          </h3>
                          <span className="hidden md:inline text-xs text-muted-foreground">•</span>
                          <span className="hidden md:inline text-sm text-muted-foreground truncate">{generation.jobTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span>{formattedDate}</span>
                          <span className="md:hidden">•</span>
                          <span className="md:hidden truncate text-xs">{generation.jobTitle}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => downloadAsPDF(
                            generation.tailoredResume,
                            `${generation.companyName}_Resume_${formattedDate.replace(/\s/g, '_')}.pdf`
                          )}
                          variant="outline"
                          size="sm"
                          className="group/btn hover:bg-primary/10 hover:text-primary hover:border-primary/50 whitespace-nowrap"
                        >
                          <Download className="h-4 w-4 md:mr-2 group-hover/btn:animate-bounce" />
                          <span className="hidden md:inline">Resume</span>
                        </Button>

                        <Button
                          onClick={() => downloadAsPDF(
                            generation.coverLetter,
                            `${generation.companyName}_CoverLetter_${formattedDate.replace(/\s/g, '_')}.pdf`
                          )}
                          variant="outline"
                          size="sm"
                          className="group/btn hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/50 whitespace-nowrap"
                        >
                          <Download className="h-4 w-4 md:mr-2 group-hover/btn:animate-bounce" />
                          <span className="hidden md:inline">Cover Letter</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}
        </main>

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
    </div>
  );
}
