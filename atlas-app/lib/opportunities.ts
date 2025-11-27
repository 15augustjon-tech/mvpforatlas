import { supabase } from "./supabase";
import { Opportunity } from "@/types/database";

interface GetOpportunitiesOptions {
  search?: string;
  city?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export async function getOpportunities(options: GetOpportunitiesOptions = {}): Promise<{
  opportunities: Opportunity[];
  total: number;
}> {
  const { search, city, type, limit = 50, offset = 0 } = options;

  let query = supabase
    .from("opportunities")
    .select("*", { count: "exact" })
    .order("posted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply city filter
  if (city && city !== "all") {
    query = query.ilike("location", `%${city}%`);
  }

  // Apply type filter
  if (type && type !== "all") {
    query = query.eq("opportunity_type", type);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching opportunities:", error);
    return { opportunities: [], total: 0 };
  }

  return {
    opportunities: data || [],
    total: count || 0,
  };
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching opportunity:", error);
    return null;
  }

  return data;
}

export async function saveOpportunity(userId: string, opportunityId: string): Promise<boolean> {
  const { error } = await supabase
    .from("saved")
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      saved_at: new Date().toISOString(),
    });

  if (error && error.code !== "23505") { // Ignore duplicate
    console.error("Error saving opportunity:", error);
    return false;
  }

  return true;
}

export async function unsaveOpportunity(userId: string, opportunityId: string): Promise<boolean> {
  const { error } = await supabase
    .from("saved")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);

  if (error) {
    console.error("Error unsaving opportunity:", error);
    return false;
  }

  return true;
}

export async function getSavedOpportunities(userId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("saved")
    .select(`
      opportunity_id,
      opportunities (*)
    `)
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved opportunities:", error);
    return [];
  }

  // Extract the opportunities from the join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((item: any) => item.opportunities).filter(Boolean) || [];
}

export async function recordApplication(
  userId: string,
  opportunityId: string,
  opportunityTitle: string,
  companyName: string
): Promise<boolean> {
  const { error } = await supabase
    .from("applications")
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      opportunity_title: opportunityTitle,
      company_name: companyName,
      status: "applied",
      applied_at: new Date().toISOString(),
    });

  if (error && error.code !== "23505") {
    console.error("Error recording application:", error);
    return false;
  }

  return true;
}

export async function getApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return [];
  }

  return data || [];
}
