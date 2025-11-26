"use client";

import { Bookmark, CheckCircle, MapPin, Clock } from "lucide-react";
import { Opportunity } from "@/types/database";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSave: () => void;
  onApply: () => void;
  isSaved: boolean;
}

const categoryColors: Record<string, string> = {
  internship: "bg-teal text-white",
  job: "bg-blue-500 text-white",
  hackathon: "bg-purple-500 text-white",
  scholarship: "bg-green-500 text-white",
};

export default function OpportunityCard({
  opportunity,
  onSave,
  onApply,
  isSaved,
}: OpportunityCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-card p-4 mb-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            categoryColors[opportunity.opportunity_type] || "bg-gray-200"
          }`}
        >
          {opportunity.opportunity_type.charAt(0).toUpperCase() +
            opportunity.opportunity_type.slice(1)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-teal flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {opportunity.match_score}% match
          </span>
          <button
            onClick={onSave}
            className={`p-1.5 rounded-full transition-colors ${
              isSaved ? "text-teal bg-teal/10" : "text-gray-text hover:bg-gray-100"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Company & Title */}
      <h3 className="font-bold text-navy text-lg">{opportunity.company}</h3>
      <p className="text-gray-text mb-2">{opportunity.title}</p>

      {/* Location */}
      <div className="flex items-center gap-1 text-sm text-gray-text mb-3">
        <MapPin className="w-4 h-4" />
        <span>{opportunity.location}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {opportunity.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-gray-light text-gray-text px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
        {opportunity.posted_date && (
          <span className="text-xs bg-gray-light text-gray-text px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(opportunity.posted_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Salary if available */}
      {(opportunity.salary_min || opportunity.salary_max) && (
        <p className="text-sm text-gray-text mb-3">
          {opportunity.salary_min && opportunity.salary_max
            ? `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`
            : opportunity.salary_min
            ? `From $${opportunity.salary_min.toLocaleString()}`
            : `Up to $${opportunity.salary_max?.toLocaleString()}`}
        </p>
      )}

      {/* Quick Apply Button */}
      <button
        onClick={onApply}
        className="w-full py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors"
      >
        Quick Apply
      </button>
    </div>
  );
}
