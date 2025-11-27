"use client";

import { useState, useEffect } from "react";
import { Send, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { Application } from "@/types/database";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  applied: "bg-gray-200 text-gray-700",
  interviewing: "bg-blue-100 text-blue-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("applied_at", { ascending: false });

    if (data) setApplications(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: status as Application["status"] } : app))
    );
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  const stats = {
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offer: applications.filter((a) => a.status === "offer").length,
  };

  return (
    <div className="min-h-screen bg-gray-light pb-20">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-bold text-navy">Applications</h1>
        <p className="text-sm text-gray-text">
          {stats.applied} Applied • {stats.interviewing} Interviewing • {stats.offer} Offers
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
        {["all", "applied", "interviewing", "offer", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-teal text-white"
                : "bg-gray-light text-gray-text"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner />
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-light rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-text" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">
                        {app.company_name}
                      </h3>
                      <p className="text-sm text-gray-text">
                        {app.opportunity_title}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      statusColors[app.status]
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-text mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {format(new Date(app.applied_at), "MMM d, yyyy")}</span>
                </div>

                {/* Status Update */}
                <div className="flex gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-text" />
            </div>
            <h2 className="text-lg font-semibold text-navy mb-2">
              No applications yet
            </h2>
            <p className="text-gray-text mb-6">
              When you apply through ATLAS, we&apos;ll track it here
            </p>
            <Link
              href="/feed"
              className="inline-block px-6 py-3 bg-teal text-white rounded-input font-medium"
            >
              Find Opportunities
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
