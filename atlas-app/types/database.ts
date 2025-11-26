export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  graduation_year: number | null;
  location: string;
  skills: string[];
  interests: string[];
  resume_url: string | null;
  gpa: number | null;
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
