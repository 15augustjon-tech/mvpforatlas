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
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-navy">{opportunity.company}</h2>
            <p className="text-sm text-gray-text">{opportunity.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-center text-gray-text mb-6">
            Apply in 30 seconds with your ATLAS profile
          </p>

          {/* Pre-filled fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-text mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.full_name || ""}
                readOnly
                className="w-full px-4 py-3 bg-gray-light rounded-input text-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-text mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="w-full px-4 py-3 bg-gray-light rounded-input text-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-text mb-1">
                University
              </label>
              <input
                type="text"
                value={profile?.university || ""}
                readOnly
                className="w-full px-4 py-3 bg-gray-light rounded-input text-navy"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Major
                </label>
                <input
                  type="text"
                  value={profile?.major || ""}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-light rounded-input text-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Grad Year
                </label>
                <input
                  type="text"
                  value={profile?.graduation_year || ""}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-light rounded-input text-navy"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full py-4 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open Application
          </button>

          <p className="text-center text-sm text-gray-text mt-3">
            You&apos;ll be redirected to complete the application
          </p>
        </div>
      </div>
    </div>
  );
}
