/**
 * Template-based PDF Generator
 * Guarantees consistent formatting and 1-page output
 */

import type {
  StructuredResume,
  CoverLetterData,
} from "@/lib/types/resumeSchema";

// Font sizes (can be adjusted for space constraints)
const FONT_SIZES = {
  name: 20,
  sectionHeader: 14,
  jobTitle: 11,
  company: 10.5,
  normal: 10.5,
  small: 10,
};

// Spacing constants - more natural spacing
const SPACING = {
  afterName: 6, // Space after name
  afterContactInfo: 2, // Space after contact line (reduced)
  beforeSection: 4.5, // Space before section header
  afterSectionHeader: 6, // Space after section header (increased to prevent overlap)
  betweenJobs: 4, // Space between job entries
  betweenEducation: 3, // Space between education entries
  bulletIndent: 5, // Indent for bullet points
  lineHeight: 4.5, // Normal line height
  tightLineHeight: 4, // Tighter line height for sub-info
};

// Page constraints - optimized margins to maximize content space
const PAGE = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  marginLeft: 20, // Reduced from 15mm to fit more content
  marginRight: 20,
  marginTop: 20, // Reduced from 15mm
  marginBottom: 20,
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
    doc.line(
      PAGE.marginLeft,
      yPos + 1.5,
      PAGE.marginLeft + textWidth,
      yPos + 1.5
    );

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

  const contactParts = [`Email: ${resume.contact.email}`];

  // Add optional contact fields only if they exist
  if (resume.contact.phone) {
    contactParts.push(`Phone: ${resume.contact.phone}`);
  }
  if (resume.contact.linkedin) {
    contactParts.push(`LinkedIn: ${resume.contact.linkedin}`);
  }
  if (resume.contact.github) {
    contactParts.push(`GitHub: ${resume.contact.github}`);
  }
  if (resume.contact.location) {
    contactParts.push(`Location: ${resume.contact.location}`);
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
      const skillLines = doc.splitTextToSize(
        skillsText,
        MAX_CONTENT_WIDTH - categoryWidth - 2
      );
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
          doc.text(
            achievementLines[j],
            PAGE.marginLeft + SPACING.bulletIndent,
            yPos
          );
          yPos += SPACING.lineHeight;
        }
      }

      // Add space between job entries (but not after the last one)
      if (i < resume.experience.length - 1) {
        yPos += SPACING.betweenJobs;
      }
    }
  }

  // 5. PROJECTS (if present)
  if (
    resume.projects &&
    resume.projects.length > 0 &&
    addSectionHeader("PROJECTS")
  ) {
    for (let i = 0; i < resume.projects.length; i++) {
      const proj = resume.projects[i];
      if (!fitsOnPage(10)) break;

      // Project name (bold) and date (normal, right-aligned) on same line
      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.text(proj.name, PAGE.marginLeft, yPos);

      if (proj.date) {
        doc.setFontSize(FONT_SIZES.normal);
        doc.setFont("helvetica", "normal");
        const dateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - PAGE.marginRight - dateWidth, yPos);
      }

      yPos += SPACING.tightLineHeight;

      // Description
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      addText(proj.description, PAGE.marginLeft, FONT_SIZES.normal);

      // Technologies (if present)
      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        const techText = `Technologies: ${proj.technologies.join(", ")}`;
        addText(techText, PAGE.marginLeft, FONT_SIZES.small);
      }

      // URL (if present)
      if (proj.url) {
        doc.setFont("helvetica", "normal");
        addText(proj.url, PAGE.marginLeft, FONT_SIZES.small);
      }

      if (i < resume.projects.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 6. PUBLICATIONS (if present)
  if (
    resume.publications &&
    resume.publications.length > 0 &&
    addSectionHeader("PUBLICATIONS")
  ) {
    for (let i = 0; i < resume.publications.length; i++) {
      const pub = resume.publications[i];
      if (!fitsOnPage(8)) break;

      // Title (bold)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      addText(pub.title, PAGE.marginLeft, FONT_SIZES.normal);

      // Authors, venue, date (normal)
      doc.setFont("helvetica", "normal");
      const pubDetails = `${pub.authors}. ${pub.venue}, ${pub.date}`;
      addText(pubDetails, PAGE.marginLeft, FONT_SIZES.small);

      if (i < resume.publications.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 7. CERTIFICATIONS (if present)
  if (
    resume.certifications &&
    resume.certifications.length > 0 &&
    addSectionHeader("CERTIFICATIONS")
  ) {
    for (let i = 0; i < resume.certifications.length; i++) {
      const cert = resume.certifications[i];
      if (!fitsOnPage(8)) break;

      // Certification name (bold)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.text(cert.name, PAGE.marginLeft, yPos);
      yPos += SPACING.tightLineHeight;

      // Issuer and date (normal weight)
      doc.setFont("helvetica", "normal");
      let certDetails = cert.issuer;
      if (cert.date) {
        certDetails += ` | ${cert.date}`;
      }
      if (cert.expiryDate) {
        certDetails += ` - ${cert.expiryDate}`;
      }
      if (cert.credentialId) {
        certDetails += ` | ID: ${cert.credentialId}`;
      }
      addText(certDetails, PAGE.marginLeft, FONT_SIZES.normal);

      if (i < resume.certifications.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 8. AWARDS (if present)
  if (
    resume.awards &&
    resume.awards.length > 0 &&
    addSectionHeader("AWARDS & HONORS")
  ) {
    for (let i = 0; i < resume.awards.length; i++) {
      const award = resume.awards[i];
      if (!fitsOnPage(8)) break;

      // Award title (bold)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.text(award.title, PAGE.marginLeft, yPos);
      yPos += SPACING.tightLineHeight;

      // Issuer and date
      doc.setFont("helvetica", "normal");
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addText(awardDetails, PAGE.marginLeft, FONT_SIZES.normal);

      if (i < resume.awards.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 9. EDUCATION
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
      const eduDetails = `${edu.institution}${
        edu.location ? ", " + edu.location : ""
      } (${edu.graduationYear})`;
      addText(eduDetails, PAGE.marginLeft, FONT_SIZES.normal);

      // Coursework (if present)
      if (edu.coursework && edu.coursework.length > 0) {
        doc.setFont("helvetica", "italic");
        const courseworkText = `Relevant Coursework: ${edu.coursework.join(
          ", "
        )}`;
        addText(courseworkText, PAGE.marginLeft, FONT_SIZES.small);
      }

      // Add space between education entries (but not after the last one)
      if (i < resume.education.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 10. VOLUNTEER EXPERIENCE (if present)
  if (
    resume.volunteerExperience &&
    resume.volunteerExperience.length > 0 &&
    addSectionHeader("VOLUNTEER EXPERIENCE")
  ) {
    for (let i = 0; i < resume.volunteerExperience.length; i++) {
      const vol = resume.volunteerExperience[i];
      if (!fitsOnPage(12)) break;

      // Role (bold) and date (normal, right-aligned) on same line
      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.text(vol.role, PAGE.marginLeft, yPos);

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      const dateText = `${vol.startDate} - ${vol.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - PAGE.marginRight - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      // Organization (normal)
      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "normal");
      doc.text(vol.organization, PAGE.marginLeft, yPos);
      yPos += SPACING.lineHeight;

      // Description bullets
      doc.setFontSize(FONT_SIZES.normal);
      for (const desc of vol.description) {
        if (!fitsOnPage(6)) break;
        doc.text("•", PAGE.marginLeft, yPos);
        const descLines = doc.splitTextToSize(
          desc,
          MAX_CONTENT_WIDTH - SPACING.bulletIndent
        );
        for (let j = 0; j < descLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(descLines[j], PAGE.marginLeft + SPACING.bulletIndent, yPos);
          yPos += SPACING.lineHeight;
        }
      }

      if (i < resume.volunteerExperience.length - 1) {
        yPos += SPACING.betweenJobs;
      }
    }
  }

  // 11. PROFESSIONAL MEMBERSHIPS (if present)
  if (
    resume.professionalMemberships &&
    resume.professionalMemberships.length > 0 &&
    addSectionHeader("PROFESSIONAL MEMBERSHIPS")
  ) {
    for (let i = 0; i < resume.professionalMemberships.length; i++) {
      const memb = resume.professionalMemberships[i];
      if (!fitsOnPage(6)) break;

      // Organization (bold)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.text(memb.organization, PAGE.marginLeft, yPos);
      yPos += SPACING.tightLineHeight;

      // Role and dates (normal)
      doc.setFont("helvetica", "normal");
      let membDetails = "";
      if (memb.role) {
        membDetails = memb.role;
      }
      if (memb.startDate) {
        membDetails += membDetails ? ` | ${memb.startDate}` : memb.startDate;
        if (memb.endDate) {
          membDetails += ` - ${memb.endDate}`;
        }
      }
      if (membDetails) {
        addText(membDetails, PAGE.marginLeft, FONT_SIZES.normal);
      }

      if (i < resume.professionalMemberships.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // 12. LANGUAGES (if present)
  if (
    resume.languages &&
    resume.languages.length > 0 &&
    addSectionHeader("LANGUAGES")
  ) {
    doc.setFontSize(FONT_SIZES.normal);
    doc.setFont("helvetica", "normal");

    // Display languages in a compact format
    const langTexts = resume.languages.map(
      (lang) => `${lang.language} (${lang.proficiency})`
    );
    const langLine = langTexts.join(" | ");
    addText(langLine, PAGE.marginLeft, FONT_SIZES.normal);
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
  doc.text(
    `Dear ${coverLetter.companyName} Hiring Team,`,
    PAGE.marginLeft,
    yPos
  );
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
