"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, X, TrendingUp, SlidersHorizontal, ChevronDown } from "lucide-react";
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
  const [weeklyStats, setWeeklyStats] = useState({ applied: 0, saved: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [salaryFilter, setSalaryFilter] = useState("any"); // any, has-salary
  const [dateFilter, setDateFilter] = useState("any"); // any, today, week, month
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    loadSavedOpportunities();
    loadWeeklyStats();
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

  const loadWeeklyStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get date 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // Count applications this week
    const { count: appliedCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("applied_at", weekAgoISO);

    // Count saved this week
    const { count: savedCount } = await supabase
      .from("saved_opportunities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("saved_at", weekAgoISO);

    setWeeklyStats({
      applied: appliedCount || 0,
      saved: savedCount || 0,
    });
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

  const filteredOpportunities = opportunities.filter((o) => {
    // Category filter
    if (activeFilter !== "all" && o.opportunity_type !== activeFilter) {
      return false;
    }
    // Salary filter
    if (salaryFilter === "has-salary" && !o.salary_min && !o.salary_max) {
      return false;
    }
    // Date filter
    if (dateFilter !== "any" && o.posted_date) {
      const posted = new Date(o.posted_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
      if (dateFilter === "today" && diffDays > 1) return false;
      if (dateFilter === "week" && diffDays > 7) return false;
      if (dateFilter === "month" && diffDays > 30) return false;
    }
    return true;
  });

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
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              showFilters || salaryFilter !== "any" || dateFilter !== "any"
                ? "bg-teal text-white"
                : "bg-gray-light text-gray-text"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(salaryFilter !== "any" || dateFilter !== "any") && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-text mb-1 block">Salary</label>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="any">Any</option>
                <option value="has-salary">Shows Salary</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-text mb-1 block">Posted</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="any">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Stats Card */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-[#0ea5e9] to-blue-500 rounded-card p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Your Week</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyStats.applied}</p>
              <p className="text-xs opacity-80">Applied</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyStats.saved}</p>
              <p className="text-xs opacity-80">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
              <p className="text-xs opacity-80">Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Stats */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-text">
          <MapPin className="w-4 h-4" />
          <span>California</span>
          <span className="text-navy font-medium ml-auto">
            {filteredOpportunities.length} opportunities
          </span>
        </div>
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
