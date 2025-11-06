/**
 * Template-based PDF Generator - PREMIUM DESIGN
 * World-class, stunning resume template with professional polish
 */

import type {
  StructuredResume,
  CoverLetterData,
} from "@/lib/types/resumeSchema";

// Premium font sizes with better hierarchy
const FONT_SIZES = {
  name: 24,           // Larger, more impactful
  sectionHeader: 13,  // Clean, modern size
  jobTitle: 11.5,     // Slightly larger for emphasis
  company: 10.5,
  normal: 10.5,
  small: 9.5,
  tiny: 9,
};

// Modern spacing - clean and breathable
const SPACING = {
  afterName: 4,
  afterContactInfo: 10,
  beforeSection: 8,
  afterSectionHeader: 5,
  betweenJobs: 6,
  betweenEducation: 5,
  bulletIndent: 6,
  lineHeight: 4.8,
  tightLineHeight: 4.2,
};

// Professional color palette (RGB)
const COLORS = {
  primary: { r: 37, g: 99, b: 235 },      // Professional blue
  darkGray: { r: 55, g: 65, b: 81 },      // For text
  mediumGray: { r: 107, g: 114, b: 128 }, // For secondary text
  lightGray: { r: 229, g: 231, b: 235 },  // For lines
  black: { r: 0, g: 0, b: 0 },
};

// Margin presets
const MARGIN_PRESETS = [
  { name: "spacious", size: 22 },
  { name: "generous", size: 19 },
  { name: "comfortable", size: 16 },
  { name: "medium", size: 13 },
  { name: "tight", size: 10 },
  { name: "minimal", size: 8 },
];

const PAGE = {
  width: 210,
  height: 297,
};

/**
 * Estimate content height (in mm)
 */
