"use client";

import { X, ExternalLink } from "lucide-react";
import { Opportunity, Profile } from "@/types/database";

interface QuickApplyModalProps {
  opportunity: Opportunity;
  profile: Profile | null;
  onClose: () => void;
  onApply: () => void;
}

export default function QuickApplyModal({
  opportunity,
  profile,
  onClose,
  onApply,
}: QuickApplyModalProps) {
  const handleApply = () => {
    onApply();
    window.open(opportunity.url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up safe-area-bottom">
        {/* Drag Handle for mobile */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="font-bold text-navy text-sm sm:text-base truncate">{opportunity.company}</h2>
            <p className="text-xs sm:text-sm text-gray-text truncate">{opportunity.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 pb-6 sm:pb-4">
          <p className="text-center text-xs sm:text-sm text-gray-text mb-4 sm:mb-6">
            Apply in 30 seconds with your ATLAS profile
          </p>

          {/* Pre-filled fields */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-text mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.full_name || ""}
                readOnly
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-light rounded-lg sm:rounded-input text-navy text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-text mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-light rounded-lg sm:rounded-input text-navy text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-text mb-1">
                University
              </label>
              <input
                type="text"
                value={profile?.university || ""}
                readOnly
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-light rounded-lg sm:rounded-input text-navy text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-text mb-1">
                  Major
                </label>
                <input
                  type="text"
                  value={profile?.major || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-light rounded-lg sm:rounded-input text-navy text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-text mb-1">
                  Grad Year
                </label>
                <input
                  type="text"
                  value={profile?.graduation_year || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-light rounded-lg sm:rounded-input text-navy text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full py-3 sm:py-4 bg-teal text-white rounded-lg sm:rounded-input font-medium text-sm sm:text-base hover:bg-teal/90 transition-colors active:bg-teal/80 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            Open Application
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-text mt-2 sm:mt-3">
            You&apos;ll be redirected to complete the application
          </p>
        </div>
      </div>
    </div>
  );
}
