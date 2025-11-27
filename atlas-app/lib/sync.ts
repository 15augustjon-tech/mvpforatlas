import { supabaseAdmin } from "./supabase";
import { fetchAdzunaInternships } from "./fetchers/adzuna";
import { fetchArbeitnowJobs } from "./fetchers/arbeitnow";
import { fetchRemoteOKJobs } from "./fetchers/remoteok";
import { fetchRemotiveJobs } from "./fetchers/remotive";

export async function syncOpportunities(): Promise<{
  added: number;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  const updated = 0;

  console.log("Starting opportunity sync...");

  // Fetch from all sources
  const [adzunaJobs, arbeitnowJobs, remoteokJobs, remotiveJobs] = await Promise.all([
    fetchAdzunaInternships().catch(err => {
      errors.push(`Adzuna: ${err.message}`);
      return [];
    }),
    fetchArbeitnowJobs().catch(err => {
      errors.push(`Arbeitnow: ${err.message}`);
      return [];
    }),
    fetchRemoteOKJobs().catch(err => {
      errors.push(`RemoteOK: ${err.message}`);
      return [];
    }),
    fetchRemotiveJobs().catch(err => {
      errors.push(`Remotive: ${err.message}`);
      return [];
    }),
  ]);

  const allOpportunities = [...adzunaJobs, ...arbeitnowJobs, ...remoteokJobs, ...remotiveJobs];
  console.log(`Fetched ${allOpportunities.length} total opportunities`);

  // Upsert to database
  for (const opp of allOpportunities) {
    try {
      const { data, error } = await supabaseAdmin
        .from("opportunities")
        .upsert(
          {
            external_id: opp.id,
            source: opp.source,
            title: opp.title,
            company: opp.company,
            location: opp.location,
            description: opp.description,
            url: opp.url,
            salary_min: opp.salary_min,
            salary_max: opp.salary_max,
            posted_at: opp.posted_date,
            tags: opp.tags,
            opportunity_type: opp.opportunity_type,
            match_score: opp.match_score,
            category: opp.category,
          },
          {
            onConflict: "external_id",
          }
        )
        .select();

      if (error) {
        errors.push(`Failed to upsert ${opp.company} - ${opp.title}: ${error.message}`);
      } else if (data) {
        added++;
      }
    } catch (err) {
      errors.push(`Exception for ${opp.company}: ${err}`);
    }
  }

  console.log(`Sync complete: ${added} opportunities added/updated, ${errors.length} errors`);

  return { added, updated, errors };
}

export async function getOpportunitiesCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("opportunities")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error getting count:", error);
    return 0;
  }

  return count || 0;
}
