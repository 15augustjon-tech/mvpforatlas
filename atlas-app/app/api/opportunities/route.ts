import { NextResponse } from "next/server";
import { Opportunity } from "@/types/database";

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

function calculateMatchScore(job: AdzunaJob, userSkills: string[] = []): number {
  const description = job.description.toLowerCase();
  let score = 50; // Base score

  // Check for skill matches
  const techKeywords = [
    "python", "javascript", "react", "java", "sql", "excel",
    "data analysis", "machine learning", "product", "marketing", "design"
  ];

  techKeywords.forEach((keyword) => {
    if (description.includes(keyword.toLowerCase())) {
      score += 5;
    }
    if (userSkills.some((skill) => skill.toLowerCase() === keyword)) {
      score += 10;
    }
  });

  // Boost for internship mentions
  if (description.includes("intern") || job.title.toLowerCase().includes("intern")) {
    score += 10;
  }

  // Cap at 100
  return Math.min(score, 99);
}

function extractTags(job: AdzunaJob): string[] {
  const tags: string[] = [];
  const description = job.description.toLowerCase();

  const skillKeywords = [
    "Python", "JavaScript", "React", "Java", "SQL", "Excel",
    "Data Analysis", "Machine Learning", "Communication", "Leadership"
  ];

  skillKeywords.forEach((skill) => {
    if (description.includes(skill.toLowerCase())) {
      tags.push(skill);
    }
  });

  return tags.slice(0, 4);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const userSkillsParam = searchParams.get("skills") || "";
  const userSkills = userSkillsParam ? userSkillsParam.split(",") : [];
  const userSearch = searchParams.get("search") || "";

  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json(
      { error: "Adzuna API credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Build search query based on category and user search
    let searchQuery = "intern OR entry level";
    if (userSearch) {
      // If user searched something, use that
      searchQuery = userSearch;
    } else if (category === "internship" || category === "internships") {
      searchQuery = "intern internship";
    } else if (category === "job" || category === "jobs") {
      searchQuery = "entry level junior";
    }

    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&where=california&what=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    const jobs: AdzunaJob[] = data.results || [];

    // Transform to our format
    const opportunities: Opportunity[] = jobs.map((job) => {
      const isInternship =
        job.title.toLowerCase().includes("intern") ||
        job.description.toLowerCase().includes("internship");

      return {
        id: job.id,
        title: job.title,
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "San Francisco, CA",
        description: job.description,
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        url: job.redirect_url,
        posted_date: job.created,
        category: job.category?.label || "General",
        opportunity_type: isInternship ? "internship" : "job",
        match_score: calculateMatchScore(job, userSkills),
        tags: extractTags(job),
        source: "adzuna",
      };
    });

    // Sort by match score
    opportunities.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      opportunities,
      total: data.count || opportunities.length,
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);

    // Return mock data as fallback
    const mockOpportunities: Opportunity[] = [
      {
        id: "mock-1",
        title: "Software Engineering Intern - Summer 2025",
        company: "Tech Startup",
        location: "San Francisco, CA",
        description: "Join our team as a software engineering intern...",
        salary_min: 30,
        salary_max: 45,
        url: "https://example.com/apply",
        posted_date: new Date().toISOString(),
        category: "IT Jobs",
        opportunity_type: "internship",
        match_score: 92,
        tags: ["Python", "React", "SQL"],
        source: "mock",
      },
      {
        id: "mock-2",
        title: "Data Science Intern",
        company: "Analytics Co",
        location: "San Francisco, CA",
        description: "Work with our data team on exciting projects...",
        salary_min: 35,
        salary_max: 50,
        url: "https://example.com/apply",
        posted_date: new Date().toISOString(),
        category: "IT Jobs",
        opportunity_type: "internship",
        match_score: 88,
        tags: ["Python", "Machine Learning", "SQL"],
        source: "mock",
      },
    ];

    return NextResponse.json({
      opportunities: mockOpportunities,
      total: mockOpportunities.length,
      fallback: true,
    });
  }
}
