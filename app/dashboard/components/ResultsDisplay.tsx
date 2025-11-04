"use client";

import { Download, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadAsPDF } from "@/lib/utils/pdfGenerator";

interface ResultsDisplayProps {
  tailoredResume: string;
  coverLetter: string;
}

export function ResultsDisplay({ tailoredResume, coverLetter }: ResultsDisplayProps) {
  return (
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
              onClick={() => downloadAsPDF(tailoredResume, "Tailored_Resume.pdf")}
              className="w-full h-auto py-4 md:py-5 flex-col gap-2 shadow-xl hover:shadow-2xl transition-all text-base md:text-lg"
              size="lg"
            >
              <Download className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-bold">Download Resume</span>
            </Button>

            <Button
              onClick={() => downloadAsPDF(coverLetter, "Cover_Letter.pdf")}
              variant="outline"
              className="w-full h-auto py-4 md:py-5 flex-col gap-2 border-2 shadow-xl hover:shadow-2xl transition-all text-base md:text-lg"
              size="lg"
            >
              <Download className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-bold">Download Cover Letter</span>
            </Button>
          </div>

          {/* Document Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Resume Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-base md:text-lg">Tailored Resume</h4>
              </div>
              <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {tailoredResume}
                </pre>
              </div>
            </div>

            {/* Cover Letter Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-base md:text-lg">Cover Letter</h4>
              </div>
              <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {coverLetter}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
