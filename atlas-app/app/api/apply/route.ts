import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoApply } from "@/lib/autoapply";

export async function POST(request: NextRequest) {
  try {
    const { jobUrl, opportunityId, opportunityTitle, companyName } = await request.json();

    if (!jobUrl) {
      return NextResponse.json(
        { success: false, error: "Job URL is required" },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found. Please complete your profile first." },
        { status: 400 }
      );
    }

    // Prepare profile data for auto-apply
    const profileData = {
      firstName: profile.full_name?.split(" ")[0] || "",
      lastName: profile.full_name?.split(" ").slice(1).join(" ") || "",
      email: profile.email,
      phone: profile.phone || undefined,
      linkedin: profile.linkedin_url || undefined,
      university: profile.university || undefined,
      major: profile.major || undefined,
      graduationYear: profile.graduation_year?.toString() || undefined,
      resumeUrl: profile.resume_url || undefined,
    };

    // Try auto-apply
    const result = await autoApply(jobUrl, profileData);

    // Record application if we have opportunity details
    if (opportunityId && opportunityTitle && companyName) {
      await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          opportunity_title: opportunityTitle,
          company_name: companyName,
          status: "applied",
          applied_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sessionId: result.sessionId,
    });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { success: false, error: "Application failed" },
      { status: 500 }
    );
  }
}
