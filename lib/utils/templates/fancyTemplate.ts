/**
 * Fancy Resume Template - Modern two-column layout with sidebar
 * Inspired by professional resume designs with visual hierarchy
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, COLORS, cleanUrl, optimizeResumeToFit } from "./shared";

// Fancy template font sizes
const FONT_SIZES = {
  name: 22,
  tagline: 10,
  sidebarHeader: 11,
  mainHeader: 13,
  jobTitle: 11,
  company: 10,
  normal: 9.5,
  small: 8.5,
  tiny: 8,
};

// Fancy template spacing
const SPACING = {
  afterName: 3,
  afterTagline: 8,
  beforeSection: 6,
  afterSectionHeader: 4,
  betweenJobs: 5,
  betweenEducation: 4,
  bulletIndent: 5,
  lineHeight: 4.2,
  tightLineHeight: 3.8,
  sidebarLineHeight: 4,
};

// Layout constants
const LAYOUT = {
  sidebarWidth: 65,      // Left sidebar width
  sidebarPadding: 8,     // Padding inside sidebar
  mainPadding: 10,       // Padding for main content
  headerHeight: 35,      // Height of top header section
};

export const generateFancyResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  const optimization = optimizeResumeToFit(resume, SPACING);
  const workingResume = optimization.resume;
  const fontScale = optimization.fontScale;
  const bulletsRemoved = optimization.bulletsRemoved;

  const scaledFontSizes = {
    name: FONT_SIZES.name * fontScale,
    tagline: FONT_SIZES.tagline * fontScale,
    sidebarHeader: FONT_SIZES.sidebarHeader * fontScale,
    mainHeader: FONT_SIZES.mainHeader * fontScale,
    jobTitle: FONT_SIZES.jobTitle * fontScale,
    company: FONT_SIZES.company * fontScale,
    normal: FONT_SIZES.normal * fontScale,
    small: FONT_SIZES.small * fontScale,
    tiny: FONT_SIZES.tiny * fontScale,
  };

  const scaledSpacing = {
    afterName: SPACING.afterName * fontScale,
    afterTagline: SPACING.afterTagline * fontScale,
    beforeSection: SPACING.beforeSection * fontScale,
    afterSectionHeader: SPACING.afterSectionHeader * fontScale,
    betweenJobs: SPACING.betweenJobs * fontScale,
    betweenEducation: SPACING.betweenEducation * fontScale,
    bulletIndent: SPACING.bulletIndent * fontScale,
    lineHeight: SPACING.lineHeight * fontScale,
    tightLineHeight: SPACING.tightLineHeight * fontScale,
    sidebarLineHeight: SPACING.sidebarLineHeight * fontScale,
  };

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let contentTruncated = false;
  const sidebarX = LAYOUT.sidebarPadding;
  const mainX = LAYOUT.sidebarWidth + LAYOUT.mainPadding;
  const mainWidth = PAGE.width - LAYOUT.sidebarWidth - LAYOUT.mainPadding - 10;

  // ========== SIDEBAR BACKGROUND ==========
  doc.setFillColor(45, 45, 45); // Dark gray sidebar
  doc.rect(0, 0, LAYOUT.sidebarWidth, PAGE.height, 'F');

  // ========== HEADER SECTION ==========
  let yPos = 15;

  // Name in header area (spanning across top)
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255); // White text
  doc.text(workingResume.contact.name.toUpperCase(), mainX, yPos);

  yPos += scaledSpacing.afterName;

  // Professional tagline/title (if we can infer from first job)
  if (workingResume.experience.length > 0) {
    doc.setFontSize(scaledFontSizes.tagline);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(workingResume.experience[0].title, mainX, yPos);
  }

  yPos += scaledSpacing.afterTagline;

  // ========== SIDEBAR CONTENT ==========
  let sidebarY = 15;

  // Helper for sidebar sections
  const addSidebarSection = (title: string) => {
    sidebarY += scaledSpacing.beforeSection;
    doc.setFontSize(scaledFontSizes.sidebarHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), sidebarX, sidebarY);
    sidebarY += scaledSpacing.afterSectionHeader;
  };

  const addSidebarText = (text: string, indent: number = 0) => {
    doc.setFontSize(scaledFontSizes.small);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    const lines = doc.splitTextToSize(text, LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2 - indent);
    for (const line of lines) {
      doc.text(line, sidebarX + indent, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;
    }
  };

  // CONTACT section in sidebar
  addSidebarSection("CONTACT");

  if (workingResume.contact.email) {
    addSidebarText(workingResume.contact.email);
  }
  if (workingResume.contact.phone) {
    addSidebarText(workingResume.contact.phone);
  }
  if (workingResume.contact.location) {
    addSidebarText(workingResume.contact.location);
  }
  if (workingResume.contact.linkedin) {
    addSidebarText(cleanUrl(workingResume.contact.linkedin));
  }
  if (workingResume.contact.github) {
    addSidebarText(cleanUrl(workingResume.contact.github));
  }

  // EDUCATION section in sidebar
  if (workingResume.education.length > 0) {
    addSidebarSection("EDUCATION");

    for (let i = 0; i < workingResume.education.length; i++) {
      const edu = workingResume.education[i];

      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const degreeLines = doc.splitTextToSize(edu.degree, LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2);
      for (const line of degreeLines) {
        doc.text(line, sidebarX, sidebarY);
        sidebarY += scaledSpacing.sidebarLineHeight;
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      addSidebarText(edu.institution);

      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(scaledFontSizes.tiny);
      doc.text(edu.graduationYear, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight + 2;
    }
  }

  // SKILLS section in sidebar
  if (workingResume.skills.length > 0) {
    addSidebarSection("SKILLS");

    for (const skillCat of workingResume.skills) {
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(skillCat.category, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(210, 210, 210);
      doc.setFontSize(scaledFontSizes.tiny);

      for (const skill of skillCat.skills) {
        const skillLines = doc.splitTextToSize(skill, LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2 - 3);
        for (const line of skillLines) {
          doc.text(line, sidebarX + 3, sidebarY);
          sidebarY += scaledSpacing.sidebarLineHeight * 0.9;
        }
      }
      sidebarY += 2;
    }
  }

  // LANGUAGES section in sidebar (if exists)
  if (workingResume.languages && workingResume.languages.length > 0) {
    addSidebarSection("LANGUAGES");

    for (const lang of workingResume.languages) {
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(lang.language, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(scaledFontSizes.tiny);
      doc.text(lang.proficiency, sidebarX + 3, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight + 1;
    }
  }

  // ========== MAIN CONTENT AREA ==========
  const fitsOnPage = (heightNeeded: number): boolean => {
    return yPos + heightNeeded <= PAGE.height - 10;
  };

  const addMainSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) {
      contentTruncated = true;
      return false;
    }

    yPos += scaledSpacing.beforeSection;

    doc.setFontSize(scaledFontSizes.mainHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.text(title.toUpperCase(), mainX, yPos);

    // Underline
    yPos += 1.5;
    doc.setDrawColor(45, 45, 45);
    doc.setLineWidth(0.5);
    doc.line(mainX, yPos, PAGE.width - 10, yPos);

    yPos += scaledSpacing.afterSectionHeader;
    return true;
  };

  const addMainText = (
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" | "italic" = "normal",
    color: { r: number; g: number; b: number } = COLORS.black
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color.r, color.g, color.b);
    const lines = doc.splitTextToSize(text, mainWidth - (x - mainX));
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

  // SUMMARY section
  if (workingResume.summary && addMainSectionHeader("PROFESSIONAL SUMMARY")) {
    addMainText(workingResume.summary, mainX, scaledFontSizes.normal, "normal", COLORS.black);
  }

  // WORK EXPERIENCE section
  if (workingResume.experience.length > 0 && addMainSectionHeader("WORK EXPERIENCE")) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;

      // Job title and company on same line
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(exp.title, mainX, yPos);

      // Date on the right
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - 10 - dateWidth, yPos);

      yPos += scaledSpacing.tightLineHeight;

      // Company name
      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text(exp.company, mainX, yPos);
      yPos += scaledSpacing.lineHeight;

      // Achievements
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;

        // Bullet point
        doc.setFillColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
        doc.circle(mainX + 1, yPos - 1, 0.6, 'F');

        const achievementLines = doc.splitTextToSize(
          achievement,
          mainWidth - scaledSpacing.bulletIndent
        );

        for (let j = 0; j < achievementLines.length; j++) {
          if (!fitsOnPage(5)) break;
          doc.text(
            achievementLines[j],
            mainX + scaledSpacing.bulletIndent,
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

  // PROJECTS section
  if (workingResume.projects && workingResume.projects.length > 0 && addMainSectionHeader("PROJECTS")) {
    for (let i = 0; i < workingResume.projects.length; i++) {
      const proj = workingResume.projects[i];
      if (!fitsOnPage(10)) break;

      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(proj.name, mainX, yPos);

      if (proj.date) {
        doc.setFontSize(scaledFontSizes.small);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const projDateWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, PAGE.width - 10 - projDateWidth, yPos);
      }

      yPos += scaledSpacing.tightLineHeight;

      addMainText(proj.description, mainX, scaledFontSizes.normal, "normal", COLORS.black);

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        const techText = `Technologies: ${proj.technologies.join(", ")}`;
        addMainText(techText, mainX, scaledFontSizes.small, "italic", COLORS.gray);
      }

      if (i < workingResume.projects.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // CERTIFICATIONS section
  if (workingResume.certifications && workingResume.certifications.length > 0 && addMainSectionHeader("CERTIFICATIONS")) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(cert.name, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      let certDetails = cert.issuer;
      if (cert.date) {
        certDetails += ` | ${cert.date}`;
      }
      addMainText(certDetails, mainX, scaledFontSizes.small, "normal", COLORS.gray);

      if (i < workingResume.certifications.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // AWARDS section
  if (workingResume.awards && workingResume.awards.length > 0 && addMainSectionHeader("AWARDS & HONORS")) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(award.title, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addMainText(awardDetails, mainX, scaledFontSizes.small, "normal", COLORS.gray);

      if (i < workingResume.awards.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
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
