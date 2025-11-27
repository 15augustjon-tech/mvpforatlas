/**
 * Remotive API Fetcher
 * Fetches remote job listings - no API key required
 */

import { Opportunity } from "@/types/database";

const BASE_URL = "https://remotive.com/api/remote-jobs";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  "job-count": number;
  jobs: RemotiveJob[];
}

export async function fetchRemotiveJobs(): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];

  try {
    // Fetch software dev jobs
    const response = await fetch(`${BASE_URL}?category=software-dev&limit=50`);

    if (!response.ok) {
      console.error(`Remotive API error: ${response.status}`);
      return [];
    }

    const data: RemotiveResponse = await response.json();

    for (const job of data.jobs) {
      // Filter for intern/entry level positions
      const title = job.title.toLowerCase();
      if (!isEntryLevel(title)) continue;

      // Parse salary if available
      const salaryInfo = parseSalary(job.salary);

      opportunities.push({
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        description: stripHtml(job.description || "").slice(0, 500),
        salary_min: salaryInfo.min,
        salary_max: salaryInfo.max,
        url: job.url,
        posted_date: job.publication_date,
        category: job.category || "Technology",
        opportunity_type: "internship",
        match_score: calculateMatchScore(job),
        tags: job.tags?.slice(0, 5) || [],
        source: "remotive",
      });
    }
  } catch (error) {
    console.error("Error fetching Remotive jobs:", error);
  }

  console.log(`Fetched ${opportunities.length} jobs from Remotive`);
  return opportunities;
}

function isEntryLevel(title: string): boolean {
  const entryKeywords = [
    "intern", "junior", "entry", "associate", "graduate",
    "trainee", "apprentice", "co-op", "jr", "beginner", "I", " i "
  ];
  // Also accept jobs that don't specify senior/lead/principal
  const seniorKeywords = ["senior", "sr.", "lead", "principal", "staff", "director", "manager", "head"];

  const hasEntryKeyword = entryKeywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
  const hasSeniorKeyword = seniorKeywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));

  return hasEntryKeyword || !hasSeniorKeyword;
}

function parseSalary(salary: string): { min: number | null; max: number | null } {
  if (!salary) return { min: null, max: null };

  // Try to extract numbers from salary string like "$80,000 - $100,000"
  const numbers = salary.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return {
      min: parseInt(numbers[0]) * (salary.includes("k") ? 1000 : 1),
      max: parseInt(numbers[1]) * (salary.includes("k") ? 1000 : 1),
    };
  } else if (numbers && numbers.length === 1) {
    const val = parseInt(numbers[0]) * (salary.includes("k") ? 1000 : 1);
    return { min: val, max: val };
  }

  return { min: null, max: null };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateMatchScore(job: RemotiveJob): number {
  let score = 70;

  const title = job.title.toLowerCase();
  if (title.includes("intern")) score += 10;
  if (title.includes("software") || title.includes("engineer")) score += 5;
  if (job.salary) score += 5;
  if (job.tags && job.tags.length > 0) score += 5;
  if (title.includes("junior") || title.includes("entry")) score += 5;

  return Math.min(score, 98);
}
