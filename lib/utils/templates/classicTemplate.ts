/**
 * Classic Resume Template - Clean and minimalist design
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, COLORS, cleanUrl, optimizeResumeToFit } from "./shared";

// Classic template font sizes
const FONT_SIZES = {
  name: 24,
  sectionHeader: 13,
  jobTitle: 11.5,
  company: 10.5,
  normal: 10.5,
  small: 9.5,
  tiny: 9,
};

// Classic template spacing
const SPACING = {
  afterName: 4,
  afterContactInfo: 8,
  beforeSection: 8,
  afterSectionHeader: 5,
  betweenJobs: 6,
  betweenEducation: 5,
  bulletIndent: 6,
  lineHeight: 4.8,
  tightLineHeight: 4.2,
};

export const generateClassicResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  const optimization = optimizeResumeToFit(resume, SPACING);
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

  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - margins.bottom;
  };

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

    yPos += 2.5;

    doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPos, PAGE.width - margins.right, yPos);

    yPos += scaledSpacing.afterSectionHeader;
    return true;
  };

  // ========== HEADER ==========
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
  const nameWidth = doc.getTextWidth(workingResume.contact.name);
  const nameX = (PAGE.width - nameWidth) / 2;
  doc.text(workingResume.contact.name, nameX, yPos);
  yPos += scaledSpacing.afterName + 4;

  doc.setFontSize(scaledFontSizes.small);
  doc.setFont("helvetica", "normal");
  const separator = "  •  ";
  let currentX = 0;

  // Physical contact line
  const physicalContactParts: Array<{ text: string; url?: string }> = [];
  if (workingResume.contact.phone) {
    physicalContactParts.push({ text: workingResume.contact.phone });
  }
  if (workingResume.contact.location) {
    physicalContactParts.push({ text: workingResume.contact.location });
  }

  if (physicalContactParts.length > 0) {
    const physicalTexts = physicalContactParts.map(p => p.text);
    const physicalLine = physicalTexts.join(separator);
    const physicalWidth = doc.getTextWidth(physicalLine);
    currentX = (PAGE.width - physicalWidth) / 2;

    physicalContactParts.forEach((part, index) => {
      const textWidth = doc.getTextWidth(part.text);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(part.text, currentX, yPos);
      currentX += textWidth;

      if (index < physicalContactParts.length - 1) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.text(separator, currentX, yPos);
        currentX += doc.getTextWidth(separator);
      }
    });

    yPos += scaledSpacing.lineHeight + 1.5;
  }

  // Online presence line
  const onlineContactParts: Array<{ text: string; url?: string }> = [];
  onlineContactParts.push({
    text: workingResume.contact.email,
    url: `mailto:${workingResume.contact.email}`
  });

  if (workingResume.contact.linkedin) {
    onlineContactParts.push({
      text: cleanUrl(workingResume.contact.linkedin),
      url: workingResume.contact.linkedin.startsWith('http') ? workingResume.contact.linkedin : `https://${workingResume.contact.linkedin}`
    });
  }

  if (workingResume.contact.github) {
    onlineContactParts.push({
      text: cleanUrl(workingResume.contact.github),
      url: workingResume.contact.github.startsWith('http') ? workingResume.contact.github : `https://${workingResume.contact.github}`
    });
  }

  const onlineTexts = onlineContactParts.map(p => p.text);
  const onlineLine = onlineTexts.join(separator);
  const onlineWidth = doc.getTextWidth(onlineLine);
  currentX = (PAGE.width - onlineWidth) / 2;

  onlineContactParts.forEach((part, index) => {
    const textWidth = doc.getTextWidth(part.text);

    if (part.url) {
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.textWithLink(part.text, currentX, yPos, { url: part.url });
    } else {
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(part.text, currentX, yPos);
    }

    currentX += textWidth;

    if (index < onlineContactParts.length - 1) {
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(separator, currentX, yPos);
      currentX += doc.getTextWidth(separator);
    }
  });

  yPos += scaledSpacing.afterContactInfo;

  // ========== SUMMARY ==========
  if (workingResume.summary && addSectionHeader("SUMMARY")) {
    addText(workingResume.summary, margins.left, scaledFontSizes.normal, "normal", COLORS.black);
  }

  // ========== SKILLS ==========
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

  // ========== WORK EXPERIENCE ==========
  if (workingResume.experience.length > 0 && addSectionHeader("WORK EXPERIENCE")) {
    const reversedExperience = [...workingResume.experience].reverse();
    for (let i = 0; i < reversedExperience.length; i++) {
      const exp = reversedExperience[i];
      if (!fitsOnPage(15)) break;

      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(exp.title, margins.left, yPos);

      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - margins.right - dateWidth, yPos);

      yPos += scaledSpacing.tightLineHeight;

      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(exp.company, margins.left, yPos);
      yPos += scaledSpacing.lineHeight + 0.5;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

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

      if (i < reversedExperience.length - 1) {
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

  // ========== PUBLICATIONS ==========
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

  // ========== VOLUNTEER EXPERIENCE ==========
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

  // ========== PROFESSIONAL MEMBERSHIPS ==========
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

  doc.save(filename);
};
