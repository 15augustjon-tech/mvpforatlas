"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import OpportunityCard from "@/components/OpportunityCard";
import InAppApplyModal from "@/components/InAppApplyModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { Opportunity, Profile, SavedOpportunity } from "@/types/database";

export default function SavedPage() {
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) setProfile(profileData);

    // Load saved opportunities
    const { data: savedData } = await supabase
      .from("saved_opportunities")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    if (savedData) setSavedOpportunities(savedData);
    setLoading(false);
  };

  const handleUnsave = async (opportunityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId);

    setSavedOpportunities((prev) =>
      prev.filter((s) => s.opportunity_id !== opportunityId)
    );
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleConfirmApply = async () => {
    if (!selectedOpportunity) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Log application
    await supabase.from("applications").insert({
      user_id: user.id,
      opportunity_id: selectedOpportunity.id,
      opportunity_title: selectedOpportunity.title,
      company_name: selectedOpportunity.company,
      status: "applied",
    });

    // Mark as applied
    await supabase
      .from("saved_opportunities")
      .update({ applied: true, applied_at: new Date().toISOString() })
      .eq("opportunity_id", selectedOpportunity.id);

    // Update local state
    setSavedOpportunities((prev) =>
      prev.map((s) =>
        s.opportunity_id === selectedOpportunity.id
          ? { ...s, applied: true, applied_at: new Date().toISOString() }
          : s
      )
    );

    setSelectedOpportunity(null);
  };

  return (
    <div className="min-h-screen bg-gray-light pb-20">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-bold text-navy">Saved</h1>
        <p className="text-sm text-gray-text">
          {savedOpportunities.length} opportunities saved
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner />
        ) : savedOpportunities.length > 0 ? (
          savedOpportunities.map((saved) => (
            <div key={saved.id} className="relative">
              {saved.applied && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Applied
                </div>
              )}
              <OpportunityCard
                opportunity={saved.opportunity_data}
                onSave={() => handleUnsave(saved.opportunity_id)}
                onApply={() => handleApply(saved.opportunity_data)}
                isSaved={true}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-gray-text" />
            </div>
            <h2 className="text-lg font-semibold text-navy mb-2">
              No saved opportunities yet
            </h2>
            <p className="text-gray-text mb-6">
              Tap the bookmark icon on any opportunity to save it
            </p>
            <Link
              href="/feed"
              className="inline-block px-6 py-3 bg-teal text-white rounded-input font-medium"
            >
              Browse Feed
            </Link>
          </div>
        )}
      </div>

      {/* In-App Apply Modal */}
      {selectedOpportunity && (
        <InAppApplyModal
          opportunity={selectedOpportunity}
          profile={profile}
          onClose={() => setSelectedOpportunity(null)}
          onApplied={handleConfirmApply}
        />
      )}

      <BottomNav />
    </div>
  );
}
