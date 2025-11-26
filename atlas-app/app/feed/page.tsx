"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import OpportunityCard from "@/components/OpportunityCard";
import FilterChip from "@/components/FilterChip";
import QuickApplyModal from "@/components/QuickApplyModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { Opportunity, Profile } from "@/types/database";

const filters = [
  { id: "all", label: "All" },
  { id: "internship", label: "Internships" },
  { id: "job", label: "Jobs" },
  { id: "hackathon", label: "Hackathons" },
  { id: "scholarship", label: "Scholarships" },
];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    loadSavedOpportunities();
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [activeFilter, profile]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    }
  };

  const loadSavedOpportunities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("saved_opportunities")
        .select("opportunity_id")
        .eq("user_id", user.id);
      if (data) {
        setSavedIds(new Set(data.map((s) => s.opportunity_id)));
      }
    }
  };

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const skills = profile?.skills?.join(",") || "";
      const response = await fetch(
        `/api/opportunities?category=${activeFilter}&skills=${encodeURIComponent(skills)}`
      );
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error("Error loading opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (opportunity: Opportunity) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isSaved = savedIds.has(opportunity.id);

    if (isSaved) {
      // Unsave
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunity.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunity.id);
        return next;
      });
    } else {
      // Save
      await supabase.from("saved_opportunities").insert({
        user_id: user.id,
        opportunity_id: opportunity.id,
        opportunity_type: opportunity.opportunity_type,
        opportunity_data: opportunity,
      });
      setSavedIds((prev) => new Set(prev).add(opportunity.id));
    }
  };

  const handleApply = async (opportunity: Opportunity) => {
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

    // Mark as applied in saved if it was saved
    if (savedIds.has(selectedOpportunity.id)) {
      await supabase
        .from("saved_opportunities")
        .update({ applied: true, applied_at: new Date().toISOString() })
        .eq("opportunity_id", selectedOpportunity.id);
    }

    setSelectedOpportunity(null);
  };

  const filteredOpportunities =
    activeFilter === "all"
      ? opportunities
      : opportunities.filter((o) => o.opportunity_type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-light pb-20">
      <Header />

      {/* Filter Bar */}
      <div className="sticky top-[57px] z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-text mb-1">
          <MapPin className="w-4 h-4" />
          <span>California</span>
        </div>
        <p className="text-navy font-medium">
          {filteredOpportunities.length} opportunities matched
        </p>
      </div>

      {/* Feed */}
      <div className="px-4">
        {loading ? (
          <LoadingSpinner />
        ) : filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onSave={() => handleSave(opportunity)}
              onApply={() => handleApply(opportunity)}
              isSaved={savedIds.has(opportunity.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-text">No opportunities found</p>
          </div>
        )}
      </div>

      {/* Quick Apply Modal */}
      {selectedOpportunity && (
        <QuickApplyModal
          opportunity={selectedOpportunity}
          profile={profile}
          onClose={() => setSelectedOpportunity(null)}
          onApply={handleConfirmApply}
        />
      )}

      <BottomNav />
    </div>
  );
}
