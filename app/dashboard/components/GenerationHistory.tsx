"use client";

import { useState, useEffect } from "react";
import { History, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadAsPDF } from "@/lib/utils/pdfGenerator";
import { generateResumePDF, generateCoverLetterPDF } from "@/lib/utils/templatePdfGenerator";
import type { Generation } from "@/lib/utils/dashboardApi";
import type { GenerationOutput } from "@/lib/types/resumeSchema";

interface GenerationHistoryProps {
  history: Generation[];
}

export function GenerationHistory({ history }: GenerationHistoryProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = history.slice(startIndex, endIndex);

  // Reset to page 1 when history updates
  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pb-12 md:pb-16 max-w-7xl mt-12 md:mt-16">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <History className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Generation History</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Access your previously generated resumes and cover letters
        </p>
      </div>

      <Card className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {paginatedHistory.map((generation) => {
            const date = new Date(generation.completedAt * 1000);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            // Parse structured data to get match score
            let matchScore = null;
            if (generation.structuredData) {
              try {
                const parsed: GenerationOutput = JSON.parse(generation.structuredData);
                matchScore = parsed.matchScore;
              } catch (e) {
                // Ignore parsing errors
              }
            }

            // Get match rating color
            const getScoreColor = (score: number) => {
              if (score >= 80) return "from-green-500 to-green-600"; // Strong = Green
              if (score >= 60) return "from-blue-500 to-blue-600";   // Good = Blue
              return "from-yellow-500 to-yellow-600";                 // Fair = Yellow
            };

            const getScoreRating = (score: number) => {
              if (score >= 80) return "Strong Match";
              if (score >= 60) return "Good Match";
              return "Fair Match";
            };

            return (
              <div
                key={generation.jobId}
                className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 hover:bg-muted/30 transition-all duration-200"
              >
                {/* Match Score Circle - Primary Visual */}
                {matchScore && (
                  <div className="flex-shrink-0">
                    <div className="relative w-14 h-14 md:w-16 md:h-16">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreColor(matchScore.overallScore)} opacity-10 blur-md`} />
                      <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${getScoreColor(matchScore.overallScore)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-bold text-white">{matchScore.overallScore}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company & Position Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                      {generation.companyName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {generation.jobTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formattedDate}</span>
                    {matchScore && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-primary font-medium">
                          {getScoreRating(matchScore.overallScore)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => {
                      // Handle both structured and old format
                      if (generation.structuredData) {
                        try {
                          const parsed: GenerationOutput = JSON.parse(generation.structuredData);
                          generateResumePDF(
                            parsed.resume,
                            `${generation.companyName}_Resume_${formattedDate.replace(/\s/g, "_")}.pdf`
                          );
                        } catch (e) {
                          console.error("Failed to parse structured data:", e);
                          // Fallback to old format
                          if (generation.tailoredResume) {
                            downloadAsPDF(
                              generation.tailoredResume,
                              `${generation.companyName}_Resume_${formattedDate.replace(/\s/g, "_")}.pdf`
                            );
                          }
                        }
                      } else if (generation.tailoredResume) {
                        // Old format
                        downloadAsPDF(
                          generation.tailoredResume,
                          `${generation.companyName}_Resume_${formattedDate.replace(/\s/g, "_")}.pdf`
                        );
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="group/btn hover:bg-primary/10 hover:text-primary hover:border-primary/50 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 md:mr-2 group-hover/btn:animate-bounce" />
                    <span className="hidden md:inline">Resume</span>
                  </Button>

                  <Button
                    onClick={() => {
                      // Handle both structured and old format
                      if (generation.structuredData) {
                        try {
                          const parsed: GenerationOutput = JSON.parse(generation.structuredData);
                          generateCoverLetterPDF(
                            parsed.coverLetter,
                            {
                              name: parsed.resume.contact.name,
                              email: parsed.resume.contact.email,
                              phone: parsed.resume.contact.phone || "", // Default to empty string if not provided
                            },
                            `${generation.companyName}_CoverLetter_${formattedDate.replace(/\s/g, "_")}.pdf`
                          );
                        } catch (e) {
                          console.error("Failed to parse structured data:", e);
                          // Fallback to old format
                          if (generation.coverLetter) {
                            downloadAsPDF(
                              generation.coverLetter,
                              `${generation.companyName}_CoverLetter_${formattedDate.replace(/\s/g, "_")}.pdf`
                            );
                          }
                        }
                      } else if (generation.coverLetter) {
                        // Old format
                        downloadAsPDF(
                          generation.coverLetter,
                          `${generation.companyName}_CoverLetter_${formattedDate.replace(/\s/g, "_")}.pdf`
                        );
                      }
                    }}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of{" "}
            {history.length} generations
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                // Show ellipsis
                const showEllipsisBefore =
                  page === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter =
                  page === currentPage + 2 && currentPage < totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
