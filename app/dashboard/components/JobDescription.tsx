"use client";

import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationStatus: string;
  canGenerate: boolean;
}

export function JobDescription({
  jobDescription,
  onJobDescriptionChange,
  onGenerate,
  isGenerating,
  generationStatus,
  canGenerate,
}: JobDescriptionProps) {
  return (
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
        {/* Show elegant loading overlay when generating */}
        {isGenerating ? (
          <div className="relative w-full min-h-[200px] md:min-h-[250px] border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite linear'
                 }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6">
              {/* Elegant spinner with pulse effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="relative w-16 h-16 animate-spin text-primary" />
              </div>

              {/* Status text */}
              <div className="text-center space-y-2">
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {generationStatus || "Generating tailored resume..."}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
                  AI is crafting your perfect resume
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Textarea
              placeholder={
                !canGenerate
                  ? "Upload and process your resume first..."
                  : "Paste the job description here...\n\nExample:\nSoftware Engineer at Google\nRequirements:\n- 3+ years of experience\n- Proficiency in Python, Java..."
              }
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              className="min-h-[150px] md:min-h-[180px] resize-none text-sm md:text-base"
              disabled={!canGenerate}
            />

            <Button
              onClick={onGenerate}
              disabled={!canGenerate || !jobDescription.trim() || isGenerating}
              className="w-full mt-auto shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Generate Tailored Resume
            </Button>

            {generationStatus && !isGenerating && (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
