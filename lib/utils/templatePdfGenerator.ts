/**
 * Template-based PDF Generator
 * Guarantees consistent formatting and 1-page output
 */

import type { StructuredResume, CoverLetterData } from "@/lib/types/resumeSchema";

// Font sizes (can be adjusted for space constraints)
const FONT_SIZES = {
  name: 18,
  sectionHeader: 11,
  jobTitle: 10.5,
  company: 10,
  normal: 10,
  small: 9,
};

// Spacing constants - more natural spacing
const SPACING = {
  afterName: 6,           // Space after name
  afterContactInfo: 2,    // Space after contact line (reduced)
  beforeSection: 4.5,     // Space before section header
  afterSectionHeader: 6,  // Space after section header (increased to prevent overlap)
  betweenJobs: 4,         // Space between job entries
  betweenEducation: 3,    // Space between education entries
  bulletIndent: 5,        // Indent for bullet points
  lineHeight: 4.5,        // Normal line height
  tightLineHeight: 4,     // Tighter line height for sub-info
};

// Page constraints
const PAGE = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  marginLeft: 15,
  marginRight: 15,
  marginTop: 15,
  marginBottom: 15,
};

const MAX_CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
const MAX_CONTENT_HEIGHT = PAGE.height - PAGE.marginTop - PAGE.marginBottom;

/**
 * Generate resume PDF from structured data
 */