const estimateContentHeight = (resume: StructuredResume): number => {
  let height = 0;

  // Name + contact
  height += 20;

  // Summary
  if (resume.summary) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    const summaryLines = Math.ceil(resume.summary.length / 140);
    height += summaryLines * SPACING.lineHeight;
  }

  // Skills
  if (resume.skills.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    resume.skills.forEach(skillCat => {
      const skillText = skillCat.skills.join(", ");
      const lines = Math.ceil((skillCat.category.length + skillText.length) / 100);
      height += lines * SPACING.lineHeight;
    });
  }

  // Experience
  if (resume.experience.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    resume.experience.forEach((exp, index) => {
      height += SPACING.tightLineHeight;
      height += SPACING.lineHeight + 0.5;
      exp.achievements.forEach(achievement => {
        const lines = Math.ceil(achievement.length / 120);
        height += lines * SPACING.lineHeight;
      });
      if (index < resume.experience.length - 1) {
        height += SPACING.betweenJobs;
      }
    });
  }

  // Education
  if (resume.education.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    resume.education.forEach((edu, index) => {
      height += SPACING.tightLineHeight;
      height += SPACING.lineHeight;
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

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    resume.projects.forEach(project => {
      height += SPACING.tightLineHeight;
      const descLines = Math.ceil(project.description.length / 120);
      height += descLines * SPACING.lineHeight;
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    height += SPACING.beforeSection + SPACING.afterSectionHeader;
    height += resume.certifications.length * SPACING.lineHeight;
  }

  return height * 1.1;
};

/**
 * Intelligently trim work experience bullets to fit content on one page
 * Removes bullets from the END of work experience (older jobs) first
 */
const trimWorkExperienceToFit = (resume: StructuredResume, maxBulletsToRemove: number = 10): {
  trimmedResume: StructuredResume;
  bulletsRemoved: number
} => {
  let bulletsRemoved = 0;
  const trimmedResume = { ...resume };

  // Work backwards through experience (remove from older jobs first)
  for (let i = trimmedResume.experience.length - 1; i >= 0 && bulletsRemoved < maxBulletsToRemove; i--) {
    const exp = trimmedResume.experience[i];

    // Keep at least 1 bullet per job
    while (exp.achievements.length > 1 && bulletsRemoved < maxBulletsToRemove) {
      exp.achievements.pop(); // Remove last bullet
      bulletsRemoved++;

      // Check if it fits now
      const newHeight = estimateContentHeight(trimmedResume);
      const minMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
      const availableHeight = PAGE.height - (minMargin * 2);

      if (newHeight <= availableHeight) {
        console.log(`📄 Removed ${bulletsRemoved} bullet(s) from work experience to fit on one page`);
        return { trimmedResume, bulletsRemoved };
      }
    }
  }

  return { trimmedResume, bulletsRemoved };
};

/**
 * Select optimal margins
 */
const selectOptimalMargins = (resume: StructuredResume): number => {
  const contentHeight = estimateContentHeight(resume);
  const comfortableIndex = 2;

  const targetMargin = MARGIN_PRESETS[comfortableIndex];
  const targetAvailableHeight = PAGE.height - (targetMargin.size * 2);

  const contentRatio = contentHeight / targetAvailableHeight;
  if (contentRatio < 0.7) {
    for (let i = 0; i < comfortableIndex; i++) {
      const preset = MARGIN_PRESETS[i];
      const availableHeight = PAGE.height - (preset.size * 2);
      if (contentHeight / availableHeight >= 0.6) {
        console.log(`📄 Using ${preset.name} margins (${preset.size}mm)`);
        return preset.size;
      }
    }
    return targetMargin.size;
  }

  for (let i = comfortableIndex; i < MARGIN_PRESETS.length; i++) {
    const preset = MARGIN_PRESETS[i];
    const availableHeight = PAGE.height - (preset.size * 2);
    if (contentHeight <= availableHeight) {
      console.log(`📄 Using ${preset.name} margins (${preset.size}mm)`);
      return preset.size;
    }
  }

  const minimalMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  console.warn(`⚠️ Using minimal margins (${minimalMargin}mm)`);
  return minimalMargin;
};

/**
 * Generate stunning resume PDF
 */
export const generateResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  // Step 1: Try to fit with optimal margins
  let optimalMargin = selectOptimalMargins(resume);
  let workingResume = resume;
  let bulletsRemoved = 0;

  // Step 2: If even minimal margins don't fit, trim work experience bullets
  const minMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  const contentHeight = estimateContentHeight(resume);
  const minAvailableHeight = PAGE.height - (minMargin * 2);

  if (contentHeight > minAvailableHeight) {
    console.log("⚠️ Content too long even with minimal margins, trimming work experience...");
    const trimResult = trimWorkExperienceToFit(resume);
    workingResume = trimResult.trimmedResume;
    bulletsRemoved = trimResult.bulletsRemoved;

    // Recalculate optimal margins with trimmed content
    optimalMargin = selectOptimalMargins(workingResume);
  }

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
  let contentTruncated = false;

  // Helper: Check if fits
  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - margins.bottom;
  };

  // Helper: Add text with wrapping
  const addText = (
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" | "italic" = "normal",
    color: { r: number; g: number; b: number } = COLORS.darkGray,
    maxWidth: number = MAX_CONTENT_WIDTH
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color.r, color.g, color.b);
    const lines = doc.splitTextToSize(text, maxWidth);
    let linesAdded = 0;

    for (const line of lines) {
      if (!fitsOnPage(5)) {
        contentTruncated = true;
        return linesAdded;
      }
      doc.text(line, x, yPos);
      yPos += SPACING.lineHeight;
      linesAdded++;
    }

    return linesAdded;
  };

  // Helper: Add modern section header with accent line
  const addSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) {
      contentTruncated = true;
      return false;
    }

    yPos += SPACING.beforeSection;

    // Section title
    doc.setFontSize(FONT_SIZES.sectionHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.text(title.toUpperCase(), margins.left, yPos);

    // Modern accent line (full width, thin)
    const lineY = yPos + 2;
    doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setLineWidth(0.4);
    doc.line(margins.left, lineY, PAGE.width - margins.right, lineY);

    yPos += SPACING.afterSectionHeader;
    return true;
  };

  // Helper: Clean URL
  const cleanUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  };

  // ========== 1. HEADER - Name and Contact ==========
  // Name - bold, larger, professional
  doc.setFontSize(FONT_SIZES.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  const nameWidth = doc.getTextWidth(workingResume.contact.name);
  const nameX = (PAGE.width - nameWidth) / 2;
  doc.text(workingResume.contact.name, nameX, yPos);
  yPos += SPACING.afterName;

  // Thin line under name for elegance
  const underlineY = yPos;
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.setLineWidth(0.3);
  const underlineMargin = 30;
  doc.line(underlineMargin, underlineY, PAGE.width - underlineMargin, underlineY);
  yPos += 3;

  // Contact info - centered, clean layout
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);

  const contactParts: Array<{ text: string; url?: string }> = [
    { text: workingResume.contact.email, url: `mailto:${workingResume.contact.email}` }
  ];

  if (workingResume.contact.phone) {
    contactParts.push({ text: workingResume.contact.phone });
  }
  if (workingResume.contact.linkedin) {
    contactParts.push({
      text: cleanUrl(workingResume.contact.linkedin),
      url: workingResume.contact.linkedin.startsWith('http') ? workingResume.contact.linkedin : `https://${workingResume.contact.linkedin}`
    });
  }
  if (workingResume.contact.github) {
    contactParts.push({
      text: cleanUrl(workingResume.contact.github),
      url: workingResume.contact.github.startsWith('http') ? workingResume.contact.github : `https://${workingResume.contact.github}`
    });
  }
  if (workingResume.contact.location) {
    contactParts.push({ text: workingResume.contact.location });
  }

  const contactTexts = contactParts.map(p => p.text);
  const contactLine = contactTexts.join("  •  ");
  const contactLineWidth = doc.getTextWidth(contactLine);
  const contactX = (PAGE.width - contactLineWidth) / 2;

  let currentX = contactX;
  contactParts.forEach((part, index) => {
    const textWidth = doc.getTextWidth(part.text);

    if (part.url) {
      doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.textWithLink(part.text, currentX, yPos, { url: part.url });
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
    } else {
      doc.text(part.text, currentX, yPos);
    }

    currentX += textWidth;

    if (index < contactParts.length - 1) {
      const separator = "  •  ";
      const separatorWidth = doc.getTextWidth(separator);
      doc.text(separator, currentX, yPos);
      currentX += separatorWidth;
    }
  });

  yPos += SPACING.afterContactInfo;

  // ========== 2. SUMMARY ==========
  if (workingResume.summary && addSectionHeader("PROFESSIONAL SUMMARY")) {
    addText(workingResume.summary, margins.left, FONT_SIZES.normal, "normal", COLORS.darkGray);
  }

  // ========== 3. SKILLS ==========
  if (workingResume.skills.length > 0 && addSectionHeader("SKILLS")) {
    for (const skillCat of workingResume.skills) {
      if (!fitsOnPage(6)) break;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      const categoryText = `${skillCat.category}:`;
      const categoryWidth = doc.getTextWidth(categoryText);
      doc.text(categoryText, margins.left, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      const skillsText = skillCat.skills.join(", ");

      const skillLines = doc.splitTextToSize(
        skillsText,
        MAX_CONTENT_WIDTH - categoryWidth - 2
      );
      for (let i = 0; i < skillLines.length; i++) {
        if (i === 0) {
          doc.text(skillLines[i], margins.left + categoryWidth + 2, yPos);
        } else {
          yPos += SPACING.lineHeight;
          doc.text(skillLines[i], margins.left, yPos);
        }
      }
      yPos += SPACING.lineHeight;
    }
  }

  // ========== 4. WORK EXPERIENCE ==========
  if (workingResume.experience.length > 0 && addSectionHeader("WORK EXPERIENCE")) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;

      // Job title - bold, prominent
      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(exp.title, margins.left, yPos);

      // Date - right aligned, smaller
      doc.setFontSize(FONT_SIZES.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      // Company - slightly lighter
      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      doc.text(exp.company, margins.left, yPos);
      yPos += SPACING.lineHeight + 0.5;

      // Achievements with modern bullets
      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Modern bullet (small circle)
        doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
        doc.circle(margins.left + 1.5, yPos - 1, 0.8, 'F');

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

      if (i < workingResume.experience.length - 1) {
        yPos += SPACING.betweenJobs;
      }
    }
  }

  // ========== 5. PROJECTS ==========
  if (workingResume.projects && workingResume.projects.length > 0 && addSectionHeader("PROJECTS")) {
    for (let i = 0; i < workingResume.projects.length; i++) {
      const proj = workingResume.projects[i];
      if (!fitsOnPage(10)) break;

      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(proj.name, margins.left, yPos);

      if (proj.date) {
        doc.setFontSize(FONT_SIZES.small);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        const dateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - margins.right - dateWidth, yPos);
      }

      yPos += SPACING.tightLineHeight;

      addText(proj.description, margins.left, FONT_SIZES.normal, "normal", COLORS.darkGray);

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        const techText = `Technologies: ${proj.technologies.join(", ")}`;
        addText(techText, margins.left, FONT_SIZES.small, "italic", COLORS.mediumGray);
      }

      if (i < workingResume.projects.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 6. PUBLICATIONS ==========
  if (workingResume.publications && workingResume.publications.length > 0 && addSectionHeader("PUBLICATIONS")) {
    for (let i = 0; i < workingResume.publications.length; i++) {
      const pub = workingResume.publications[i];
      if (!fitsOnPage(8)) break;

      addText(pub.title, margins.left, FONT_SIZES.normal, "bold", COLORS.darkGray);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      const pubDetails = `${pub.authors}. ${pub.venue}, ${pub.date}`;
      addText(pubDetails, margins.left, FONT_SIZES.small, "normal", COLORS.mediumGray);

      if (i < workingResume.publications.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 7. CERTIFICATIONS ==========
  if (workingResume.certifications && workingResume.certifications.length > 0 && addSectionHeader("CERTIFICATIONS")) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(cert.name, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
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
      addText(certDetails, margins.left, FONT_SIZES.normal, "normal", COLORS.mediumGray);

      if (i < workingResume.certifications.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 8. AWARDS ==========
  if (workingResume.awards && workingResume.awards.length > 0 && addSectionHeader("AWARDS & HONORS")) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(award.title, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addText(awardDetails, margins.left, FONT_SIZES.normal, "normal", COLORS.mediumGray);

      if (i < workingResume.awards.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 9. EDUCATION ==========
  if (workingResume.education.length > 0 && addSectionHeader("EDUCATION")) {
    for (let i = 0; i < workingResume.education.length; i++) {
      const edu = workingResume.education[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(edu.degree, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      const eduDetails = `${edu.institution}${
        edu.location ? ", " + edu.location : ""
      } (${edu.graduationYear})`;
      addText(eduDetails, margins.left, FONT_SIZES.normal, "italic", COLORS.mediumGray);

      if (edu.coursework && edu.coursework.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        const courseworkText = `Relevant Coursework: ${edu.coursework.join(", ")}`;
        addText(courseworkText, margins.left, FONT_SIZES.small, "normal", COLORS.mediumGray);
      }

      if (i < workingResume.education.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 10. VOLUNTEER EXPERIENCE ==========
  if (workingResume.volunteerExperience && workingResume.volunteerExperience.length > 0 && addSectionHeader("VOLUNTEER EXPERIENCE")) {
    for (let i = 0; i < workingResume.volunteerExperience.length; i++) {
      const vol = workingResume.volunteerExperience[i];
      if (!fitsOnPage(12)) break;

      doc.setFontSize(FONT_SIZES.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(vol.role, margins.left, yPos);

      doc.setFontSize(FONT_SIZES.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      const dateText = `${vol.startDate} - ${vol.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += SPACING.tightLineHeight;

      doc.setFontSize(FONT_SIZES.company);
      doc.setFont("helvetica", "italic");
      doc.text(vol.organization, margins.left, yPos);
      yPos += SPACING.lineHeight;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);

      for (const desc of vol.description) {
        if (!fitsOnPage(6)) break;
        doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
        doc.circle(margins.left + 1.5, yPos - 1, 0.8, 'F');
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

      if (i < workingResume.volunteerExperience.length - 1) {
        yPos += SPACING.betweenJobs;
      }
    }
  }

  // ========== 11. PROFESSIONAL MEMBERSHIPS ==========
  if (workingResume.professionalMemberships && workingResume.professionalMemberships.length > 0 && addSectionHeader("PROFESSIONAL MEMBERSHIPS")) {
    for (let i = 0; i < workingResume.professionalMemberships.length; i++) {
      const memb = workingResume.professionalMemberships[i];
      if (!fitsOnPage(6)) break;

      doc.setFontSize(FONT_SIZES.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
      doc.text(memb.organization, margins.left, yPos);
      yPos += SPACING.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
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
        addText(membDetails, margins.left, FONT_SIZES.normal, "normal", COLORS.mediumGray);
      }

      if (i < workingResume.professionalMemberships.length - 1) {
        yPos += SPACING.betweenEducation;
      }
    }
  }

  // ========== 12. LANGUAGES ==========
  if (workingResume.languages && workingResume.languages.length > 0 && addSectionHeader("LANGUAGES")) {
    doc.setFontSize(FONT_SIZES.normal);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);

    const langTexts = workingResume.languages.map(
      (lang) => `${lang.language} (${lang.proficiency})`
    );
    const langLine = langTexts.join(" | ");
    addText(langLine, margins.left, FONT_SIZES.normal, "normal", COLORS.darkGray);
  }

  // Warn if content was intelligently trimmed or truncated
  if (bulletsRemoved > 0) {
    console.warn(`⚠️ Removed ${bulletsRemoved} bullet point(s) from work experience to fit resume on one page`);
  }
  if (contentTruncated) {
    console.warn("⚠️ Resume content was truncated to fit on one page. Consider:");
    console.warn("   • Shortening bullet points");
    console.warn("   • Removing older work experience");
    console.warn("   • Reducing coursework or project details");
  }

  // Save
  doc.save(filename);
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
  doc.setTextColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
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
  doc.setTextColor(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b);
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
