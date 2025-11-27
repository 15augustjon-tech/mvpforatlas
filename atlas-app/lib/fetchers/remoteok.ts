/**
 * RemoteOK API Fetcher
 * Fetches remote job listings - no API key required
 */

import { Opportunity } from "@/types/database";

const BASE_URL = "https://remoteok.com/api";

interface RemoteOKJob {
  id: string;
  slug: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  location: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  description: string;
  date: string;
}

export async function fetchRemoteOKJobs(): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];

  try {
    const response = await fetch(BASE_URL, {
      headers: {
        "User-Agent": "ATLAS Job Finder"
      }
    });

    if (!response.ok) {
      console.error(`RemoteOK API error: ${response.status}`);
      return [];
    }

    const data: RemoteOKJob[] = await response.json();

    // Skip first item (it's legal notice)
    for (const job of data.slice(1)) {
      if (!job.position || !job.company) continue;

      // Filter for intern/entry level positions
      const title = job.position.toLowerCase();
      if (!isEntryLevel(title)) continue;

      opportunities.push({
        id: `remoteok-${job.id || job.slug}`,
        title: job.position,
        company: job.company,
        location: job.location || "Remote",
        description: stripHtml(job.description || "").slice(0, 500),
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        url: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
        posted_date: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
        category: "Technology",
        opportunity_type: "internship",
        match_score: calculateMatchScore(job),
        tags: job.tags?.slice(0, 5) || [],
        source: "remoteok",
      });
    }
  } catch (error) {
    console.error("Error fetching RemoteOK jobs:", error);
  }

  console.log(`Fetched ${opportunities.length} jobs from RemoteOK`);
  return opportunities;
}

function isEntryLevel(title: string): boolean {
  const entryKeywords = [
    "intern", "junior", "entry", "associate", "graduate",
    "trainee", "apprentice", "co-op", "jr", "beginner"
  ];
  return entryKeywords.some(keyword => title.includes(keyword));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateMatchScore(job: RemoteOKJob): number {
  let score = 70;

  const title = job.position.toLowerCase();
  if (title.includes("intern")) score += 10;
  if (title.includes("software") || title.includes("engineer")) score += 5;
  if (job.salary_min) score += 5;
  if (job.tags && job.tags.length > 0) score += 5;

  return Math.min(score, 98);
}
