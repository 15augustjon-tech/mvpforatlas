"use client";

import { useState } from "react";
import { X, ExternalLink, Loader2, Sparkles } from "lucide-react";
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
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyStatus, setAutoApplyStatus] = useState<string | null>(null);

  const handleAutoApply = async () => {
    setIsAutoApplying(true);
    setAutoApplyStatus("AI is analyzing the application...");

    try {
      const response = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobUrl: opportunity.url,
          jobTitle: opportunity.title,
          company: opportunity.company,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAutoApplyStatus(`Filled ${result.fieldsFilledCount || 0} fields with AI! ${result.requiresResumeUpload ? "Resume upload needed." : ""}`);
        setTimeout(() => {
          window.open(opportunity.url, "_blank");
          onApply();
          onClose();
        }, 2000);
      } else {
        setAutoApplyStatus(result.message || "Could not auto-fill. Opening manually...");
        setTimeout(() => {
          window.open(opportunity.url, "_blank");
          onApply();
        }, 1500);
      }
    } catch (error) {
      console.error("Auto-apply error:", error);
      setAutoApplyStatus("Error. Opening application manually...");
      setTimeout(() => {
        window.open(opportunity.url, "_blank");
        onApply();
      }, 1500);
    } finally {
      setIsAutoApplying(false);
    }
  };

  const handleManualApply = () => {
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

          {/* Status Message */}
          {autoApplyStatus && (
            <div className="mb-4 p-3 bg-teal/10 rounded-lg text-center">
              <p className="text-sm text-teal font-medium">{autoApplyStatus}</p>
            </div>
          )}

          {/* Auto-Apply Button */}
          <button
            onClick={handleAutoApply}
            disabled={isAutoApplying}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-teal to-blue-500 text-white rounded-lg sm:rounded-input font-medium text-sm sm:text-base hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAutoApplying ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Auto-filling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Auto-Fill & Apply
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-text mt-2">
            ATLAS AI will pre-fill the application form for you
          </p>

          {/* Manual Apply Button */}
          <button
            onClick={handleManualApply}
            className="w-full mt-3 py-2.5 sm:py-3 border border-gray-200 text-gray-text rounded-lg sm:rounded-input font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Manually
          </button>
        </div>
      </div>
    </div>
  );
}
