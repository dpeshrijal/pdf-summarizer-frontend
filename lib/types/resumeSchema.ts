/**
 * Structured Resume Schema
 * This ensures consistent, predictable formatting across all resumes
 */

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;  // Optional - not all resumes have phone
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
  coursework?: string[]; // Relevant courses taken
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  date?: string;
}

export interface Publication {
  title: string;
  authors: string;
  venue: string; // Journal, Conference, Book, etc.
  date: string;
  url?: string;
  doi?: string;
}

export interface Award {
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Language {
  language: string;
  proficiency: string; // Native, Fluent, Professional, Conversational, Basic
}

export interface VolunteerExperience {
  role: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface ProfessionalMembership {
  organization: string;
  role?: string; // e.g., "Member", "Board Member", "Chapter President"
  startDate?: string;
  endDate?: string; // or "Present"
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
  projects?: Project[]; // Optional - for developers, designers, students
  publications?: Publication[]; // Optional - for academics, researchers
  certifications?: Certification[]; // Optional - professional credentials
  awards?: Award[]; // Optional - recognitions and honors
  education: Education[];
  volunteerExperience?: VolunteerExperience[]; // Optional - community service
  professionalMemberships?: ProfessionalMembership[]; // Optional - professional organizations
  languages?: Language[]; // Optional - spoken languages
}

export interface CoverLetterData {
  paragraphs: string[];
  companyName: string;
  position: string;
}

export interface MatchScore {
  overallScore: number; // 0-100 percentage
  skillsMatch: number; // 0-100 percentage
  experienceMatch: number; // 0-100 percentage
  educationMatch: number; // 0-100 percentage
  summary: string; // Brief explanation of the score
  strengths: string[]; // What matches well
  gaps: string[]; // What's missing or weak
}

export interface GenerationOutput {
  resume: StructuredResume;
  coverLetter: CoverLetterData;
  matchScore: MatchScore; // ATS match analysis
}
