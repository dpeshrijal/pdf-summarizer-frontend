/**
 * Fancy Resume Template - Stylish with borders and decorative elements
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, COLORS, cleanUrl, optimizeResumeToFit } from "./shared";

// Fancy template font sizes
const FONT_SIZES = {
  name: 26,
  sectionHeader: 12,
  jobTitle: 11,
  company: 10,
  normal: 10,
  small: 9,
  tiny: 8.5,
};

// Fancy template spacing
const SPACING = {
  afterName: 3,
  afterContactInfo: 6,
  beforeSection: 7,
  afterSectionHeader: 4,
  betweenJobs: 5,
  betweenEducation: 4,
  bulletIndent: 5,
  lineHeight: 4.5,
  tightLineHeight: 4,
};

export const generateFancyResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  const optimization = optimizeResumeToFit(resume, SPACING);
  const workingResume = optimization.resume;
  const fontScale = optimization.fontScale;
  const bulletsRemoved = optimization.bulletsRemoved;

  const margins = {
    left: optimization.margin + 2,
    right: optimization.margin + 2,
    top: optimization.margin + 2,
    bottom: optimization.margin + 2,
  };

  const MAX_CONTENT_WIDTH = PAGE.width - margins.left - margins.right;

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

  // Decorative border around entire page
  doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  doc.setLineWidth(0.5);
  doc.rect(margins.left - 1, margins.top - 1, PAGE.width - (margins.left + margins.right) + 2, PAGE.height - (margins.top + margins.bottom) + 2);

  let yPos = margins.top + 3;
  let contentTruncated = false;

  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - margins.bottom - 3;
  };

  const addText = (
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" | "italic" = "normal",
    color: { r: number; g: number; b: number } = COLORS.black,
    maxWidth: number = MAX_CONTENT_WIDTH - 4
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

  const addSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) {
      contentTruncated = true;
      return false;
    }

    yPos += scaledSpacing.beforeSection;

    doc.setFontSize(scaledFontSizes.sectionHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.text(title.toUpperCase(), margins.left, yPos);

    yPos += 1.8;

    // Double underline for fancy look
    doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.setLineWidth(0.4);
    doc.line(margins.left, yPos, PAGE.width - margins.right, yPos);
    yPos += 0.8;
    doc.setLineWidth(0.2);
    doc.line(margins.left, yPos, PAGE.width - margins.right, yPos);

    yPos += scaledSpacing.afterSectionHeader;
    return true;
  };

  // ========== FANCY HEADER with decorative box ==========
  const headerBoxTop = yPos - 2;
  const headerBoxHeight = 22 * fontScale;

  doc.setFillColor(250, 250, 250);
  doc.rect(margins.left, headerBoxTop, MAX_CONTENT_WIDTH, headerBoxHeight, 'F');
  doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  doc.setLineWidth(0.3);
  doc.rect(margins.left, headerBoxTop, MAX_CONTENT_WIDTH, headerBoxHeight);

  yPos = headerBoxTop + 6;

  // Name - centered and bold
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  const nameWidth = doc.getTextWidth(workingResume.contact.name);
  const nameX = (PAGE.width - nameWidth) / 2;
  doc.text(workingResume.contact.name, nameX, yPos);
  yPos += scaledSpacing.afterName + 3;

  doc.setFontSize(scaledFontSizes.small);
  doc.setFont("helvetica", "normal");
  const separator = "  |  ";
  let currentX = 0;

  // Contact info
  const contactParts: string[] = [];
  if (workingResume.contact.phone) contactParts.push(workingResume.contact.phone);
  contactParts.push(workingResume.contact.email);
  if (workingResume.contact.location) contactParts.push(workingResume.contact.location);

  const contactLine = contactParts.join(separator);
  const contactWidth = doc.getTextWidth(contactLine);
  currentX = (PAGE.width - contactWidth) / 2;

  contactParts.forEach((part, index) => {
    const textWidth = doc.getTextWidth(part);
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.text(part, currentX, yPos);
    currentX += textWidth;

    if (index < contactParts.length - 1) {
      doc.text(separator, currentX, yPos);
      currentX += doc.getTextWidth(separator);
    }
  });

  yPos += scaledSpacing.lineHeight + 1;

  // Online presence
  const onlineParts: string[] = [];
  if (workingResume.contact.linkedin) onlineParts.push(cleanUrl(workingResume.contact.linkedin));
  if (workingResume.contact.github) onlineParts.push(cleanUrl(workingResume.contact.github));

  if (onlineParts.length > 0) {
    const onlineLine = onlineParts.join(separator);
    const onlineWidth = doc.getTextWidth(onlineLine);
    currentX = (PAGE.width - onlineWidth) / 2;

    onlineParts.forEach((part, index) => {
      const textWidth = doc.getTextWidth(part);
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(part, currentX, yPos);
      currentX += textWidth;

      if (index < onlineParts.length - 1) {
        doc.text(separator, currentX, yPos);
        currentX += doc.getTextWidth(separator);
      }
    });
  }

  yPos = headerBoxTop + headerBoxHeight + scaledSpacing.afterContactInfo;

  // ========== SUMMARY ==========
  if (workingResume.summary && addSectionHeader("PROFESSIONAL SUMMARY")) {
    addText(workingResume.summary, margins.left, scaledFontSizes.normal, "normal", COLORS.black);
  }

  // ========== SKILLS ==========
  if (workingResume.skills.length > 0 && addSectionHeader("CORE COMPETENCIES")) {
    for (const skillCat of workingResume.skills) {
      if (!fitsOnPage(6)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      const categoryText = `${skillCat.category}:`;
      const categoryWidth = doc.getTextWidth(categoryText);
      doc.text(categoryText, margins.left, yPos);

      doc.setFont("helvetica", "normal");
      const skillsText = skillCat.skills.join(" • ");

      const skillLines = doc.splitTextToSize(
        skillsText,
        MAX_CONTENT_WIDTH - categoryWidth - 3
      );
      for (let i = 0; i < skillLines.length; i++) {
        if (i === 0) {
          doc.text(skillLines[i], margins.left + categoryWidth + 3, yPos);
        } else {
          yPos += scaledSpacing.lineHeight;
          doc.text(skillLines[i], margins.left, yPos);
        }
      }
      yPos += scaledSpacing.lineHeight;
    }
  }

  // ========== WORK EXPERIENCE ==========
  if (workingResume.experience.length > 0 && addSectionHeader("PROFESSIONAL EXPERIENCE")) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;

      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(exp.title, margins.left, yPos);

      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += scaledSpacing.tightLineHeight;

      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "italic");
      doc.text(exp.company, margins.left, yPos);
      yPos += scaledSpacing.lineHeight + 0.5;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Square bullet
        doc.setFillColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
        doc.rect(margins.left + 0.8, yPos - 2, 1.2, 1.2, 'F');

        const achievementLines = doc.splitTextToSize(
          achievement,
          MAX_CONTENT_WIDTH - scaledSpacing.bulletIndent - 1
        );

        for (let j = 0; j < achievementLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(
            achievementLines[j],
            margins.left + scaledSpacing.bulletIndent + 1,
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

  // ========== PROJECTS ==========
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
        const projDateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - margins.right - projDateWidth, yPos);
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

  // ========== CERTIFICATIONS ==========
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

  // ========== EDUCATION ==========
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
      } | ${edu.graduationYear}`;
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

  // ========== AWARDS ==========
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

  // ========== LANGUAGES ==========
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

  // Log optimization
  if (fontScale < 1.0 || bulletsRemoved > 0) {
    console.log(`📄 Fancy Resume optimized:`);
    if (fontScale < 1.0) {
      const reduction = Math.round((1 - fontScale) * 100);
      console.log(`   • Font size reduced by ${reduction}%`);
    }
    if (bulletsRemoved > 0) {
      console.log(`   • Removed ${bulletsRemoved} bullet point(s)`);
    }
  }
  if (contentTruncated) {
    console.warn("⚠️ Warning: Some content may have been truncated. The resume is very long.");
  }

  doc.save(filename);
};
