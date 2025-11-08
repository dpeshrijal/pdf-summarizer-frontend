/**
 * PDF Template Generator - Router
 * Routes to appropriate template based on user selection
 */

import type {
  StructuredResume,
  CoverLetterData,
} from "@/lib/types/resumeSchema";
import { generateClassicResumePDF } from "./templates/classicTemplate";
import { generateFancyResumePDF } from "./templates/fancyTemplate";
import { PAGE, COLORS } from "./templates/shared";

/**
 * Generate resume PDF with selected template
 */
export const generateResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf",
  template: 'classic' | 'fancy' | 'artistic' = 'classic'
) => {
  switch (template) {
    case 'fancy':
      return generateFancyResumePDF(resume, filename);
    case 'artistic':
      // TODO: Implement artistic template
      console.warn('Artistic template not yet implemented, falling back to classic');
      return generateClassicResumePDF(resume, filename);
    case 'classic':
    default:
      return generateClassicResumePDF(resume, filename);
  }
};

/**
 * Generate cover letter PDF
 */
export const generateCoverLetterPDF = async (
  coverLetter: CoverLetterData,
  contactInfo: { name: string; email: string; phone: string },
  filename: string = "CoverLetter.pdf"
) => {
  const margins = {
    left: 19,
    right: 19,
    top: 19,
    bottom: 19,
  };

  const MAX_CONTENT_WIDTH = PAGE.width - margins.left - margins.right;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = margins.top;

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  doc.text(contactInfo.name, margins.left, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text(contactInfo.email, margins.left, yPos);
  yPos += 5;
  doc.text(contactInfo.phone, margins.left, yPos);
  yPos += 10;

  // Date
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  doc.text(today, margins.left, yPos);
  yPos += 10;

  // Recipient
  const greeting = coverLetter.companyName
    ? `Dear ${coverLetter.companyName} Hiring Team,`
    : 'Dear Hiring Manager,';
  doc.text(greeting, margins.left, yPos);
  yPos += 8;

  // Paragraphs
  doc.setFontSize(11);
  for (const paragraph of coverLetter.paragraphs) {
    const lines = doc.splitTextToSize(paragraph, MAX_CONTENT_WIDTH);
    for (const line of lines) {
      if (yPos > PAGE.height - margins.bottom) break;
      doc.text(line, margins.left, yPos);
      yPos += 5;
    }
    yPos += 3;
  }

  // Closing
  yPos += 5;
  doc.text("Sincerely,", margins.left, yPos);
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text(contactInfo.name, margins.left, yPos);

  doc.save(filename);
};
