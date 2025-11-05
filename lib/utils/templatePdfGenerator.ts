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

// Margin presets - from spacious to minimal
const MARGIN_PRESETS = [
  { name: "spacious", size: 25 },    // ~1 inch - for very short resumes
  { name: "generous", size: 22 },    // ~0.87 inches - extra breathing room
  { name: "comfortable", size: 19 }, // ~0.75 inches - good readability (default)
  { name: "medium", size: 13 },      // ~0.5 inches - balanced
  { name: "tight", size: 10 },       // ~0.4 inches - compact but readable
  { name: "minimal", size: 7 },      // ~0.27 inches - last resort for long content
];

// Page constraints
const PAGE = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
};

/**
 * Estimate content height for a resume (in mm)
 * Used to determine optimal margins before rendering
 */
const estimateContentHeight = (resume: StructuredResume): number => {
  let height = 0;

  // Name (20pt font) + spacing
  height += 10;

  // Contact info + spacing
  height += 8;

  // Summary section (if exists)
  if (resume.summary) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader; // Section header
    // Estimate ~140 chars per line at normal font
    const summaryLines = Math.ceil(resume.summary.length / 140);
    height += summaryLines * SPACING.lineHeight;
  }

  // Skills section
  if (resume.skills.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader; // Section header
    resume.skills.forEach(skillCat => {
      const skillText = skillCat.skills.join(", ");
      // Estimate ~100 chars per line with category name
      const lines = Math.ceil((skillCat.category.length + skillText.length) / 100);
      height += lines * SPACING.lineHeight;
    });
  }

  // Work Experience section
  if (resume.experience.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader; // Section header
    resume.experience.forEach((exp, index) => {
      height += SPACING.tightLineHeight; // Job title line
      height += SPACING.lineHeight + 0.5; // Company line

      // Achievements
      exp.achievements.forEach(achievement => {
        // Estimate ~120 chars per line for bullets
        const lines = Math.ceil(achievement.length / 120);
        height += lines * SPACING.lineHeight;
      });

      // Space between jobs (except last)
      if (index < resume.experience.length - 1) {
        height += SPACING.betweenJobs;
      }
    });
  }

  // Education section
  if (resume.education.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader; // Section header
    resume.education.forEach((edu, index) => {
      height += SPACING.tightLineHeight; // Degree line
      height += SPACING.lineHeight; // Institution line

      // Coursework if exists
      if (edu.coursework && edu.coursework.length > 0) {
        const courseworkText = edu.coursework.join(", ");
        const lines = Math.ceil(courseworkText.length / 100);
        height += lines * SPACING.lineHeight;
      }

      if (index < resume.education.length - 1) {
        height += SPACING.betweenEducation;
      }
    });
  }

  // Projects section (if exists)
  if (resume.projects && resume.projects.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    resume.projects.forEach(project => {
      height += SPACING.tightLineHeight; // Project name
      const descLines = Math.ceil(project.description.length / 120);
      height += descLines * SPACING.lineHeight;
    });
  }

  // Certifications section (if exists)
  if (resume.certifications && resume.certifications.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    height += resume.certifications.length * SPACING.lineHeight;
  }

  // Add 10% buffer for spacing variations
  return height * 1.1;
};

/**
 * Select optimal margins based on content height
 * Works bidirectionally: expands margins for short content, shrinks for long content
 */
const selectOptimalMargins = (resume: StructuredResume): number => {
  const contentHeight = estimateContentHeight(resume);
  const comfortableIndex = 2; // "comfortable" is our target/default

  // TARGET: Aim for comfortable margins (19mm) as the sweet spot
  const targetMargin = MARGIN_PRESETS[comfortableIndex];
  const targetAvailableHeight = PAGE.height - (targetMargin.size * 2);

  // STRATEGY 1: If content is SHORT (< 70% of comfortable space), use LARGER margins
  const contentRatio = contentHeight / targetAvailableHeight;
  if (contentRatio < 0.7) {
    // Try spacious or generous margins for better visual balance
    for (let i = 0; i < comfortableIndex; i++) {
      const preset = MARGIN_PRESETS[i];
      const availableHeight = PAGE.height - (preset.size * 2);

      // Use larger margins if content still comfortably fits (at least 60% filled)
      if (contentHeight / availableHeight >= 0.6) {
        console.log(`📄 Short resume detected (${Math.round(contentHeight)}mm) - using ${preset.name} margins (${preset.size}mm) for better visual balance`);
        return preset.size;
      }
    }
    // If very short, use comfortable as minimum
    console.log(`📄 Very short resume (${Math.round(contentHeight)}mm) - using ${targetMargin.name} margins (${targetMargin.size}mm)`);
    return targetMargin.size;
  }

  // STRATEGY 2: Content is NORMAL or LONG - find smallest margin that fits
  // Start from comfortable and go tighter if needed
  for (let i = comfortableIndex; i < MARGIN_PRESETS.length; i++) {
    const preset = MARGIN_PRESETS[i];
    const availableHeight = PAGE.height - (preset.size * 2);

    if (contentHeight <= availableHeight) {
      console.log(`📄 Selected ${preset.name} margins (${preset.size}mm) - estimated ${Math.round(contentHeight)}mm content fits in ${Math.round(availableHeight)}mm`);
      return preset.size;
    }
  }

  // If nothing fits, use minimal margins as last resort
  const minimalMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  console.warn(`⚠️ Content very long (${Math.round(contentHeight)}mm), using minimal margins (${minimalMargin}mm)`);
  return minimalMargin;
};

/**
 * Generate resume PDF from structured data
 * Automatically adjusts margins to fit content on one page
 */
