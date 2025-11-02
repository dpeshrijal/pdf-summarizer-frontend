"use client";

import { useState } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { Upload, FileText, Sparkles, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Define the structure of the AI's response
interface AIGeneratedDocs {
  tailoredResume: string;
  coverLetter: string;
}

export default function Home() {
  // Get the logged-in user's ID from Clerk
  const { user } = useUser();
  const userId = user?.id;

  // Get auth token for API calls
  const { getToken } = useAuth();

  // State for Step 1: Master Resume Upload
  const [masterResumeFile, setMasterResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [fileId, setFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for Step 2: Job Description and Generation
  const [jobDescription, setJobDescription] = useState<string>("");
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedDocs, setGeneratedDocs] = useState<AIGeneratedDocs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

          // Check if title+company+location fits, if not truncate
          const maxTitleWidth = maxLineWidth - doc.getTextWidth(datePart) - 5; // Leave space for date
          const titleLines = doc.splitTextToSize(
            titleCompanyLocation,
            maxTitleWidth
          );

          doc.text(titleLines[0], marginLeft, yPosition);

          // Date on the right (normal weight, size 10)
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dateWidth = doc.getTextWidth(datePart);
          doc.text(datePart, pageWidth - marginRight - dateWidth, yPosition);

          // If title wrapped, add additional lines
          if (titleLines.length > 1) {
            yPosition += 5;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            for (let i = 1; i < titleLines.length; i++) {
              doc.text(titleLines[i], marginLeft, yPosition);
              yPosition += 5;
            }
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">AI Resume Tailor</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Beta</Badge>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Get Hired Faster with AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tailor your resume to any job description in 90 seconds. ATS-optimized, professional, and proven to increase interview rates.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>90 Second Turnaround</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free & Secure</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Step 1: Upload Resume */}
          <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <CardTitle>Upload Your Resume</CardTitle>
              </div>
              <CardDescription>
                Upload your master resume (PDF only, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  masterResumeFile
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {masterResumeFile ? (
                    <>
                      <FileText className="h-10 w-10 text-primary mb-2" />
                      <p className="text-sm font-medium">{masterResumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(masterResumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF (max. 5MB)</p>
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
                className="w-full mt-auto"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>

              {uploadStatus && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    uploadStatus.includes("successfully")
                      ? "bg-green-50 text-green-900 border border-green-200"
                      : uploadStatus.includes("Error") || uploadStatus.includes("failed")
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-blue-50 text-blue-900 border border-blue-200"
                  }`}
                >
                  {uploadStatus.includes("successfully") ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : uploadStatus.includes("Error") || uploadStatus.includes("failed") ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin" />
                  )}
                  <span>{uploadStatus}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Job Description */}
          <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <CardTitle>Paste Job Description</CardTitle>
              </div>
              <CardDescription>
                Copy and paste the full job posting you're applying to
              </CardDescription>
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
                className="min-h-[140px] resize-none"
                disabled={!uploadStatus.includes("successfully")}
              />

              <Button
                onClick={handleGenerate}
                disabled={!fileId || !jobDescription.trim() || isGenerating}
                className="w-full mt-auto"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tailored Resume
                  </>
                )}
              </Button>

              {generationStatus && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    generationStatus.includes("successfully")
                      ? "bg-green-50 text-green-900 border border-green-200"
                      : generationStatus.includes("Error") || generationStatus.includes("failed")
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-blue-50 text-blue-900 border border-blue-200"
                  }`}
                >
                  {generationStatus.includes("successfully") ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : generationStatus.includes("Error") || generationStatus.includes("failed") ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin" />
                  )}
                  <span>{generationStatus}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {generatedDocs && (
          <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Your Tailored Documents Are Ready!
              </CardTitle>
              <CardDescription>
                Download your personalized resume and cover letter below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() =>
                    downloadAsPDF(
                      generatedDocs.tailoredResume,
                      "Tailored_Resume.pdf"
                    )
                  }
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
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
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Cover Letter
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="font-semibold mb-2">Tailored Resume Preview:</h4>
                  <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto text-sm border">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedDocs.tailoredResume}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter Preview:</h4>
                  <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto text-sm border">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedDocs.coverLetter}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 AI Resume Tailor. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
