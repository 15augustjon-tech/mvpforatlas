"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  Sparkles,
  Building2,
  Send,
  CheckCircle,
} from "lucide-react";
import { Opportunity, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface BatchApplyModalProps {
  opportunities: Opportunity[];
  profile: Profile | null;
  onClose: () => void;
  onComplete: () => void;
}

export default function BatchApplyModal({
  opportunities,
  profile,
  onClose,
  onComplete,
}: BatchApplyModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const supabase = createClient();

  const currentJob = opportunities[currentIndex];
  const allDone = completed.size === opportunities.length;

  useEffect(() => {
    if (currentJob && !answers[currentJob.id]) {
      generateAnswersForJob(currentJob);
    }
  }, [currentIndex]);

  const generateAnswersForJob = async (job: Opportunity) => {
    if (!profile) return;
    setIsGenerating(true);

    const questions = ["why_company", "why_role", "strengths", "experience"];
    const jobAnswers: Record<string, string> = {
      availability: "Immediately",
      work_auth: "Yes",
    };

    try {
      // Send ALL questions in ONE API call to minimize rate limiting
      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: questions.map(q => ({ id: q, name: q, type: "textarea", label: q })),
          jobDescription: `${job.title} at ${job.company}. ${job.description || ""}`,
          userProfile: profile,
        }),
      });
      const data = await response.json();
      if (data.success && data.filledData) {
        Object.assign(jobAnswers, data.filledData);
      }
    } catch (error) {
      console.error("Error generating answers:", error);
    }

    setAnswers(prev => ({ ...prev, [job.id]: jobAnswers }));
    setIsGenerating(false);
  };

  const submitApplication = async () => {
    if (!currentJob || !profile) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("applications").insert({
        user_id: user.id,
        opportunity_id: currentJob.id,
        opportunity_title: currentJob.title,
        company_name: currentJob.company,
        status: "applied",
        application_data: answers[currentJob.id] || {},
        job_url: currentJob.url,
      });

      setCompleted(prev => new Set(prev).add(currentIndex));

      // Move to next or finish
      if (currentIndex < opportunities.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }

    setIsSubmitting(false);
  };

  const submitAll = async () => {
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    // Generate missing answers sequentially to avoid rate limits
    const jobsNeedingAnswers = opportunities.filter((job, i) => !completed.has(i) && !answers[job.id]);
    for (const job of jobsNeedingAnswers) {
      await generateAnswersForJob(job);
    }

    // Submit all applications (DB calls don't have rate limits)
    for (let i = 0; i < opportunities.length; i++) {
      const job = opportunities[i];
      if (completed.has(i)) continue;

      try {
        await supabase.from("applications").insert({
          user_id: user.id,
          opportunity_id: job.id,
          opportunity_title: job.title,
          company_name: job.company,
          status: "applied",
          application_data: answers[job.id] || {},
          job_url: job.url,
        });
        setCompleted(prev => new Set(prev).add(i));
      } catch (error) {
        console.error(`Error applying to ${job.company}:`, error);
      }
    }

    setIsSubmitting(false);
  };

  if (allDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">All Done!</h2>
          <p className="text-gray-text mb-6">
            Successfully applied to {opportunities.length} jobs
          </p>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-teal text-white rounded-xl font-medium"
          >
            View Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-navy">Batch Apply</h2>
            <p className="text-xs text-gray-text">
              {completed.size} of {opportunities.length} completed
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 bg-gray-light">
          <div className="flex gap-1">
            {opportunities.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  completed.has(i)
                    ? "bg-green-500"
                    : i === currentIndex
                    ? "bg-teal"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Job */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal to-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy">{currentJob?.company}</h3>
              <p className="text-sm text-gray-text">{currentJob?.title}</p>
            </div>
            {completed.has(currentIndex) && (
              <Check className="w-6 h-6 text-green-500" />
            )}
          </div>

          {/* AI Generated Answers Preview */}
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="ml-3 text-gray-text">Generating answers with AI...</span>
            </div>
          ) : answers[currentJob?.id] ? (
            <div className="space-y-3">
              {Object.entries(answers[currentJob.id]).slice(0, 4).map(([key, value]) => (
                <div key={key} className="bg-gray-light rounded-lg p-3">
                  <p className="text-xs text-gray-text mb-1 capitalize">{key.replace("_", " ")}</p>
                  <p className="text-sm text-navy line-clamp-2">{value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Job List */}
        <div className="px-4 py-2 border-t border-gray-100 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-text mb-2">All jobs in queue:</p>
          <div className="flex flex-wrap gap-2">
            {opportunities.map((job, i) => (
              <button
                key={job.id}
                onClick={() => setCurrentIndex(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  completed.has(i)
                    ? "bg-green-100 text-green-700"
                    : i === currentIndex
                    ? "bg-teal text-white"
                    : "bg-gray-light text-gray-text"
                }`}
              >
                {completed.has(i) && <Check className="w-3 h-3 inline mr-1" />}
                {job.company}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
          <div className="flex gap-3">
            <button
              onClick={submitApplication}
              disabled={isSubmitting || isGenerating || completed.has(currentIndex)}
              className="flex-1 py-3 bg-teal text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : completed.has(currentIndex) ? (
                <>
                  <Check className="w-5 h-5" />
                  Applied
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Apply
                </>
              )}
            </button>
            <button
              onClick={submitAll}
              disabled={isSubmitting || isGenerating}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Apply to All
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