export const generateResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  // Select optimal margins based on content
  const optimalMargin = selectOptimalMargins(resume);

  const margins = {
    left: optimalMargin,
    right: optimalMargin,
    top: optimalMargin,
    bottom: optimalMargin,
  };

  const MAX_CONTENT_WIDTH = PAGE.width - margins.left - margins.right;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = margins.top;

  // Helper: Check if content fits on page
  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - margins.bottom;
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
    doc.text(title.toUpperCase(), margins.left, yPos);

    // Underline - positioned below the text
    const textWidth = doc.getTextWidth(title.toUpperCase());
    doc.setLineWidth(0.5);
    doc.line(
      margins.left,
      yPos + 1.5,
      margins.left + textWidth,
      yPos + 1.5
    );

    // Move yPos down to account for section header height + underline + spacing
    yPos += SPACING.afterSectionHeader;
    return true;
  };

  // 1. HEADER (Name and Contact)
  doc.setFontSize(FONT_SIZES.name);
  doc.setFont("helvetica", "bold");
  doc.text(resume.contact.name.toUpperCase(), margins.left, yPos);
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
  addText(contactLine, margins.left, FONT_SIZES.small, "normal");
  yPos += SPACING.afterContactInfo;

  // 2. SUMMARY
  if (resume.summary && addSectionHeader("SUMMARY")) {
    addText(resume.summary, margins.left, FONT_SIZES.normal);
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
      doc.text(categoryText, margins.left, yPos);

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
          doc.text(skillLines[i], margins.left + categoryWidth + 2, yPos);
        } else {
          // Continuation lines
          yPos += SPACING.lineHeight;
          doc.text(skillLines[i], margins.left, yPos);
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
      doc.text(exp.title, margins.left, yPos);

      // Date on the right (normal weight)
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      // Company name (normal weight, slightly smaller)
      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "normal");
      doc.text(exp.company, margins.left, yPos);
      yPos += SPACING.lineHeight + 0.5;

      // Achievements (bullets)
      doc.setFontSize(FONT_SIZES.normal);
      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Bullet point
        doc.text("•", margins.left, yPos);

        // Achievement text (wrapped if needed)
        const achievementLines = doc.splitTextToSize(
          achievement,
          MAX_CONTENT_WIDTH - SPACING.bulletIndent
        );

        for (let j = 0; j < achievementLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(
            achievementLines[j],
            margins.left + SPACING.bulletIndent,
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
      doc.text(proj.name, margins.left, yPos);

      if (proj.date) {
        doc.setFontSize(FONT_SIZES.normal);
        doc.setFont("helvetica", "normal");
        const dateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - margins.right - dateWidth, yPos);
      }

      yPos += SPACING.tightLineHeight;

      // Description
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      addText(proj.description, margins.left, FONT_SIZES.normal);

      // Technologies (if present)
      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        const techText = `Technologies: ${proj.technologies.join(", ")}`;
        addText(techText, margins.left, FONT_SIZES.small);
      }

      // URL (if present)
      if (proj.url) {
        doc.setFont("helvetica", "normal");
        addText(proj.url, margins.left, FONT_SIZES.small);
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
      addText(pub.title, margins.left, FONT_SIZES.normal);

      // Authors, venue, date (normal)
      doc.setFont("helvetica", "normal");
      const pubDetails = `${pub.authors}. ${pub.venue}, ${pub.date}`;
      addText(pubDetails, margins.left, FONT_SIZES.small);

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
      doc.text(cert.name, margins.left, yPos);
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
      addText(certDetails, margins.left, FONT_SIZES.normal);

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
      doc.text(award.title, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      // Issuer and date
      doc.setFont("helvetica", "normal");
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addText(awardDetails, margins.left, FONT_SIZES.normal);

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
      doc.text(edu.degree, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      // Institution and year (normal weight)
      doc.setFont("helvetica", "normal");
      const eduDetails = `${edu.institution}${
        edu.location ? ", " + edu.location : ""
      } (${edu.graduationYear})`;
      addText(eduDetails, margins.left, FONT_SIZES.normal);

      // Coursework (if present)
      if (edu.coursework && edu.coursework.length > 0) {
        doc.setFont("helvetica", "italic");
        const courseworkText = `Relevant Coursework: ${edu.coursework.join(
          ", "
        )}`;
        addText(courseworkText, margins.left, FONT_SIZES.small);
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
      doc.text(vol.role, margins.left, yPos);

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      const dateText = `${vol.startDate} - ${vol.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      // Organization (normal)
      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "normal");
      doc.text(vol.organization, margins.left, yPos);
      yPos += SPACING.lineHeight;

      // Description bullets
      doc.setFontSize(FONT_SIZES.normal);
      for (const desc of vol.description) {
        if (!fitsOnPage(6)) break;
        doc.text("•", margins.left, yPos);
        const descLines = doc.splitTextToSize(
          desc,
          MAX_CONTENT_WIDTH - SPACING.bulletIndent
        );
        for (let j = 0; j < descLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(descLines[j], margins.left + SPACING.bulletIndent, yPos);
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
      doc.text(memb.organization, margins.left, yPos);
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
        addText(membDetails, margins.left, FONT_SIZES.normal);
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
    addText(langLine, margins.left, FONT_SIZES.normal);
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
  // Cover letters typically don't need dynamic margins, use comfortable margins
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

  // Header with contact info
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(contactInfo.name, margins.left, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
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
  doc.text(today, margins.left, yPos);
  yPos += 10;

  // Recipient
  doc.text(
    `Dear ${coverLetter.companyName} Hiring Team,`,
    margins.left,
    yPos
  );
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
    yPos += 3; // Space between paragraphs
  }

  // Closing
  yPos += 5;
  doc.text("Sincerely,", margins.left, yPos);
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text(contactInfo.name, margins.left, yPos);

  doc.save(filename);
};
