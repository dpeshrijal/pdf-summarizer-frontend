/**
 * Modern Resume Template - Accurate reproduction of the "Deepesh Rijal" resume style.
 * This version restores the PROJECTS and AWARDS sections and includes all previous fixes.
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";
import { PAGE, cleanUrl, optimizeResumeToFit } from "./shared";

// COLORS accurately sampled and corrected
const COLORS = {
  headerBg: { r: 45, g: 45, b: 45 },
  sidebarBg: { r: 248, g: 249, b: 250 },
  textWhite: { r: 255, g: 255, b: 255 },
  textBlack: { r: 0, g: 0, b: 0 },
  textGray: { r: 80, g: 80, b: 80 },
  link: { r: 41, g: 128, b: 185 },
};

// FONT SIZES matched to the new template
const FONT_SIZES = {
  name: 32,
  tagline: 11,
  sidebarHeader: 10,
  mainHeader: 12,
  jobTitle: 11,
  company: 10,
  normal: 9.5,
  small: 9,
  tiny: 8,
};

// SPACING adjusted for the new template's layout
const SPACING = {
  afterName: 4,
  afterTagline: 10,
  beforeSection: 8,
  afterSectionHeader: 4,
  betweenJobs: 6,
  betweenEducation: 5,
  bulletIndent: 4,
  lineHeight: 4.5,
  tightLineHeight: 4,
  sidebarLineHeight: 4.5,
};

// LAYOUT constants for the new template
const LAYOUT = {
  sidebarWidth: 70,
  sidebarPadding: 10,
  mainPadding: 12,
  headerHeight: 35,
  bottomMargin: 15,
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

  const mainX = LAYOUT.sidebarWidth + LAYOUT.mainPadding;
  const mainWidth = PAGE.width - LAYOUT.sidebarWidth - LAYOUT.mainPadding * 2;
  const sidebarX = LAYOUT.sidebarPadding;

  // --- RENDER BACKGROUNDS ---
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

  // --- RENDER HEADER ---
  doc.setFontSize(scaledFontSizes.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textWhite.r, COLORS.textWhite.g, COLORS.textWhite.b);
  const nameY = LAYOUT.headerHeight / 2 + 3;
  doc.text(workingResume.contact.name.toUpperCase(), PAGE.width / 2, nameY, {
    align: "center",
  });

  if (workingResume.experience.length > 0) {
    doc.setFontSize(scaledFontSizes.tagline);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(
      COLORS.textWhite.r,
      COLORS.textWhite.g,
      COLORS.textWhite.b
    );
    doc.text(
      workingResume.experience[0].title.toUpperCase(),
      PAGE.width / 2,
      nameY + scaledSpacing.afterName + 2,
      { align: "center" }
    );
  }

  let yPos = LAYOUT.headerHeight + 12;
  let sidebarY = LAYOUT.headerHeight + 12;
  let maxYPos = 0;

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
    doc.text(title.toUpperCase(), sidebarX, sidebarY);
    sidebarY += 1.5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(
      sidebarX,
      sidebarY,
      LAYOUT.sidebarWidth - LAYOUT.sidebarPadding,
      sidebarY
    );
    sidebarY += scaledSpacing.afterSectionHeader;
  };

  const addSidebarText = (
    text: string,
    isLink: boolean = false,
    isBold: boolean = false
  ) => {
    doc.setFontSize(isBold ? scaledFontSizes.small : scaledFontSizes.tiny + 1);
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
      doc.text(line, sidebarX, sidebarY);
      sidebarY += scaledSpacing.sidebarLineHeight;
    }
  };

  addSidebarSection("CONTACT");
  if (workingResume.contact.email) addSidebarText(workingResume.contact.email);
  if (workingResume.contact.phone) addSidebarText(workingResume.contact.phone);
  if (workingResume.contact.location)
    addSidebarText(workingResume.contact.location);
  if (workingResume.contact.linkedin)
    addSidebarText(cleanUrl(workingResume.contact.linkedin), true);
  if (workingResume.contact.github)
    addSidebarText(cleanUrl(workingResume.contact.github), true);

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

  if (workingResume.skills.length > 0) {
    addSidebarSection("SKILLS");
    for (const skillCat of workingResume.skills) {
      addSidebarText(skillCat.category, false, true);
      addSidebarText(skillCat.skills.join(", "));
      sidebarY += 3;
    }
  }
  maxYPos = Math.max(maxYPos, sidebarY);

  // --- MAIN CONTENT ---
  const addMainSectionHeader = (title: string) => {
    yPos += scaledSpacing.beforeSection;
    doc.setFontSize(scaledFontSizes.mainHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      COLORS.textBlack.r,
      COLORS.textBlack.g,
      COLORS.textBlack.b
    );
    doc.text(title.toUpperCase(), mainX, yPos);
    yPos += 1.5;
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

  if (workingResume.summary && addMainSectionHeader("SUMMARY")) {
    doc.setFontSize(scaledFontSizes.normal);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
    const summaryLines = doc.splitTextToSize(workingResume.summary, mainWidth);
    for (const line of summaryLines) {
      doc.text(line, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
    }
  }

  if (
    workingResume.experience.length > 0 &&
    addMainSectionHeader("WORK EXPERIENCE")
  ) {
    for (let i = 0; i < workingResume.experience.length; i++) {
      const exp = workingResume.experience[i];
      doc.setFontSize(scaledFontSizes.jobTitle);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        COLORS.textBlack.r,
        COLORS.textBlack.g,
        COLORS.textBlack.b
      );
      doc.text(exp.title, mainX, yPos);
      yPos += scaledSpacing.tightLineHeight;
      doc.setFontSize(scaledFontSizes.company);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(`${exp.company}, ${exp.location}`, mainX, yPos);
      const dateText = `${exp.startDate} - ${exp.endDate}`;
      doc.setFont("helvetica", "italic");
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, PAGE.width - LAYOUT.mainPadding - dateWidth, yPos);
      yPos += scaledSpacing.lineHeight;
      for (const achievement of exp.achievements) {
        doc.setFillColor(
          COLORS.textBlack.r,
          COLORS.textBlack.g,
          COLORS.textBlack.b
        );
        doc.circle(mainX + 1.5, yPos - 1.2, 0.8, "F");
        const achievementLines = doc.splitTextToSize(
          achievement,
          mainWidth - scaledSpacing.bulletIndent - 2
        );
        for (const line of achievementLines) {
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

  // PROJECTS (RESTORED)
  if (
    workingResume.projects &&
    workingResume.projects.length > 0 &&
    addMainSectionHeader("PROJECTS")
  ) {
    for (let i = 0; i < workingResume.projects.length; i++) {
      const proj = workingResume.projects[i];
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
        doc.setFillColor(
          COLORS.textBlack.r,
          COLORS.textBlack.g,
          COLORS.textBlack.b
        );
        doc.circle(mainX + 1.5, yPos - 1.2, 0.8, "F");
        const pointLines = doc.splitTextToSize(
          point,
          mainWidth - scaledSpacing.bulletIndent - 2
        );
        for (const line of pointLines) {
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

  if (
    workingResume.certifications &&
    workingResume.certifications.length > 0 &&
    addMainSectionHeader("CERTIFICATIONS")
  ) {
    for (let i = 0; i < workingResume.certifications.length; i++) {
      const cert = workingResume.certifications[i];
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
      if (cert.date) certDetails += ` | ${cert.date}`;
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(certDetails, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
      if (i < workingResume.certifications.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  // AWARDS (RESTORED)
  if (
    workingResume.awards &&
    workingResume.awards.length > 0 &&
    addMainSectionHeader("AWARDS & HONORS")
  ) {
    for (let i = 0; i < workingResume.awards.length; i++) {
      const award = workingResume.awards[i];
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
      doc.setFontSize(scaledFontSizes.small);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textGray.r, COLORS.textGray.g, COLORS.textGray.b);
      doc.text(awardDetails, mainX, yPos);
      yPos += scaledSpacing.lineHeight;
      if (i < workingResume.awards.length - 1)
        yPos += scaledSpacing.betweenEducation;
    }
  }

  maxYPos = Math.max(maxYPos, yPos);

  // --- FINALIZE DOCUMENT ---
  doc.internal.pageSize.height = maxYPos + LAYOUT.bottomMargin;

  doc.save(filename);
};