export const generateResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = PAGE.marginTop;

  // Helper: Check if content fits on page
  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - PAGE.marginBottom;
  };

  // Helper: Add text with proper wrapping
  const addText = (
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" = "normal",
    maxWidth: number = MAX_CONTENT_WIDTH
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, maxWidth);
    let linesAdded = 0;

    for (const line of lines) {
      if (!fitsOnPage(5)) {
        return linesAdded; // Stop if no space
      }
      doc.text(line, x, yPos);
      yPos += SPACING.lineHeight;
      linesAdded++;
    }

    return linesAdded;
  };

  // Helper: Add section header
  const addSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) return false;

    yPos += SPACING.beforeSection;
    doc.setFontSize(FONT_SIZES.sectionHeader);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), PAGE.marginLeft, yPos);

    // Underline - positioned below the text
    const textWidth = doc.getTextWidth(title.toUpperCase());
    doc.setLineWidth(0.5);
    doc.line(PAGE.marginLeft, yPos + 1.5, PAGE.marginLeft + textWidth, yPos + 1.5);

    // Move yPos down to account for section header height + underline + spacing
    yPos += SPACING.afterSectionHeader;
    return true;
  };

  // 1. HEADER (Name and Contact)
  doc.setFontSize(FONT_SIZES.name);
  doc.setFont("helvetica", "bold");
  doc.text(resume.contact.name.toUpperCase(), PAGE.marginLeft, yPos);
  yPos += SPACING.afterName;

  // Contact info (normal weight, single line)
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont("helvetica", "normal");

  const contactParts = [
    `Email: ${resume.contact.email}`,
    `Phone: ${resume.contact.phone}`,
  ];

  if (resume.contact.linkedin) {
    contactParts.push(`LinkedIn: ${resume.contact.linkedin}`);
  }
  if (resume.contact.github) {
    contactParts.push(`GitHub: ${resume.contact.github}`);
  }

  const contactLine = contactParts.join(" | ");
  addText(contactLine, PAGE.marginLeft, FONT_SIZES.small, "normal");
  yPos += SPACING.afterContactInfo;

  // 2. SUMMARY
  if (resume.summary && addSectionHeader("SUMMARY")) {
    addText(resume.summary, PAGE.marginLeft, FONT_SIZES.normal);
  }

  // 3. SKILLS
  if (resume.skills.length > 0 && addSectionHeader("SKILLS")) {
    for (const skillCat of resume.skills) {
      if (!fitsOnPage(6)) break;

      // Category name in bold
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      const categoryText = `${skillCat.category}:`;
      const categoryWidth = doc.getTextWidth(categoryText);
      doc.text(categoryText, PAGE.marginLeft, yPos);

      // Skills in normal weight on same line
      doc.setFont("helvetica", "normal");
      const skillsText = skillCat.skills.join(", ");

      // Split skills into multiple lines if needed
      const skillLines = doc.splitTextToSize(skillsText, MAX_CONTENT_WIDTH - categoryWidth - 2);
      for (let i = 0; i < skillLines.length; i++) {
        if (i === 0) {
          // First line on same line as category
          doc.text(skillLines[i], PAGE.marginLeft + categoryWidth + 2, yPos);
        } else {
          // Continuation lines
          yPos += SPACING.lineHeight;
          doc.text(skillLines[i], PAGE.marginLeft, yPos);
        }
      }
      yPos += SPACING.lineHeight;
    }
  }

  // 4. WORK EXPERIENCE
  if (resume.experience.length > 0 && addSectionHeader("WORK EXPERIENCE")) {
    for (let i = 0; i < resume.experience.length; i++) {
      const exp = resume.experience[i];
      if (!fitsOnPage(15)) break; // Need minimum space for job entry

      // Job title (bold) and date (normal, right-aligned) on same line
      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.text(exp.title, PAGE.marginLeft, yPos);

      // Date on the right (normal weight)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - PAGE.marginRight - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      // Company name (normal weight, slightly smaller)
      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "normal");
      doc.text(exp.company, PAGE.marginLeft, yPos);
      yPos += SPACING.lineHeight + 0.5;

      // Achievements (bullets)
      doc.setFontSize(FONT_SIZES.normal);
      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Bullet point
        doc.text("•", PAGE.marginLeft, yPos);

        // Achievement text (wrapped if needed)
        const achievementLines = doc.splitTextToSize(
          achievement,
          MAX_CONTENT_WIDTH - SPACING.bulletIndent
        );

        for (let j = 0; j < achievementLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(achievementLines[j], PAGE.marginLeft + SPACING.bulletIndent, yPos);
          yPos += SPACING.lineHeight;
        }
      }

      // Add space between job entries (but not after the last one)
      if (i < resume.experience.length - 1) {
        yPos += SPACING.betweenJobs;
      }
    }
  }

  // 5. EDUCATION
  if (resume.education.length > 0 && addSectionHeader("EDUCATION")) {
    for (let i = 0; i < resume.education.length; i++) {
      const edu = resume.education[i];
      if (!fitsOnPage(8)) break;

      // Degree (bold)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.text(edu.degree, PAGE.marginLeft, yPos);
      yPos += SPACING.tightLineHeight;

      // Institution and year (normal weight)
      doc.setFont("helvetica", "normal");
      const eduDetails = `${edu.institution}${edu.location ? ", " + edu.location : ""} (${edu.graduationYear})`;
      addText(eduDetails, PAGE.marginLeft, FONT_SIZES.normal);

      // Add space between education entries (but not after the last one)
      if (i < resume.education.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // Save
  doc.save(filename);
};

/**
 * Generate cover letter PDF from structured data
 */
export const generateCoverLetterPDF = async (
  coverLetter: CoverLetterData,
  contactInfo: { name: string; email: string; phone: string },
  filename: string = "CoverLetter.pdf"
) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = PAGE.marginTop;

  // Header with contact info
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(contactInfo.name, PAGE.marginLeft, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(contactInfo.email, PAGE.marginLeft, yPos);
  yPos += 5;
  doc.text(contactInfo.phone, PAGE.marginLeft, yPos);
  yPos += 10;

  // Date
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.text(today, PAGE.marginLeft, yPos);
  yPos += 10;

  // Recipient
  doc.text(`Dear ${coverLetter.companyName} Hiring Team,`, PAGE.marginLeft, yPos);
  yPos += 8;

  // Paragraphs
  doc.setFontSize(11);
  for (const paragraph of coverLetter.paragraphs) {
    const lines = doc.splitTextToSize(paragraph, MAX_CONTENT_WIDTH);
    for (const line of lines) {
      if (yPos > PAGE.height - PAGE.marginBottom) break;
      doc.text(line, PAGE.marginLeft, yPos);
      yPos += 5;
    }
    yPos += 3; // Space between paragraphs
  }

  // Closing
  yPos += 5;
  doc.text("Sincerely,", PAGE.marginLeft, yPos);
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text(contactInfo.name, PAGE.marginLeft, yPos);

  doc.save(filename);
};
