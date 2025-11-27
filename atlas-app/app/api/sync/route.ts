import { NextRequest, NextResponse } from "next/server";
import { syncOpportunities, getOpportunitiesCount } from "@/lib/sync";

const CRON_SECRET = process.env.CRON_SECRET || "atlas-secret-123";

// GET: For testing in development
export async function GET() {
  try {
    const result = await syncOpportunities();
    const count = await getOpportunitiesCount();

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      added: result.added,
      updated: result.updated,
      totalOpportunities: count,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}

// POST: Protected endpoint for cron jobs
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const secret = authHeader?.replace("Bearer ", "");

    if (secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await syncOpportunities();
    const count = await getOpportunitiesCount();

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      added: result.added,
      updated: result.updated,
      totalOpportunities: count,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
