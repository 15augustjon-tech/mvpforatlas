import { NextRequest, NextResponse } from "next/server";
import { getOpportunities } from "@/lib/opportunities";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      type: searchParams.get("type") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const { opportunities, total } = await getOpportunities(options);

    return NextResponse.json({
      success: true,
      opportunities,
      total,
      page: Math.floor(options.offset / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit),
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
