"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resume } from "@/lib/utils/dashboardApi";

interface ResumeUploadProps {
  previousResumes: Resume[];
  selectedResumeId: string | null;
  onSelectResume: (fileId: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploadStatus: string;
  isUploading: boolean;
}

export function ResumeUpload({
  previousResumes,
  selectedResumeId,
  onSelectResume,
  onUpload,
  uploadStatus,
  isUploading,
}: ResumeUploadProps) {
  const [showUploadNew, setShowUploadNew] = useState(previousResumes.length === 0);
  const [masterResumeFile, setMasterResumeFile] = useState<File | null>(null);

  // Reset showUploadNew when a previous resume is selected
  useEffect(() => {
    if (selectedResumeId) {
      setShowUploadNew(false);
    }
  }, [selectedResumeId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (file.size > maxSize) {
        alert(
          `File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
        );
        setMasterResumeFile(null);
        // Reset the input
        event.target.value = "";
        return;
      }

      setMasterResumeFile(file);
    }
  };

  const handleUpload = async () => {
    if (masterResumeFile) {
      await onUpload(masterResumeFile);
      setMasterResumeFile(null);
    }
  };

  return (
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
        {!showUploadNew && previousResumes.length > 0 ? (
          <>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a previously uploaded resume:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {previousResumes.map((resume) => (
                  <button
                    key={resume.fileId}
                    onClick={() => onSelectResume(resume.fileId)}
                    className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedResumeId === resume.fileId
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          selectedResumeId === resume.fileId
                            ? "bg-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        <FileText
                          className={`h-5 w-5 ${
                            selectedResumeId === resume.fileId
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {resume.originalFilename}
                        </p>
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
                    <p className="text-sm md:text-base font-semibold px-4 text-center">
                      {masterResumeFile.name}
                    </p>
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
                    <p className="text-xs md:text-sm text-muted-foreground">
                      PDF file (max. 5MB)
                    </p>
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
              onClick={handleUpload}
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
  );
}
