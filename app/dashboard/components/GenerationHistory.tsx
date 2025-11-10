"use client";

import { useState, useEffect } from "react";
import { History, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadAsPDF } from "@/lib/utils/pdfGenerator";
import { generateResumePDF, generateCoverLetterPDF } from "@/lib/utils/templatePdfGenerator";
import type { Generation } from "@/lib/utils/dashboardApi";
import type { GenerationOutput } from "@/lib/types/resumeSchema";
import { TemplateSelectionModal } from "./TemplateSelectionModal";

type TemplateType = 'classic' | 'fancy' | 'artistic';

interface GenerationHistoryProps {
  history: Generation[];
}

export function GenerationHistory({ history }: GenerationHistoryProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Template modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [pendingGeneration, setPendingGeneration] = useState<{
    resume: any;
    fileName: string;
  } | null>(null);

  // Expanded match score state
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

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
              if (score >= 80) return "from-green-500 to-green-600";   // Strong = Green
              if (score >= 60) return "from-blue-500 to-blue-600";     // Good = Blue
              if (score >= 40) return "from-yellow-500 to-yellow-600"; // Fair = Yellow
              return "from-red-500 to-red-600";                         // Low = Red
            };

            const getScoreRating = (score: number) => {
              if (score >= 80) return "Strong Match";
              if (score >= 60) return "Good Match";
              if (score >= 40) return "Fair Match";
              return "Low Match";
            };

            const isExpanded = expandedJobId === generation.jobId;

            return (
              <div key={generation.jobId} className="border-b border-border/50 last:border-0">
                {/* Clickable Row */}
                <div
                  onClick={() => {
                    if (matchScore) {
                      setExpandedJobId(isExpanded ? null : generation.jobId);
                    }
                  }}
                  className={`group p-4 md:p-5 hover:bg-muted/30 transition-all duration-200 ${matchScore ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
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
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => {
                          // Handle both structured and old format
                          if (generation.structuredData) {
                            try {
                              const parsed: GenerationOutput = JSON.parse(generation.structuredData);
                              // Open modal for template selection
                              setPendingGeneration({
                                resume: parsed.resume,
                                fileName: `${generation.companyName}_Resume_${formattedDate.replace(/\s/g, "_")}.pdf`
                              });
                              setIsTemplateModalOpen(true);
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

                  {/* Expanded Match Score Details - Matching ATS Score Design */}
                  {isExpanded && matchScore && (
                    <div className="mt-4 pt-6 space-y-6 border-t bg-gradient-to-b from-muted/30 to-background">
                      {/* Summary */}
                      <div className="text-sm text-foreground/70 leading-relaxed">
                        {matchScore.summary}
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Detailed Breakdown</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Skills Match */}
                          <div className="group relative p-4 rounded-xl border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getScoreColor(matchScore.skillsMatch).includes('green') ? 'bg-emerald-500/10 text-emerald-600' : getScoreColor(matchScore.skillsMatch).includes('blue') ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'} animate-pulse`} />
                                <span className="text-sm font-medium text-foreground">Skills Match</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold tabular-nums ${getScoreColor(matchScore.skillsMatch).includes('green') ? 'text-emerald-600' : getScoreColor(matchScore.skillsMatch).includes('blue') ? 'text-blue-600' : 'text-amber-600'}`}>{matchScore.skillsMatch}</span>
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(matchScore.skillsMatch)} opacity-20 blur-sm`}
                                style={{ width: `${matchScore.skillsMatch}%` }}
                              />
                              <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreColor(matchScore.skillsMatch)} rounded-full transition-all duration-700 ease-out shadow-sm`}
                                style={{ width: `${matchScore.skillsMatch}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              </div>
                            </div>
                          </div>

                          {/* Experience Match */}
                          <div className="group relative p-4 rounded-xl border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getScoreColor(matchScore.experienceMatch).includes('green') ? 'bg-emerald-500/10 text-emerald-600' : getScoreColor(matchScore.experienceMatch).includes('blue') ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'} animate-pulse`} />
                                <span className="text-sm font-medium text-foreground">Experience Match</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold tabular-nums ${getScoreColor(matchScore.experienceMatch).includes('green') ? 'text-emerald-600' : getScoreColor(matchScore.experienceMatch).includes('blue') ? 'text-blue-600' : 'text-amber-600'}`}>{matchScore.experienceMatch}</span>
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(matchScore.experienceMatch)} opacity-20 blur-sm`}
                                style={{ width: `${matchScore.experienceMatch}%` }}
                              />
                              <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreColor(matchScore.experienceMatch)} rounded-full transition-all duration-700 ease-out shadow-sm`}
                                style={{ width: `${matchScore.experienceMatch}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              </div>
                            </div>
                          </div>

                          {/* Education Match */}
                          <div className="group relative p-4 rounded-xl border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getScoreColor(matchScore.educationMatch).includes('green') ? 'bg-emerald-500/10 text-emerald-600' : getScoreColor(matchScore.educationMatch).includes('blue') ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'} animate-pulse`} />
                                <span className="text-sm font-medium text-foreground">Education Match</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold tabular-nums ${getScoreColor(matchScore.educationMatch).includes('green') ? 'text-emerald-600' : getScoreColor(matchScore.educationMatch).includes('blue') ? 'text-blue-600' : 'text-amber-600'}`}>{matchScore.educationMatch}</span>
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(matchScore.educationMatch)} opacity-20 blur-sm`}
                                style={{ width: `${matchScore.educationMatch}%` }}
                              />
                              <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreColor(matchScore.educationMatch)} rounded-full transition-all duration-700 ease-out shadow-sm`}
                                style={{ width: `${matchScore.educationMatch}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths and Gaps in Two Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Key Strengths */}
                        {matchScore.strengths.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground">Key Strengths</h3>
                            </div>
                            <ul className="space-y-2">
                              {matchScore.strengths.map((strength, idx) => (
                                <li key={idx} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-green-500/5 transition-colors">
                                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500/20 transition-colors">
                                    <span className="text-[10px] text-green-600 font-bold">✓</span>
                                  </div>
                                  <span className="text-sm text-foreground/80 leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {matchScore.gaps.length > 0 && matchScore.gaps[0] !== "none identified" && matchScore.gaps[0] !== "None identified" && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground">Areas for Improvement</h3>
                            </div>
                            <ul className="space-y-2">
                              {matchScore.gaps.map((gap, idx) => (
                                <li key={idx} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-500/5 transition-colors">
                                  <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                                    <span className="text-[10px] text-orange-600 font-bold">•</span>
                                  </div>
                                  <span className="text-sm text-foreground/70 leading-relaxed">{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        onConfirmDownload={() => {
          if (pendingGeneration) {
            generateResumePDF(
              pendingGeneration.resume,
              pendingGeneration.fileName,
              selectedTemplate
            );
            setIsTemplateModalOpen(false);
            setPendingGeneration(null);
          }
        }}
      />
    </section>
  );
}
