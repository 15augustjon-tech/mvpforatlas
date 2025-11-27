// Experience entry for resume
export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

// Project entry for resume
export interface Project {
  id: string;
  name: string;
  technologies: string[];
  date: string;
  bullets: string[];
  link?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  location: string;

  // Links
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;

  // Education
  university: string | null;
  degree_type: string | null;
  major: string | null;
  minor: string | null;
  graduation_month: string | null;
  graduation_year: number | null;
  gpa: number | null;
  relevant_coursework: string[];

  // Experience & Projects (JSONB)
  experiences: Experience[];
  projects: Project[];

  // Skills (categorized)
  skills: string[];
  languages: string[];
  frameworks: string[];
  tools: string[];

  // Interests & Additional
  interests: string[];
  work_authorization: string | null;
  willing_to_relocate: boolean;
  preferred_locations: string[];
  certifications: string[];
  spoken_languages: string[];

  // Resume & Meta
  resume_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_type: string;
  opportunity_data: Opportunity;
  saved_at: string;
  applied: boolean;
  applied_at: string | null;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_title: string;
  company_name: string;
  applied_at: string;
  status: "applied" | "interviewing" | "rejected" | "offer";
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  posted_date: string;
  category: string;
  opportunity_type: "internship" | "job" | "hackathon" | "scholarship";
  match_score: number;
  tags: string[];
  source: string;
}
