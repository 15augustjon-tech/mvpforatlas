"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    loadSavedOpportunities();
  }, []);

  // Debounce search - waits 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadOpportunities();
  }, [activeFilter, profile, debouncedSearch]);

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
        `/api/opportunities?category=${activeFilter}&skills=${encodeURIComponent(skills)}&search=${encodeURIComponent(debouncedSearch)}`
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

      {/* Search Bar */}
      <div className="sticky top-[57px] z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-light rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[114px] z-40 bg-white border-b border-gray-100 px-4 py-3">
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
