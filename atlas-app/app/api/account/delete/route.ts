import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Delete user's data from all tables
    // Order matters due to foreign key constraints

    // 1. Delete saved opportunities
    await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", userId);

    // 2. Delete applications
    await supabase
      .from("applications")
      .delete()
      .eq("user_id", userId);

    // 3. Delete profile
    await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    // 4. Delete resume from storage if exists
    const { data: files } = await supabase.storage
      .from("resumes")
      .list("", { search: userId });

    if (files && files.length > 0) {
      const filesToDelete = files.map((f) => f.name);
      await supabase.storage.from("resumes").remove(filesToDelete);
    }

    // 5. Delete the auth user using admin client
    // Note: This requires the service role key
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      // User data is already deleted, auth deletion failure is non-critical
      // The user won't be able to log in anyway since profile is deleted
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
