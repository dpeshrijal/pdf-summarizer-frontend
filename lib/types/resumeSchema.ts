/**
 * Structured Resume Schema
 * This ensures consistent, predictable formatting across all resumes
 */

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string; // "Present" for current jobs
  achievements: string[]; // Bullet points
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface StructuredResume {
  contact: ContactInfo;
  summary: string;
  skills: SkillCategory[];
  experience: WorkExperience[];
  education: Education[];
}

export interface CoverLetterData {
  paragraphs: string[];
  companyName: string;
  position: string;
}

export interface GenerationOutput {
  resume: StructuredResume;
  coverLetter: CoverLetterData;
}
