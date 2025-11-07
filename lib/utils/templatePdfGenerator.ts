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

// Black and white only
const COLORS = {
  black: { r: 0, g: 0, b: 0 },
  gray: { r: 100, g: 100, b: 100 }, // For dates/secondary info
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
 * Remove one bullet from work experience (oldest job first)
 * Returns a NEW resume object with the bullet removed
 */
const removeOneBullet = (resume: StructuredResume): { success: boolean; resume: StructuredResume } => {
  // Create a deep clone
  const newResume = JSON.parse(JSON.stringify(resume)) as StructuredResume;

  // Work backwards through experience (remove from older jobs first)
  for (let i = newResume.experience.length - 1; i >= 0; i--) {
    const exp = newResume.experience[i];

    // Keep at least 1 bullet per job
    if (exp.achievements.length > 1) {
      exp.achievements.pop();
      return { success: true, resume: newResume };
    }
  }

  return { success: false, resume };
};

/**
 * Select optimal margins for given resume
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
        return preset.size;
      }
    }
    return targetMargin.size;
  }

  for (let i = comfortableIndex; i < MARGIN_PRESETS.length; i++) {
    const preset = MARGIN_PRESETS[i];
    const availableHeight = PAGE.height - (preset.size * 2);
    if (contentHeight <= availableHeight) {
      return preset.size;
    }
  }

  const minimalMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  return minimalMargin;
};

/**
 * Check if resume fits with given margin
 */
const fitsWithMargin = (resume: StructuredResume, margin: number): boolean => {
  const contentHeight = estimateContentHeight(resume);
  const availableHeight = PAGE.height - (margin * 2);
  return contentHeight <= availableHeight;
};

/**
 * Progressive optimization: try multiple strategies before truncating
 */
const optimizeResumeToFit = (resume: StructuredResume): {
  resume: StructuredResume;
  margin: number;
  fontScale: number;
  bulletsRemoved: number;
  optimizationApplied: string;
} => {
  let workingResume = JSON.parse(JSON.stringify(resume)); // Deep clone
  let bulletsRemoved = 0;
  let fontScale = 1.0;

  // Strategy 1: Try with progressively smaller margins
  const minMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  if (fitsWithMargin(workingResume, minMargin)) {
    const optimalMargin = selectOptimalMargins(workingResume);
    console.log(`✓ Fits with optimal margins (${optimalMargin}mm)`);
    return { resume: workingResume, margin: optimalMargin, fontScale, bulletsRemoved, optimizationApplied: 'none' };
  }

  console.log('⚠️ Content too long, trying optimizations...');

  // Strategy 2: Try reducing font sizes by 5%
  fontScale = 0.95;
  // Note: We'll apply fontScale during rendering, so we need to estimate with reduced height
  let estimatedHeight = estimateContentHeight(workingResume) * fontScale;
  if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
    console.log('✓ Fits with 5% smaller fonts');
    return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'font-reduction' };
  }

  // Strategy 3: Try 5% font reduction + remove bullets one by one
  let maxBulletsToTry = 10;
  while (bulletsRemoved < maxBulletsToTry) {
    const result = removeOneBullet(workingResume);
    if (!result.success) break;

    bulletsRemoved++;
    workingResume = result.resume;

    estimatedHeight = estimateContentHeight(workingResume) * fontScale;
    if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
      console.log(`✓ Fits with 5% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
      return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'font-reduction-and-bullets' };
    }
  }

  // Strategy 4: Try 10% font reduction with current bullet removal
  fontScale = 0.90;
  estimatedHeight = estimateContentHeight(workingResume) * fontScale;
  if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
    console.log(`✓ Fits with 10% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
    return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'aggressive-font-reduction' };
  }

  // Strategy 5: Continue removing bullets with 10% font reduction
  while (bulletsRemoved < 20) {
    const result = removeOneBullet(workingResume);
    if (!result.success) break;

    bulletsRemoved++;
    workingResume = result.resume;

    estimatedHeight = estimateContentHeight(workingResume) * fontScale;
    if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
      console.log(`✓ Fits with 10% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
      return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'aggressive-optimization' };
    }
  }

  // Last resort: return what we have (will truncate during rendering)
  console.warn(`⚠️ Could not fit all content. Applied: 10% font reduction + ${bulletsRemoved} bullets removed. Some content may be truncated.`);
  return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'maximum-with-truncation' };
};

/**
 * Generate stunning resume PDF
 */
export const generateResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  // Apply progressive optimization strategies
  const optimization = optimizeResumeToFit(resume);
  const workingResume = optimization.resume;
  const fontScale = optimization.fontScale;
  const bulletsRemoved = optimization.bulletsRemoved;

  const margins = {
    left: optimization.margin,
    right: optimization.margin,
    top: optimization.margin,
    bottom: optimization.margin,
  };

  const MAX_CONTENT_WIDTH = PAGE.width - margins.left - margins.right;

  // Apply font and spacing scaling if optimization required it
  const scaledFontSizes = {
    name: FONT_SIZES.name * fontScale,
    sectionHeader: FONT_SIZES.sectionHeader * fontScale,
    jobTitle: FONT_SIZES.jobTitle * fontScale,
    company: FONT_SIZES.company * fontScale,
    normal: FONT_SIZES.normal * fontScale,
    small: FONT_SIZES.small * fontScale,
    tiny: FONT_SIZES.tiny * fontScale,
  };

  const scaledSpacing = {
    afterName: SPACING.afterName * fontScale,
    afterContactInfo: SPACING.afterContactInfo * fontScale,
    beforeSection: SPACING.beforeSection * fontScale,
    afterSectionHeader: SPACING.afterSectionHeader * fontScale,
    betweenJobs: SPACING.betweenJobs * fontScale,
    betweenEducation: SPACING.betweenEducation * fontScale,
    bulletIndent: SPACING.bulletIndent * fontScale,
    lineHeight: SPACING.lineHeight * fontScale,
    tightLineHeight: SPACING.tightLineHeight * fontScale,
  };

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
    color: { r: number; g: number; b: number } = COLORS.black,
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
      yPos += scaledSpacing.lineHeight;
      linesAdded++;
    }

    return linesAdded;
  };

  // Helper: Add section header with underline
  const addSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) {
      contentTruncated = true;
      return false;
    }

    yPos += scaledSpacing.beforeSection;

    // Section title in black
    doc.setFontSize(scaledFontSizes.sectionHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.text(title.toUpperCase(), margins.left, yPos);

    // Add some spacing before the line
    yPos += 2.5;

    // Accent line (full width, thin)
    doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPos, PAGE.width - margins.right, yPos);

    yPos += scaledSpacing.afterSectionHeader;
    return true;
  };

  // Helper: Clean URL
  const cleanUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  };

  // ========== 1. HEADER - Minimalist Two-Line Elegance ==========
  // Line 1: Name - commanding presence
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  const nameWidth = doc.getTextWidth(workingResume.contact.name);
  const nameX = (PAGE.width - nameWidth) / 2;
  doc.text(workingResume.contact.name, nameX, yPos);
  yPos += scaledSpacing.afterName;

  // Line 2: Primary Contact - Email & Phone (essential reach-out info)
  doc.setFontSize(scaledFontSizes.small);
  doc.setFont("helvetica", "normal");

  const primaryContactParts: Array<{ text: string; url?: string }> = [];

  // Email (always present, clickable)
  primaryContactParts.push({
    text: workingResume.contact.email,
    url: `mailto:${workingResume.contact.email}`
  });

  // Phone (if available)
  if (workingResume.contact.phone) {
    primaryContactParts.push({ text: workingResume.contact.phone });
  }

  // Calculate width and render primary contact
  const primaryTexts = primaryContactParts.map(p => p.text);
  const primaryLine = primaryTexts.join(" • ");
  const primaryWidth = doc.getTextWidth(primaryLine);
  let currentX = (PAGE.width - primaryWidth) / 2;

  primaryContactParts.forEach((part, index) => {
    const textWidth = doc.getTextWidth(part.text);

    if (part.url) {
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.textWithLink(part.text, currentX, yPos, { url: part.url });
    } else {
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(part.text, currentX, yPos);
    }

    currentX += textWidth;

    if (index < primaryContactParts.length - 1) {
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const separator = " • ";
      doc.text(separator, currentX, yPos);
      currentX += doc.getTextWidth(separator);
    }
  });

  yPos += scaledSpacing.lineHeight; // Proper line spacing between contact lines

  // Line 3: Secondary Contact - LinkedIn, GitHub, Location (online presence)
  const secondaryContactParts: Array<{ text: string; url?: string }> = [];

  if (workingResume.contact.linkedin) {
    secondaryContactParts.push({
      text: cleanUrl(workingResume.contact.linkedin),
      url: workingResume.contact.linkedin.startsWith('http') ? workingResume.contact.linkedin : `https://${workingResume.contact.linkedin}`
    });
  }

  if (workingResume.contact.github) {
    secondaryContactParts.push({
      text: cleanUrl(workingResume.contact.github),
      url: workingResume.contact.github.startsWith('http') ? workingResume.contact.github : `https://${workingResume.contact.github}`
    });
  }

  if (workingResume.contact.location) {
    secondaryContactParts.push({ text: workingResume.contact.location });
  }

  // Render secondary contact (slightly smaller, more subtle)
  if (secondaryContactParts.length > 0) {
    doc.setFontSize(scaledFontSizes.small * 0.90); // Noticeably smaller for clear hierarchy

    const secondaryTexts = secondaryContactParts.map(p => p.text);
    const secondaryLine = secondaryTexts.join(" • ");
    const secondaryWidth = doc.getTextWidth(secondaryLine);
    currentX = (PAGE.width - secondaryWidth) / 2;

    secondaryContactParts.forEach((part, index) => {
      const textWidth = doc.getTextWidth(part.text);

      if (part.url) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.textWithLink(part.text, currentX, yPos, { url: part.url });
      } else {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.text(part.text, currentX, yPos);
      }

      currentX += textWidth;

      if (index < secondaryContactParts.length - 1) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const separator = " • ";
        doc.text(separator, currentX, yPos);
        currentX += doc.getTextWidth(separator);
      }
    });

    yPos += scaledSpacing.afterContactInfo; // Full spacing after all contact info
  } else {
    yPos += scaledSpacing.afterContactInfo; // Same spacing even without secondary info
  }

  // ========== 2. SUMMARY ==========
  if (workingResume.summary && addSectionHeader("SUMMARY")) {
    addText(workingResume.summary, margins.left, scaledFontSizes.normal, "normal", COLORS.black);
  }

  // ========== 3. SKILLS ==========
  if (workingResume.skills.length > 0 && addSectionHeader("SKILLS")) {
    for (const skillCat of workingResume.skills) {
      if (!fitsOnPage(6)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      const categoryText = `${skillCat.category}:`;
      const categoryWidth = doc.getTextWidth(categoryText);
      doc.text(categoryText, margins.left, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      const skillsText = skillCat.skills.join(", ");

      const skillLines = doc.splitTextToSize(
        skillsText,
        MAX_CONTENT_WIDTH - categoryWidth - 2
      );
      for (let i = 0; i < skillLines.length; i++) {
        if (i === 0) {
          doc.text(skillLines[i], margins.left + categoryWidth + 2, yPos);
        } else {
          yPos += scaledSpacing.lineHeight;
          doc.text(skillLines[i], margins.left, yPos);
        }
      }
      yPos += scaledSpacing.lineHeight;
    }
  }

  // ========== 4. WORK EXPERIENCE ==========
  if (workingResume.experience.length > 0 && addSectionHeader("WORK EXPERIENCE")) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;

      // Job title - bold, prominent
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(exp.title, margins.left, yPos);

      // Date - right aligned, smaller
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += scaledSpacing.tightLineHeight;

      // Company - slightly lighter
      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(exp.company, margins.left, yPos);
      yPos += scaledSpacing.lineHeight + 0.5;

      // Achievements with modern bullets
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Modern bullet (small circle)
        doc.setFillColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
        doc.circle(margins.left + 1.5, yPos - 1, 0.8, 'F');

        const achievementLines = doc.splitTextToSize(
          achievement,
          MAX_CONTENT_WIDTH - scaledSpacing.bulletIndent
        );

        for (let j = 0; j < achievementLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(
            achievementLines[j],
            margins.left + scaledSpacing.bulletIndent,
            yPos
          );
          yPos += scaledSpacing.lineHeight;
        }
      }

      if (i < workingResume.experience.length - 1) {
        yPos += scaledSpacing.betweenJobs;
      }
    }
  }

  // ========== 5. PROJECTS ==========
  if (workingResume.projects && workingResume.projects.length > 0 && addSectionHeader("PROJECTS")) {
    for (let i = 0; i < workingResume.projects.length; i++) {
      const proj = workingResume.projects[i];
      if (!fitsOnPage(10)) break;

      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(proj.name, margins.left, yPos);

      if (proj.date) {
        doc.setFontSize(scaledFontSizes.small);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const dateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - margins.right - dateWidth, yPos);
      }

      yPos += scaledSpacing.tightLineHeight;

      addText(proj.description, margins.left, scaledFontSizes.normal, "normal", COLORS.black);

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const techText = `Technologies: ${proj.technologies.join(", ")}`;
        addText(techText, margins.left, scaledFontSizes.small, "italic", COLORS.gray);
      }

      if (i < workingResume.projects.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 6. PUBLICATIONS ==========
  if (workingResume.publications && workingResume.publications.length > 0 && addSectionHeader("PUBLICATIONS")) {
    for (let i = 0; i < workingResume.publications.length; i++) {
      const pub = workingResume.publications[i];
      if (!fitsOnPage(8)) break;

      addText(pub.title, margins.left, scaledFontSizes.normal, "bold", COLORS.black);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const pubDetails = `${pub.authors}. ${pub.venue}, ${pub.date}`;
      addText(pubDetails, margins.left, scaledFontSizes.small, "normal", COLORS.gray);

      if (i < workingResume.publications.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 7. CERTIFICATIONS ==========
  if (workingResume.certifications && workingResume.certifications.length > 0 && addSectionHeader("CERTIFICATIONS")) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(cert.name, margins.left, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
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
      addText(certDetails, margins.left, scaledFontSizes.normal, "normal", COLORS.gray);

      if (i < workingResume.certifications.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 8. AWARDS ==========
  if (workingResume.awards && workingResume.awards.length > 0 && addSectionHeader("AWARDS & HONORS")) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(award.title, margins.left, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addText(awardDetails, margins.left, scaledFontSizes.normal, "normal", COLORS.gray);

      if (i < workingResume.awards.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 9. EDUCATION ==========
  if (workingResume.education.length > 0 && addSectionHeader("EDUCATION")) {
    for (let i = 0; i < workingResume.education.length; i++) {
      const edu = workingResume.education[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(edu.degree, margins.left, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const eduDetails = `${edu.institution}${
        edu.location ? ", " + edu.location : ""
      } (${edu.graduationYear})`;
      addText(eduDetails, margins.left, scaledFontSizes.normal, "italic", COLORS.gray);

      if (edu.coursework && edu.coursework.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const courseworkText = `Relevant Coursework: ${edu.coursework.join(", ")}`;
        addText(courseworkText, margins.left, scaledFontSizes.small, "normal", COLORS.gray);
      }

      if (i < workingResume.education.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 10. VOLUNTEER EXPERIENCE ==========
  if (workingResume.volunteerExperience && workingResume.volunteerExperience.length > 0 && addSectionHeader("VOLUNTEER EXPERIENCE")) {
    for (let i = 0; i < workingResume.volunteerExperience.length; i++) {
      const vol = workingResume.volunteerExperience[i];
      if (!fitsOnPage(12)) break;

      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(vol.role, margins.left, yPos);

      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const dateText = `${vol.startDate} - ${vol.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += scaledSpacing.tightLineHeight;

      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "italic");
      doc.text(vol.organization, margins.left, yPos);
      yPos += scaledSpacing.lineHeight;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

      for (const desc of vol.description) {
        if (!fitsOnPage(6)) break;
        doc.setFillColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
        doc.circle(margins.left + 1.5, yPos - 1, 0.8, 'F');
        const descLines = doc.splitTextToSize(
          desc,
          MAX_CONTENT_WIDTH - scaledSpacing.bulletIndent
        );
        for (let j = 0; j < descLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(descLines[j], margins.left + scaledSpacing.bulletIndent, yPos);
          yPos += scaledSpacing.lineHeight;
        }
      }

      if (i < workingResume.volunteerExperience.length - 1) {
        yPos += scaledSpacing.betweenJobs;
      }
    }
  }

  // ========== 11. PROFESSIONAL MEMBERSHIPS ==========
  if (workingResume.professionalMemberships && workingResume.professionalMemberships.length > 0 && addSectionHeader("PROFESSIONAL MEMBERSHIPS")) {
    for (let i = 0; i < workingResume.professionalMemberships.length; i++) {
      const memb = workingResume.professionalMemberships[i];
      if (!fitsOnPage(6)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(memb.organization, margins.left, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
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
        addText(membDetails, margins.left, scaledFontSizes.normal, "normal", COLORS.gray);
      }

      if (i < workingResume.professionalMemberships.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // ========== 12. LANGUAGES ==========
  if (workingResume.languages && workingResume.languages.length > 0 && addSectionHeader("LANGUAGES")) {
    doc.setFontSize(scaledFontSizes.normal);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

    const langTexts = workingResume.languages.map(
      (lang) => `${lang.language} (${lang.proficiency})`
    );
    const langLine = langTexts.join(" | ");
    addText(langLine, margins.left, scaledFontSizes.normal, "normal", COLORS.black);
  }

  // Log optimization applied
  if (fontScale < 1.0 || bulletsRemoved > 0) {
    console.log(`📄 Resume optimized to fit on one page:`);
    if (fontScale < 1.0) {
      const reduction = Math.round((1 - fontScale) * 100);
      console.log(`   • Font size reduced by ${reduction}%`);
    }
    if (bulletsRemoved > 0) {
      console.log(`   • Removed ${bulletsRemoved} bullet point(s) from older work experience`);
    }
  }
  if (contentTruncated) {
    console.warn("⚠️ Warning: Some content may have been truncated. The resume is very long.");
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

  // Recipient - handle null/undefined company name gracefully
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
