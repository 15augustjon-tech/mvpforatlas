/**
 * Arbeitnow API Fetcher
 * Fetches job listings from Arbeitnow's free job API
 * No API key required!
 */

import { Opportunity } from "@/types/database";

const BASE_URL = "https://www.arbeitnow.com/api/job-board-api";

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  url: string;
  created_at: number;
  tags: string[];
  remote: boolean;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: {
    next?: string;
  };
}

export async function fetchArbeitnowJobs(): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];

  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      console.error(`Arbeitnow API error: ${response.status}`);
      return [];
    }

    const data: ArbeitnowResponse = await response.json();

    for (const job of data.data) {
      // Filter for US/Remote jobs (Arbeitnow is more EU-focused)
      const location = job.location || "";
      if (!isRelevantLocation(location, job.remote)) continue;

      // Filter for intern/entry level positions
      const title = job.title.toLowerCase();
      if (!isEntryLevel(title)) continue;

      opportunities.push({
        id: `arbeitnow-${job.slug}`,
        title: job.title,
        company: job.company_name,
        location: job.remote ? "Remote" : job.location,
        description: stripHtml(job.description).slice(0, 500),
        salary_min: null,
        salary_max: null,
        url: job.url,
        posted_date: new Date(job.created_at * 1000).toISOString(),
        category: "Technology",
        opportunity_type: "internship",
        match_score: calculateMatchScore(job),
        tags: job.tags?.slice(0, 5) || [],
        source: "arbeitnow",
      });
    }
  } catch (error) {
    console.error("Error fetching Arbeitnow jobs:", error);
  }

  console.log(`Fetched ${opportunities.length} jobs from Arbeitnow`);
  return opportunities;
}

function isRelevantLocation(location: string, isRemote: boolean): boolean {
  if (isRemote) return true;

  const usKeywords = [
    "united states", "usa", "us", "california", "new york",
    "san francisco", "los angeles", "remote"
  ];
  const lowerLocation = location.toLowerCase();
  return usKeywords.some(keyword => lowerLocation.includes(keyword));
}

function isEntryLevel(title: string): boolean {
  const entryKeywords = [
    "intern", "junior", "entry", "associate", "graduate",
    "trainee", "apprentice", "co-op"
  ];
  return entryKeywords.some(keyword => title.includes(keyword));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateMatchScore(job: ArbeitnowJob): number {
  let score = 70;

  const title = job.title.toLowerCase();
  if (title.includes("intern")) score += 10;
  if (title.includes("software") || title.includes("engineer")) score += 5;
  if (job.remote) score += 5;
  if (job.tags && job.tags.length > 0) score += 5;

  return Math.min(score, 98);
}
