/**
 * Adzuna API Fetcher
 * Fetches internship listings from Adzuna's job search API
 */

import { Opportunity } from "@/types/database";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
  category: { label: string };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export async function fetchAdzunaInternships(): Promise<Opportunity[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.error("Adzuna credentials not configured");
    return [];
  }

  const opportunities: Opportunity[] = [];

  // Search queries for California internships
  const queries = [
    "software intern",
    "engineering intern",
    "data science intern",
    "product intern",
    "marketing intern",
    "design intern"
  ];

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        what: query,
        where: "California",
        results_per_page: "50",
        content_type: "application/json",
      });

      const response = await fetch(`${BASE_URL}?${params}`);

      if (!response.ok) {
        console.error(`Adzuna API error: ${response.status}`);
        continue;
      }

      const data: AdzunaResponse = await response.json();

      for (const job of data.results) {
        // Filter for California locations
        const location = job.location?.display_name || "";
        if (!isCaliforniaLocation(location)) continue;

        opportunities.push({
          id: `adzuna-${job.id}`,
          title: job.title,
          company: job.company?.display_name || "Unknown Company",
          location: location,
          description: job.description?.slice(0, 500) || "",
          salary_min: job.salary_min || null,
          salary_max: job.salary_max || null,
          url: job.redirect_url,
          posted_date: job.created,
          category: job.category?.label || "Technology",
          opportunity_type: "internship",
          match_score: calculateMatchScore(job),
          tags: extractTags(job.title, job.description),
          source: "adzuna",
        });
      }
    } catch (error) {
      console.error(`Error fetching Adzuna jobs for "${query}":`, error);
    }
  }

  // Remove duplicates by ID
  const uniqueOpportunities = Array.from(
    new Map(opportunities.map(o => [o.id, o])).values()
  );

  console.log(`Fetched ${uniqueOpportunities.length} internships from Adzuna`);
  return uniqueOpportunities;
}

function isCaliforniaLocation(location: string): boolean {
  const caKeywords = [
    "california", "ca", "san francisco", "los angeles", "san jose",
    "san diego", "palo alto", "mountain view", "sunnyvale", "santa clara",
    "cupertino", "menlo park", "redwood city", "oakland", "berkeley",
    "irvine", "santa monica", "pasadena", "sacramento", "remote"
  ];
  const lowerLocation = location.toLowerCase();
  return caKeywords.some(keyword => lowerLocation.includes(keyword));
}

function calculateMatchScore(job: AdzunaJob): number {
  let score = 70; // Base score

  // Boost for specific keywords
  const title = job.title.toLowerCase();
  if (title.includes("intern")) score += 10;
  if (title.includes("software") || title.includes("engineer")) score += 5;
  if (title.includes("junior") || title.includes("entry")) score += 5;
  if (job.salary_min && job.salary_min > 0) score += 5;

  return Math.min(score, 98);
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  const techKeywords = [
    "python", "javascript", "react", "node", "java", "typescript",
    "sql", "aws", "machine learning", "ai", "data", "cloud",
    "ios", "android", "mobile", "web", "frontend", "backend"
  ];

  for (const keyword of techKeywords) {
    if (text.includes(keyword)) {
      tags.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  return tags.slice(0, 5);
}
