"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { uploadPdfToS3, checkResumeStatus } from "@/lib/utils/dashboardApi";

export default function OnboardingUpload() {
  const router = useRouter();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleFileValidation = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        process.env.NEXT_PUBLIC_GET_UPLOAD_URL_API_URL!,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { presignedUrl, fileId } = await response.json();
      await uploadPdfToS3(presignedUrl, selectedFile, fileId);

      setIsUploading(false);
      setIsProcessing(true);

      let attempts = 0;
      const maxAttempts = 30;

      const pollStatus = async () => {
        try {
          const status = await checkResumeStatus(token, fileId);

          if (status === "READY_FOR_QUERY") {
            setIsProcessing(false);
            setUploadComplete(true);
          } else if (status === "FAILED") {
            throw new Error("Resume processing failed");
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 1000);
            } else {
              throw new Error("Processing timeout");
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Status check failed");
          setIsProcessing(false);
        }
      };

      pollStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setIsProcessing(false);
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
            <div className="h-2 w-16 rounded-full bg-primary" />
          </div>
          <div className="text-sm text-muted-foreground w-20 text-right">Step 2/2</div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 items-center justify-center">
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Upload Your Master Resume</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a comprehensive PDF with all your experience and skills
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-background/60 backdrop-blur-sm border-2 border-border rounded-2xl p-8 shadow-xl space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadComplete ? (
            <div className="text-center space-y-6 py-12">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                  <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 animate-pulse" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">All Set!</h3>
                <p className="text-muted-foreground">
                  Your resume has been processed and you're ready to generate tailored resumes
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="px-10 py-7 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-105"
                    : selectedFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/10"
                } ${!isUploading && !isProcessing ? "cursor-pointer" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && !isProcessing && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center space-y-4">
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="w-16 h-16 animate-spin text-primary" />
                      <div className="text-center">
                        <p className="font-semibold text-lg">
                          {isUploading ? "Uploading..." : "Processing your resume..."}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isProcessing && "This may take a moment"}
                        </p>
                      </div>
                    </>
                  ) : selectedFile ? (
                    <>
                      <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to choose a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-semibold text-lg">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF file up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedFile && !isUploading && !isProcessing && (
                <Button
                  size="lg"
                  onClick={handleUpload}
                  className="w-full py-7 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Resume
                </Button>
              )}

              {/* Tips */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                <p className="text-sm font-semibold">💡 Tips for best results:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Include all your work experience, even if extensive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>List all relevant skills and technologies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Include education, certifications, and projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Don't worry about length - we'll tailor it to fit one page</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {!uploadComplete && (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
