/**
 * Fancy Resume Template - Modern two-column layout with sidebar
 * Inspired by professional resume designs with visual hierarchy
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, cleanUrl, optimizeResumeToFit } from "./shared";

// Define COLORS based on the template's visual style
const COLORS = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  headerBg: { r: 34, g: 34, b: 34 },
  sidebarBg: { r: 242, g: 242, b: 242 },
  textDark: { r: 51, g: 51, b: 51 },
  textGray: { r: 102, g: 102, b: 102 },
  link: { r: 41, g: 128, b: 185 },
};

// Adjusted font sizes for visual accuracy
const FONT_SIZES = {
  name: 36,
  tagline: 12,
  sidebarHeader: 10,
  mainHeader: 12,
  jobTitle: 11,
  company: 10,
  normal: 10,
  small: 9,
  tiny: 8,
};

// Fine-tuned spacing to match the template
const SPACING = {
  afterName: 2,
  afterTagline: 12,
  beforeSection: 8,
  afterSectionHeader: 3,
  betweenJobs: 6,
  betweenEducation: 5, // Used for spacing between items in a list
  bulletIndent: 4,
  lineHeight: 4.5,
  tightLineHeight: 4,
  sidebarLineHeight: 5,
};

// Layout constants adjusted for the template
const LAYOUT = {
  sidebarWidth: 70,
  sidebarPadding: 10,
  mainPadding: 12,
  headerHeight: 40,
};

export const generateFancyResumePDF = async (
  resume: StructuredResume,
  filename: string = "Resume.pdf"
) => {
  const optimization = optimizeResumeToFit(resume, SPACING);
  const workingResume = optimization.resume;
  const fontScale = optimization.fontScale;
  const bulletsRemoved = optimization.bulletsRemoved;

  const scaledFontSizes = Object.fromEntries(
    Object.entries(FONT_SIZES).map(([key, value]) => [key, value * fontScale])
  );
  const scaledSpacing = Object.fromEntries(
    Object.entries(SPACING).map(([key, value]) => [key, value * fontScale])
  );

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let contentTruncated = false;
  const sidebarX = LAYOUT.sidebarPadding;
  const mainX = LAYOUT.sidebarWidth + LAYOUT.mainPadding;
  const mainWidth = PAGE.width - LAYOUT.sidebarWidth - LAYOUT.mainPadding * 2;

  // Backgrounds
  doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.rect(
    LAYOUT.sidebarWidth,
    0,
    PAGE.width - LAYOUT.sidebarWidth,
    PAGE.height,
    "F"
  );
  doc.setFillColor(COLORS.sidebarBg.r, COLORS.sidebarBg.g, COLORS.sidebarBg.b);
  doc.rect(0, 0, LAYOUT.sidebarWidth, PAGE.height, "F");
  doc.setFillColor(COLORS.headerBg.r, COLORS.headerBg.g, COLORS.headerBg.b);
  doc.rect(
    LAYOUT.sidebarWidth,
    0,
    PAGE.width - LAYOUT.sidebarWidth,
    LAYOUT.headerHeight,
    "F"
  );

  // Header Content
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  const nameY = 22;
  doc.text(workingResume.contact.name.toUpperCase(), mainX, nameY);

  if (workingResume.experience.length > 0) {
    doc.setFontSize(scaledFontSizes.tagline);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.text(
      workingResume.experience[0].title.toUpperCase(),
      mainX,
      nameY + scaledFontSizes.tagline
    );
  }

  let yPos = LAYOUT.headerHeight + 10;
  let sidebarY = 15;

  // --- SIDEBAR ---
  const addSidebarSection = (title: string) => {
    sidebarY += scaledSpacing.beforeSection;
    doc.setFontSize(scaledFontSizes.sidebarHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.text(title.toUpperCase(), sidebarX, sidebarY);

    sidebarY += scaledSpacing.afterSectionHeader;
    doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.setLineWidth(0.3);
    doc.line(
      sidebarX,
      sidebarY,
      LAYOUT.sidebarWidth - LAYOUT.sidebarPadding,
      sidebarY
    );
    sidebarY += 2;
  };

  const addSidebarText = (text: string, isLink: boolean = false) => {
    doc.setFontSize(scaledFontSizes.small);
    doc.setFont("helvetica", "normal");
    isLink
      ? doc.setTextColor(COLORS.link.r, COLORS.link.g, COLORS.link.b)
      : doc.setTextColor(
          COLORS.textDark.r,
          COLORS.textDark.g,
          COLORS.textDark.b
        );

    const lines = doc.splitTextToSize(
      text,
      LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2
    );
    for (const line of lines) {
      doc.text(line, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;
    }
  };

  // CONTACT
  addSidebarSection("CONTACT");
  if (workingResume.contact.email) addSidebarText(workingResume.contact.email);
  if (workingResume.contact.phone) addSidebarText(workingResume.contact.phone);
  if (workingResume.contact.location)
    addSidebarText(workingResume.contact.location);
  if (workingResume.contact.linkedin)
    addSidebarText(cleanUrl(workingResume.contact.linkedin), true);
  if (workingResume.contact.github)
    addSidebarText(cleanUrl(workingResume.contact.github), true);

  // EDUCATION
  if (workingResume.education.length > 0) {
    addSidebarSection("EDUCATION");
    for (let i = 0; i < workingResume.education.length; i++) {
      const edu = workingResume.education[i];
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      const degreeLines = doc.splitTextToSize(
        edu.degree,
        LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2
      );
      for (const line of degreeLines) {
        doc.text(line, sidebarX, sidebarY);
        sidebarY += scaledSpacing.tightLineHeight;
      }

      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textDark.r, COLORS.textDark.g, COLORS.textDark.b);
      const instLines = doc.splitTextToSize(
        edu.institution,
        LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2
      );
      for (const line of instLines) {
        doc.text(line, sidebarX, sidebarY);
        sidebarY += scaledSpacing.sidebarLineHeight;
      }

      doc.setFont("helvetica", "italic");
      doc.setFontSize(scaledFontSizes.tiny);
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(edu.graduationYear, sidebarX, sidebarY); // Using your original property
      sidebarY += scaledSpacing.sidebarLineHeight;
      if (edu.location) {
        doc.text(edu.location, sidebarX, sidebarY);
        sidebarY += scaledSpacing.sidebarLineHeight;
      }
      if (i < workingResume.education.length - 1)
        sidebarY += scaledSpacing.betweenEducation;
    }
  }

  // SKILLS
  if (workingResume.skills.length > 0) {
    addSidebarSection("SKILLS");
    for (const skillCat of workingResume.skills) {
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(skillCat.category, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(scaledFontSizes.small);
      doc.setTextColor(COLORS.textDark.r, COLORS.textDark.g, COLORS.textDark.b);
      const skillsText = skillCat.skills.join(", ");
      const skillLines = doc.splitTextToSize(
        skillsText,
        LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2
      );
      for (const line of skillLines) {
        doc.text(line, sidebarX, sidebarY);
        sidebarY += scaledSpacing.sidebarLineHeight * 0.9;
      }
      sidebarY += 2;
    }
  }

  // --- MAIN CONTENT ---
  const fitsOnPage = (heightNeeded: number): boolean =>
    yPos + heightNeeded <= PAGE.height - 10;

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
    yPos += scaledSpacing.afterSectionHeader;
    doc.setDrawColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
    doc.setLineWidth(0.5);
    doc.line(mainX, yPos, PAGE.width - LAYOUT.mainPadding, yPos);
    yPos += 3;
    return true;
  };

  const addMainText = (
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" | "italic",
    color: { r: number; g: number; b: number }
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color.r, color.g, color.b);
    const lines = doc.splitTextToSize(text, mainWidth - (x - mainX));
    for (const line of lines) {
      if (!fitsOnPage(5)) {
        contentTruncated = true;
        break;
      }
      doc.text(line, x, yPos);
      yPos += scaledSpacing.lineHeight;
    }
  };

  // SUMMARY (RESTORED)
  if (workingResume.summary && addMainSectionHeader("PROFESSIONAL SUMMARY")) {
    addMainText(
      workingResume.summary,
      mainX,
      scaledFontSizes.normal,
      "normal",
      COLORS.textDark
    );
  }

  // WORK EXPERIENCE
  if (
    workingResume.experience.length > 0 &&
    addMainSectionHeader("WORK EXPERIENCE")
  ) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(exp.title, mainX, yPos);
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - LAYOUT.mainPadding - dateWidth, yPos);
      yPos += scaledSpacing.tightLineHeight;
      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.textDark.r, COLORS.textDark.g, COLORS.textDark.b);
      doc.text(`${exp.company} / ${exp.location}`, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textDark.r, COLORS.textDark.g, COLORS.textDark.b);
      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;
        doc.text("•", mainX, yPos);
        const achievementLines = doc.splitTextToSize(
          achievement,
          mainWidth - scaledSpacing.bulletIndent
        );
        for (const line of achievementLines) {
          if (!fitsOnPage(5)) break;
          doc.text(line, mainX + scaledSpacing.bulletIndent, yPos);
          yPos += scaledSpacing.lineHeight;
        }
      }
      if (i < workingResume.experience.length - 1)
        yPos += scaledSpacing.betweenJobs;
    }
  }

  // PROJECTS
  if (
    workingResume.projects &&
    workingResume.projects.length > 0 &&
    addMainSectionHeader("PROJECTS")
  ) {
    for (let i = 0; i < workingResume.projects.length; i++) {
      const proj = workingResume.projects[i];
      if (!fitsOnPage(10)) break;
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(proj.name, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
      const descriptionPoints = proj.description
        .split("\n")
        .filter((p) => p.trim() !== "");
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textDark.r, COLORS.textDark.g, COLORS.textDark.b);
      for (const point of descriptionPoints) {
        if (!fitsOnPage(6)) break;
        doc.text("•", mainX, yPos);
        const pointLines = doc.splitTextToSize(
          point,
          mainWidth - scaledSpacing.bulletIndent
        );
        for (const line of pointLines) {
          if (!fitsOnPage(5)) break;
          doc.text(line, mainX + scaledSpacing.bulletIndent, yPos);
          yPos += scaledSpacing.lineHeight;
        }
      }
      if (i < workingResume.projects.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  // CERTIFICATIONS (RESTORED with your original logic and new styling)
  if (
    workingResume.certifications &&
    workingResume.certifications.length > 0 &&
    addMainSectionHeader("CERTIFICATIONS")
  ) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(cert.name, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      let certDetails = cert.issuer;
      if (cert.date) {
        certDetails += ` | ${cert.date}`;
      }
      addMainText(
        certDetails,
        mainX,
        scaledFontSizes.small,
        "normal",
        COLORS.textGray
      );

      if (i < workingResume.certifications.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // AWARDS (RESTORED with your original logic and new styling)
  if (
    workingResume.awards &&
    workingResume.awards.length > 0 &&
    addMainSectionHeader("AWARDS & HONORS")
  ) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
      if (!fitsOnPage(8)) break;

      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black.r, COLORS.black.g, COLORS.black.b);
      doc.text(award.title, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      let awardDetails = `${award.issuer} | ${award.date}`;
      if (award.description) {
        awardDetails += ` - ${award.description}`;
      }
      addMainText(
        awardDetails,
        mainX,
        scaledFontSizes.small,
        "normal",
        COLORS.textGray
      );

      if (i < workingResume.awards.length - 1) {
        yPos += scaledSpacing.betweenEducation;
      }
    }
  }

  // Log optimization
  if (fontScale < 1.0 || bulletsRemoved > 0) {
    console.log(`📄 Fancy Resume optimized:`);
    if (fontScale < 1.0)
      console.log(
        `   • Font size reduced by ${Math.round((1 - fontScale) * 100)}%`
      );
    if (bulletsRemoved > 0)
      console.log(`   • Removed ${bulletsRemoved} bullet point(s)`);
  }
  if (contentTruncated) {
    console.warn(
      "⚠️ Warning: Some content may have been truncated. The resume is very long."
    );
  }

  doc.save(filename);
};
