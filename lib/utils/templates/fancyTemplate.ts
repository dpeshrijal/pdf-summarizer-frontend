/**
 * Fancy Resume Template - Final polished version based on the "Charles McTurland" style.
 * This version includes aligned underlines and adjusted location formatting as requested.
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, cleanUrl, optimizeResumeToFit } from "./shared";

// COLORS accurately sampled from the target resume image
const COLORS = {
  headerBg: { r: 45, g: 45, b: 45 }, // Dark charcoal for the header
  sidebarBg: { r: 242, g: 242, b: 242 }, // Very light gray for the sidebar
  textWhite: { r: 255, g: 255, b: 255 },
  textBlack: { r: 0, g: 0, b: 0 },
  textGray: { r: 80, g: 80, b: 80 }, // Softer gray for body text and dates
  link: { r: 41, g: 128, b: 185 },
};

// FONT SIZES meticulously matched to the target's visual hierarchy
const FONT_SIZES = {
  name: 28,
  tagline: 11,
  sidebarHeader: 10,
  mainHeader: 12,
  jobTitle: 11,
  company: 10,
  normal: 9.5,
  small: 9,
  tiny: 8,
};

// SPACING adjusted for a pixel-perfect layout match
const SPACING = {
  afterName: 3,
  afterTagline: 8,
  beforeSection: 7,
  afterSectionHeader: 4,
  betweenJobs: 5,
  betweenEducation: 4, // General spacing between list items
  bulletIndent: 5,
  lineHeight: 4.2,
  tightLineHeight: 3.8,
  sidebarLineHeight: 4,
};

// LAYOUT constants defining the core structure
const LAYOUT = {
  sidebarWidth: 65,
  sidebarPadding: 8,
  mainPadding: 10,
  headerHeight: 30,
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
  const mainX = LAYOUT.sidebarWidth + LAYOUT.mainPadding;
  const mainWidth = PAGE.width - LAYOUT.sidebarWidth - LAYOUT.mainPadding * 2;
  const sidebarRightX = LAYOUT.sidebarWidth - LAYOUT.sidebarPadding;

  // Backgrounds
  doc.setFillColor(COLORS.headerBg.r, COLORS.headerBg.g, COLORS.headerBg.b);
  doc.rect(0, 0, PAGE.width, LAYOUT.headerHeight, "F");
  doc.setFillColor(COLORS.sidebarBg.r, COLORS.sidebarBg.g, COLORS.sidebarBg.b);
  doc.rect(
    0,
    LAYOUT.headerHeight,
    LAYOUT.sidebarWidth,
    PAGE.height - LAYOUT.headerHeight,
    "F"
  );

  // Header Content
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textWhite.r, COLORS.textWhite.g, COLORS.textWhite.b);
  const nameY = LAYOUT.headerHeight / 2 + 2;
  doc.text(workingResume.contact.name.toUpperCase(), PAGE.width / 2, nameY, {
    align: "center",
  });

  if (workingResume.experience.length > 0) {
    doc.setFontSize(scaledFontSizes.tagline);
    doc.setFont("helvetica", "normal");
    doc.text(
      workingResume.experience[0].title.toUpperCase(),
      PAGE.width / 2,
      nameY + 7,
      { align: "center" }
    );
  }

  let yPos = LAYOUT.headerHeight + 12;
  let sidebarY = LAYOUT.headerHeight + 12;

  // --- SIDEBAR ---
  const addSidebarSection = (title: string) => {
    sidebarY += scaledSpacing.beforeSection;
    doc.setFontSize(scaledFontSizes.sidebarHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      COLORS.textBlack.r,
      COLORS.textBlack.g,
      COLORS.textBlack.b
    );
    doc.text(title.toUpperCase(), sidebarRightX, sidebarY, { align: "right" });
    // Underline added for alignment with main section
    sidebarY += 1.5;
    doc.setDrawColor(200, 200, 200); // Lighter line for sidebar
    doc.setLineWidth(0.2);
    doc.line(LAYOUT.sidebarPadding, sidebarY, sidebarRightX, sidebarY);
    sidebarY += scaledSpacing.afterSectionHeader;
  };

  const addSidebarText = (
    text: string,
    isLink: boolean = false,
    isBold: boolean = false
  ) => {
    doc.setFontSize(isBold ? scaledFontSizes.small : scaledFontSizes.tiny);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    isLink
      ? doc.setTextColor(COLORS.link.r, COLORS.link.g, COLORS.link.b)
      : doc.setTextColor(
          COLORS.textGray.r,
          COLORS.textGray.g,
          COLORS.textGray.b
        );

    const lines = doc.splitTextToSize(
      text,
      LAYOUT.sidebarWidth - LAYOUT.sidebarPadding * 2
    );
    for (const line of lines) {
      doc.text(line, sidebarRightX, sidebarY, { align: "right" });
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
    for (const edu of workingResume.education) {
      addSidebarText(edu.degree, false, true);
      addSidebarText(edu.institution);
      addSidebarText(edu.graduationYear);
      if (edu.location) addSidebarText(edu.location);
      sidebarY += scaledSpacing.betweenEducation;
    }
  }

  // SKILLS
  if (workingResume.skills.length > 0) {
    addSidebarSection("SKILLS");
    for (const skillCat of workingResume.skills) {
      addSidebarText(skillCat.category, false, true);
      addSidebarText(skillCat.skills.join(", "));
      sidebarY += 2;
    }
  }

  // --- MAIN CONTENT ---
  const fitsOnPage = (heightNeeded: number): boolean =>
    yPos + heightNeeded <= PAGE.height - 10;

  const addMainSectionHeader = (title: string) => {
    if (!fitsOnPage(10)) return false;
    yPos += scaledSpacing.beforeSection;
    doc.setFontSize(scaledFontSizes.mainHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      COLORS.textBlack.r,
      COLORS.textBlack.g,
      COLORS.textBlack.b
    );
    doc.text(title.toUpperCase(), mainX, yPos);
    yPos += 1.5; // Same spacing as sidebar for alignment
    doc.setDrawColor(
      COLORS.textBlack.r,
      COLORS.textBlack.g,
      COLORS.textBlack.b
    );
    doc.setLineWidth(0.4);
    doc.line(mainX, yPos, PAGE.width - LAYOUT.mainPadding, yPos);
    yPos += scaledSpacing.afterSectionHeader + 2;
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
      yPos += scaledSpacing.tightLineHeight;
    }
  };

  // SUMMARY
  if (workingResume.summary && addMainSectionHeader("PROFESSIONAL SUMMARY")) {
    const summaryLines = doc.splitTextToSize(workingResume.summary, mainWidth);
    for (const line of summaryLines) {
      if (!fitsOnPage(5)) {
        contentTruncated = true;
        break;
      }
      doc.setFontSize(scaledFontSizes.normal);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(line, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
    }
  }

  // WORK EXPERIENCE (Location format changed)
  if (
    workingResume.experience.length > 0 &&
    addMainSectionHeader("WORK EXPERIENCE")
  ) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      if (!fitsOnPage(15)) break;
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        COLORS.textBlack.r,
        COLORS.textBlack.g,
        COLORS.textBlack.b
      );
      doc.text(exp.title, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;

      // Company and Location together
      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(`${exp.company} / ${exp.location}`, mainX, yPos);

      // Date only on the right
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      doc.setFont("helvetica", "italic");
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - LAYOUT.mainPadding - dateWidth, yPos);
      yPos += scaledSpacing.lineHeight;

      for (const achievement of exp.achievements) {
        if (!fitsOnPage(6)) break;
        doc.setFillColor(
          COLORS.textBlack.r,
          COLORS.textBlack.g,
          COLORS.textBlack.b
        );
        doc.circle(mainX + 2, yPos - 1.2, 0.7, "F");
        const achievementLines = doc.splitTextToSize(
          achievement,
          mainWidth - scaledSpacing.bulletIndent - 2
        );
        for (const line of achievementLines) {
          if (!fitsOnPage(5)) break;
          doc.setFontSize(scaledFontSizes.normal);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(
            COLORS.textGray.r,
            COLORS.textGray.g,
            COLORS.textGray.b
          );
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
      doc.setTextColor(
        COLORS.textBlack.r,
        COLORS.textBlack.g,
        COLORS.textBlack.b
      );
      doc.text(proj.name, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
      const descriptionPoints = proj.description
        .split("\n")
        .filter((p) => p.trim() !== "");
      for (const point of descriptionPoints) {
        if (!fitsOnPage(6)) break;
        doc.setFillColor(
          COLORS.textBlack.r,
          COLORS.textBlack.g,
          COLORS.textBlack.b
        );
        doc.circle(mainX + 2, yPos - 1.2, 0.7, "F");
        const pointLines = doc.splitTextToSize(
          point,
          mainWidth - scaledSpacing.bulletIndent - 2
        );
        for (const line of pointLines) {
          if (!fitsOnPage(5)) break;
          doc.setFontSize(scaledFontSizes.normal);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(
            COLORS.textGray.r,
            COLORS.textGray.g,
            COLORS.textGray.b
          );
          doc.text(line, mainX + scaledSpacing.bulletIndent, yPos);
          yPos += scaledSpacing.lineHeight;
        }
      }
      if (i < workingResume.projects.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  // CERTIFICATIONS
  if (
    workingResume.certifications &&
    workingResume.certifications.length > 0 &&
    addMainSectionHeader("CERTIFICATIONS")
  ) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
      if (!fitsOnPage(8)) break;
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        COLORS.textBlack.r,
        COLORS.textBlack.g,
        COLORS.textBlack.b
      );
      doc.text(cert.name, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;
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
      if (i < workingResume.certifications.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  // AWARDS
  if (
    workingResume.awards &&
    workingResume.awards.length > 0 &&
    addMainSectionHeader("AWARDS & HONORS")
  ) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
      if (!fitsOnPage(8)) break;
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        COLORS.textBlack.r,
        COLORS.textBlack.g,
        COLORS.textBlack.b
      );
      doc.text(award.title, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;
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
      if (i < workingResume.awards.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  // Logging
  if (fontScale < 1.0 || bulletsRemoved > 0) {
    console.log(`📄 Resume optimized:`);
    if (fontScale < 1.0)
      console.log(
        `   • Font size reduced by ${Math.round((1 - fontScale) * 100)}%`
      );
    if (bulletsRemoved > 0)
      console.log(`   • Removed ${bulletsRemoved} bullet point(s)`);
  }
  if (contentTruncated) {
    console.warn("⚠️ Warning: Content may have been truncated.");
  }

  doc.save(filename);
};
