import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { jobUrl, jobTitle, company } = await request.json();

    if (!jobUrl) {
      return NextResponse.json({ error: "Job URL is required" }, { status: 400 });
    }

    // Log the application attempt
    await supabase.from("applications").insert({
      user_id: user.id,
      job_url: jobUrl,
      job_title: jobTitle || "Unknown",
      company: company || "Unknown",
      status: "pending",
      applied_at: new Date().toISOString(),
      notes: "Opening application page",
    });

    // Return success - the Chrome extension handles the actual form filling
    // Server-side browser automation (Playwright) is not available on Vercel serverless
    return NextResponse.json({
      success: true,
      message: "Application logged! Opening the job page - use the ATLAS Chrome extension to auto-fill with AI.",
      useExtension: true,
      jobUrl: jobUrl,
    });
  } catch (error) {
    console.error("Auto-apply error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process application" },
      { status: 500 }
    );
  }
}
