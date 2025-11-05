"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
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

      // Get presigned URL
      const response = await fetch(
        process.env.NEXT_PUBLIC_GET_UPLOAD_URL_API_URL!,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, fileId } = await response.json();

      // Upload to S3
      await uploadPdfToS3(presignedUrl, selectedFile, fileId);

      setIsUploading(false);
      setIsProcessing(true);

      // Poll for processing status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max

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

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-muted-foreground">Step 2 of 2</div>
      </div>

      {/* Upload Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Upload Your Master Resume</CardTitle>
          <CardDescription>
            Upload a comprehensive PDF resume with all your experience, skills, and achievements.
            We'll use this as the foundation for tailored resumes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {uploadComplete ? (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
                <p className="text-muted-foreground">
                  Your resume has been processed and is ready to use.
                </p>
              </div>
              <Button size="lg" onClick={handleComplete}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center space-y-4 transition-colors cursor-pointer ${
                  selectedFile
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex justify-center">
                  {selectedFile ? (
                    <FileText className="w-12 h-12 text-primary" />
                  ) : (
                    <Upload className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      PDF file up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {selectedFile && !isUploading && !isProcessing && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              )}

              {/* Loading States */}
              {isUploading && (
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              )}

              {isProcessing && (
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Processing your resume...
                  </p>
                </div>
              )}
            </>
          )}

          {/* Tips */}
          {!uploadComplete && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold">Tips for best results:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Include all your work experience, even if it's extensive</li>
                <li>List all relevant skills and technologies</li>
                <li>Include education, certifications, and projects</li>
                <li>Don't worry about length - we'll tailor it to fit one page</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          {!uploadComplete && (
            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
