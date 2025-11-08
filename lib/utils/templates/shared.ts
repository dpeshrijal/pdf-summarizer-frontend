/**
 * Shared constants and utilities for PDF templates
 */

import type { StructuredResume } from "@/lib/types/resumeSchema";

// Page dimensions
export const PAGE = {
  width: 210,
  height: 297,
};

// Standard colors
export const COLORS = {
  black: { r: 0, g: 0, b: 0 },
  gray: { r: 100, g: 100, b: 100 },
};

// Margin presets
export const MARGIN_PRESETS = [
  { name: "spacious", size: 22 },
  { name: "generous", size: 19 },
  { name: "comfortable", size: 16 },
  { name: "medium", size: 13 },
  { name: "tight", size: 10 },
  { name: "minimal", size: 8 },
];

/**
 * Clean URL by removing protocol and www
 */
export const cleanUrl = (url: string): string => {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
};

/**
 * Estimate content height (in mm)
 */
export const estimateContentHeight = (resume: StructuredResume, spacing: any): number => {
  let height = 0;

  // Name + contact
  height += 20;

  // Summary
  if (resume.summary) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    const summaryLines = Math.ceil(resume.summary.length / 140);
    height += summaryLines * spacing.lineHeight;
  }

  // Skills
  if (resume.skills.length > 0) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    resume.skills.forEach(skillCat => {
      const skillText = skillCat.skills.join(", ");
      const lines = Math.ceil((skillCat.category.length + skillText.length) / 100);
      height += lines * spacing.lineHeight;
    });
  }

  // Experience
  if (resume.experience.length > 0) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    resume.experience.forEach((exp, index) => {
      height += spacing.tightLineHeight;
      height += spacing.lineHeight + 0.5;
      exp.achievements.forEach(achievement => {
        const lines = Math.ceil(achievement.length / 120);
        height += lines * spacing.lineHeight;
      });
      if (index < resume.experience.length - 1) {
        height += spacing.betweenJobs;
      }
    });
  }

  // Education
  if (resume.education.length > 0) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    resume.education.forEach((edu, index) => {
      height += spacing.tightLineHeight;
      height += spacing.lineHeight;
      if (edu.coursework && edu.coursework.length > 0) {
        const courseworkText = edu.coursework.join(", ");
        const lines = Math.ceil(courseworkText.length / 100);
        height += lines * spacing.lineHeight;
      }
      if (index < resume.education.length - 1) {
        height += spacing.betweenEducation;
      }
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    resume.projects.forEach(project => {
      height += spacing.tightLineHeight;
      const descLines = Math.ceil(project.description.length / 120);
      height += descLines * spacing.lineHeight;
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    height += spacing.beforeSection + spacing.afterSectionHeader;
    height += resume.certifications.length * spacing.lineHeight;
  }

  return height * 1.1;
};

/**
 * Remove one bullet from work experience in a balanced round-robin fashion
 */
export const removeOneBullet = (resume: StructuredResume): { success: boolean; resume: StructuredResume } => {
  const newResume = JSON.parse(JSON.stringify(resume)) as StructuredResume;

  let maxBullets = 0;
  let targetIndex = -1;

  for (let i = newResume.experience.length - 1; i >= 0; i--) {
    const bulletCount = newResume.experience[i].achievements.length;
    if (bulletCount > maxBullets && bulletCount > 1) {
      maxBullets = bulletCount;
      targetIndex = i;
    }
  }

  if (targetIndex !== -1) {
    newResume.experience[targetIndex].achievements.pop();
    return { success: true, resume: newResume };
  }

  return { success: false, resume };
};

/**
 * Check if resume fits with given margin
 */
export const fitsWithMargin = (resume: StructuredResume, margin: number, spacing: any): boolean => {
  const contentHeight = estimateContentHeight(resume, spacing);
  const availableHeight = PAGE.height - (margin * 2);
  return contentHeight <= availableHeight;
};

/**
 * Select optimal margins for given resume
 */
export const selectOptimalMargins = (resume: StructuredResume, spacing: any): number => {
  const contentHeight = estimateContentHeight(resume, spacing);
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

  return MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
};

/**
 * Progressive optimization: try multiple strategies before truncating
 */
export const optimizeResumeToFit = (resume: StructuredResume, spacing: any): {
  resume: StructuredResume;
  margin: number;
  fontScale: number;
  bulletsRemoved: number;
  optimizationApplied: string;
} => {
  let workingResume = JSON.parse(JSON.stringify(resume));
  let bulletsRemoved = 0;
  let fontScale = 1.0;

  const minMargin = MARGIN_PRESETS[MARGIN_PRESETS.length - 1].size;
  if (fitsWithMargin(workingResume, minMargin, spacing)) {
    const optimalMargin = selectOptimalMargins(workingResume, spacing);
    console.log(`✓ Fits with optimal margins (${optimalMargin}mm)`);
    return { resume: workingResume, margin: optimalMargin, fontScale, bulletsRemoved, optimizationApplied: 'none' };
  }

  console.log('⚠️ Content too long, trying optimizations...');

  // Strategy 2: 5% font reduction
  fontScale = 0.95;
  let estimatedHeight = estimateContentHeight(workingResume, spacing) * fontScale;
  if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
    console.log('✓ Fits with 5% smaller fonts');
    return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'font-reduction' };
  }

  // Strategy 3: 5% font + bullet removal
  let maxBulletsToTry = 10;
  while (bulletsRemoved < maxBulletsToTry) {
    const result = removeOneBullet(workingResume);
    if (!result.success) break;

    bulletsRemoved++;
    workingResume = result.resume;

    estimatedHeight = estimateContentHeight(workingResume, spacing) * fontScale;
    if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
      console.log(`✓ Fits with 5% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
      return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'font-reduction-and-bullets' };
    }
  }

  // Strategy 4: 10% font reduction
  fontScale = 0.90;
  estimatedHeight = estimateContentHeight(workingResume, spacing) * fontScale;
  if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
    console.log(`✓ Fits with 10% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
    return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'aggressive-font-reduction' };
  }

  // Strategy 5: Continue removing bullets
  while (bulletsRemoved < 20) {
    const result = removeOneBullet(workingResume);
    if (!result.success) break;

    bulletsRemoved++;
    workingResume = result.resume;

    estimatedHeight = estimateContentHeight(workingResume, spacing) * fontScale;
    if (estimatedHeight <= PAGE.height - (minMargin * 2)) {
      console.log(`✓ Fits with 10% smaller fonts + ${bulletsRemoved} bullet(s) removed`);
      return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'aggressive-optimization' };
    }
  }

  console.warn(`⚠️ Could not fit all content. Applied: 10% font reduction + ${bulletsRemoved} bullets removed.`);
  return { resume: workingResume, margin: minMargin, fontScale, bulletsRemoved, optimizationApplied: 'maximum-with-truncation' };
};
