"use client";

import { Download, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadAsPDF } from "@/lib/utils/pdfGenerator";
import {
  generateResumePDF,
  generateCoverLetterPDF,
} from "@/lib/utils/templatePdfGenerator";
import type { GenerationOutput } from "@/lib/types/resumeSchema";
import { MatchScoreDisplay } from "./MatchScoreDisplay";

interface ResultsDisplayProps {
  // New structured format
  structured?: GenerationOutput;
  // Old text format (backward compatibility)
  tailoredResume?: string;
  coverLetter?: string;
}

export function ResultsDisplay({
  structured,
  tailoredResume,
  coverLetter,
}: ResultsDisplayProps) {
  // Determine which format we're working with
  const isStructured = !!structured;

  const handleDownloadResume = () => {
    if (isStructured && structured) {
      // New format: use template-based PDF generator
      generateResumePDF(structured.resume, "Tailored_Resume.pdf");
    } else if (tailoredResume) {
      // Old format: use text-based PDF generator
      downloadAsPDF(tailoredResume, "Tailored_Resume.pdf");
    }
  };

  const handleDownloadCoverLetter = () => {
    if (isStructured && structured) {
      // New format: use template-based PDF generator
      generateCoverLetterPDF(
        structured.coverLetter,
        {
          name: structured.resume.contact.name,
          email: structured.resume.contact.email,
          phone: structured.resume.contact.phone || "", // Default to empty string if not provided
        },
        "Cover_Letter.pdf"
      );
    } else if (coverLetter) {
      // Old format: use text-based PDF generator
      downloadAsPDF(coverLetter, "Cover_Letter.pdf");
    }
  };

  // Render structured preview
  const renderStructuredResumePreview = () => {
    if (!structured) return null;

    const { resume } = structured;
    return (
      <div className="space-y-3 text-xs md:text-sm">
        {/* Header */}
        <div>
          <div className="font-bold text-lg">{resume.contact.name}</div>
          <div className="text-muted-foreground text-xs">
            {resume.contact.email}
            {resume.contact.phone && ` | ${resume.contact.phone}`}
            {resume.contact.linkedin && ` | ${resume.contact.linkedin}`}
            {resume.contact.github && ` | ${resume.contact.github}`}
            {resume.contact.location && ` | ${resume.contact.location}`}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Summary</div>
            <div>{resume.summary}</div>
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Skills</div>
            {resume.skills.map((skillCat, idx) => (
              <div key={idx} className="mb-1">
                <span className="font-semibold">{skillCat.category}:</span>{" "}
                {skillCat.skills.join(", ")}
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">
              Work Experience
            </div>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">
                  {exp.title}, {exp.company}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {exp.startDate} - {exp.endDate}
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-xs">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Education</div>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{edu.degree}</div>
                <div className="text-xs text-muted-foreground">
                  {edu.institution} ({edu.graduationYear})
                </div>
                {edu.coursework && edu.coursework.length > 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    Relevant Coursework: {edu.coursework.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Projects</div>
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{proj.name}</div>
                <div className="text-xs">{proj.description}</div>
                {proj.technologies && (
                  <div className="text-xs text-muted-foreground italic">
                    Technologies: {proj.technologies.join(", ")}
                  </div>
                )}
                {proj.url && (
                  <div className="text-xs text-muted-foreground">{proj.url}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Publications */}
        {resume.publications && resume.publications.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Publications</div>
            {resume.publications.map((pub, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{pub.title}</div>
                <div className="text-xs text-muted-foreground">
                  {pub.authors}. {pub.venue}, {pub.date}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Certifications</div>
            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{cert.name}</div>
                <div className="text-xs text-muted-foreground">
                  {cert.issuer}
                  {cert.date && ` | ${cert.date}`}
                  {cert.expiryDate && ` - ${cert.expiryDate}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Awards & Honors</div>
            {resume.awards.map((award, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{award.title}</div>
                <div className="text-xs text-muted-foreground">
                  {award.issuer} | {award.date}
                  {award.description && ` - ${award.description}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Experience */}
        {resume.volunteerExperience && resume.volunteerExperience.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Volunteer Experience</div>
            {resume.volunteerExperience.map((vol, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{vol.role}, {vol.organization}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  {vol.startDate} - {vol.endDate}
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {vol.description.map((desc, i) => (
                    <li key={i} className="text-xs">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Professional Memberships */}
        {resume.professionalMemberships && resume.professionalMemberships.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Professional Memberships</div>
            {resume.professionalMemberships.map((memb, idx) => (
              <div key={idx} className="mb-1">
                <div className="font-semibold">{memb.organization}</div>
                {memb.role && (
                  <div className="text-xs text-muted-foreground">
                    {memb.role}
                    {memb.startDate && ` | ${memb.startDate}`}
                    {memb.endDate && ` - ${memb.endDate}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <div>
            <div className="font-bold text-sm uppercase mb-1">Languages</div>
            <div className="text-xs">
              {resume.languages.map((lang, idx) => (
                <span key={idx}>
                  {lang.language} ({lang.proficiency})
                  {idx < (resume.languages?.length || 0) - 1 && " | "}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStructuredCoverLetterPreview = () => {
    if (!structured) return null;

    const { coverLetter: cl, resume } = structured;
    return (
      <div className="space-y-3 text-xs md:text-sm">
        {/* Header */}
        <div>
          <div className="font-bold">{resume.contact.name}</div>
          <div className="text-xs text-muted-foreground">
            {resume.contact.email}
          </div>
          <div className="text-xs text-muted-foreground">
            {resume.contact.phone}
          </div>
        </div>

        {/* Date */}
        <div className="text-xs">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {/* Greeting */}
        <div>Dear {cl.companyName} Hiring Team,</div>

        {/* Paragraphs */}
        {cl.paragraphs.map((para, idx) => (
          <div key={idx} className="text-justify">
            {para}
          </div>
        ))}

        {/* Closing */}
        <div>
          <div>Sincerely,</div>
          <div className="font-semibold mt-2">{resume.contact.name}</div>
        </div>
      </div>
    );
  };

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
          {/* Match Score - only for structured format */}
          {isStructured && structured?.matchScore && (
            <MatchScoreDisplay matchScore={structured.matchScore} />
          )}

          {/* Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Button
              onClick={handleDownloadResume}
              className="w-full h-auto py-4 md:py-5 flex-col gap-2 shadow-xl hover:shadow-2xl transition-all text-base md:text-lg"
              size="lg"
            >
              <Download className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-bold">Download Resume</span>
            </Button>

            <Button
              onClick={handleDownloadCoverLetter}
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
                <h4 className="font-semibold text-base md:text-lg">
                  Tailored Resume
                </h4>
              </div>
              <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                {isStructured ? (
                  renderStructuredResumePreview()
                ) : (
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {tailoredResume}
                  </pre>
                )}
              </div>
            </div>

            {/* Cover Letter Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-base md:text-lg">
                  Cover Letter
                </h4>
              </div>
              <div className="p-4 md:p-6 bg-background/50 rounded-xl max-h-96 overflow-y-auto text-xs md:text-sm border-2 shadow-inner">
                {isStructured ? (
                  renderStructuredCoverLetterPreview()
                ) : (
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {coverLetter}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
