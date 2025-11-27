"use client";

import { Bookmark, CheckCircle, MapPin, Clock, Globe } from "lucide-react";
import { Opportunity } from "@/types/database";

// Map source IDs to display names
const sourceNames: Record<string, string> = {
  adzuna: "Adzuna",
  arbeitnow: "Arbeitnow",
  remoteok: "RemoteOK",
  remotive: "Remotive",
};

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
    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-card p-3 sm:p-4 mb-3 hover:shadow-md transition-shadow active:scale-[0.99]">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span
          className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-full ${
            categoryColors[opportunity.opportunity_type] || "bg-gray-200"
          }`}
        >
          {opportunity.opportunity_type.charAt(0).toUpperCase() +
            opportunity.opportunity_type.slice(1)}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-teal flex items-center gap-0.5 sm:gap-1">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {opportunity.match_score}%
          </span>
          <button
            onClick={onSave}
            className={`p-1 sm:p-1.5 rounded-full transition-colors ${
              isSaved ? "text-teal bg-teal/10" : "text-gray-text hover:bg-gray-100"
            }`}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Company & Title */}
      <h3 className="font-bold text-navy text-base sm:text-lg leading-tight">{opportunity.company}</h3>
      <p className="text-sm sm:text-base text-gray-text mb-1.5 sm:mb-2 line-clamp-2">{opportunity.title}</p>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-text mb-2 sm:mb-3">
        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="truncate">{opportunity.location}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {opportunity.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-[10px] sm:text-xs bg-gray-light text-gray-text px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
        {opportunity.posted_date && (
          <span className="text-[10px] sm:text-xs bg-gray-light text-gray-text px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {new Date(opportunity.posted_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Salary if available */}
      {(opportunity.salary_min || opportunity.salary_max) && (
        <p className="text-xs sm:text-sm text-green-600 font-medium mb-2 sm:mb-3">
          {opportunity.salary_min && opportunity.salary_max
            ? `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`
            : opportunity.salary_min
            ? `From $${opportunity.salary_min.toLocaleString()}`
            : `Up to $${opportunity.salary_max?.toLocaleString()}`}
        </p>
      )}

      {/* Source */}
      {opportunity.source && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-text mb-2.5 sm:mb-3">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>via {sourceNames[opportunity.source] || opportunity.source}</span>
        </div>
      )}

      {/* Quick Apply Button */}
      <button
        onClick={onApply}
        className="w-full py-2.5 sm:py-3 bg-teal text-white rounded-lg sm:rounded-input font-medium text-sm sm:text-base hover:bg-teal/90 transition-colors active:bg-teal/80"
      >
        Quick Apply
      </button>
    </div>
  );
}
