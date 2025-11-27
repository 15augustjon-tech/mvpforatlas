"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  FileText,
  Send,
} from "lucide-react";
import { Opportunity, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface InAppApplyModalProps {
  opportunity: Opportunity;
  profile: Profile | null;
  onClose: () => void;
  onApplied: () => void;
}

// Common application fields
const APPLICATION_FIELDS = [
  { id: "full_name", label: "Full Name", type: "text", profileKey: "full_name" },
  { id: "email", label: "Email", type: "email", profileKey: "email" },
  { id: "phone", label: "Phone Number", type: "tel", profileKey: "phone" },
  { id: "university", label: "University/School", type: "text", profileKey: "university" },
  { id: "major", label: "Major/Field of Study", type: "text", profileKey: "major" },
  { id: "graduation_year", label: "Graduation Year", type: "text", profileKey: "graduation_year" },
  { id: "linkedin_url", label: "LinkedIn URL", type: "url", profileKey: "linkedin_url" },
  { id: "portfolio_url", label: "Portfolio/Website", type: "url", profileKey: "portfolio_url" },
];

const APPLICATION_QUESTIONS = [
  { id: "why_company", label: "Why do you want to work at this company?", aiPrompt: "why_company" },
  { id: "why_role", label: "Why are you interested in this role?", aiPrompt: "why_role" },
  { id: "strengths", label: "What are your greatest strengths?", aiPrompt: "strengths" },
  { id: "experience", label: "Describe a relevant project or experience", aiPrompt: "experience" },
  { id: "availability", label: "When are you available to start?", aiPrompt: null },
  { id: "work_auth", label: "Are you authorized to work in the US?", aiPrompt: null, type: "select", options: ["Yes", "No", "Require Sponsorship"] },
];

export default function InAppApplyModal({
  opportunity,
  profile,
  onClose,
  onApplied,
}: InAppApplyModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Pre-fill from profile
    if (profile) {
      const initial: Record<string, string> = {};
      APPLICATION_FIELDS.forEach((field) => {
        const value = profile[field.profileKey as keyof Profile];
        if (value) initial[field.id] = String(value);
      });
      setFormData(initial);
    }
    loadSavedAnswers();
  }, [profile]);

  const loadSavedAnswers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("application_answers")
        .eq("id", user.id)
        .single();
      if (data?.application_answers) {
        setSavedAnswers(data.application_answers);
        // Pre-fill questions from saved answers
        setFormData(prev => ({
          ...prev,
          ...data.application_answers,
        }));
      }
    }
  };

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const generateAIAnswer = async (questionId: string, aiPrompt: string) => {
    if (!profile) return;
    setGeneratingAI(questionId);

    try {
      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: [{
            id: questionId,
            name: questionId,
            type: "textarea",
            label: aiPrompt
          }],
          jobDescription: `${opportunity.title} at ${opportunity.company}. ${opportunity.description || ""}`,
          userProfile: profile,
        }),
      });

      const data = await response.json();
      if (data.success && data.filledData) {
        const answer = data.filledData[questionId] || data.filledData[Object.keys(data.filledData)[0]];
        if (answer) {
          setFormData(prev => ({ ...prev, [questionId]: answer }));
        }
      }
    } catch (error) {
      console.error("AI generation error:", error);
    }

    setGeneratingAI(null);
  };

  const generateAllAIAnswers = async () => {
    if (!profile) return;
    setGeneratingAll(true);

    const questionsWithAI = APPLICATION_QUESTIONS.filter(q => q.aiPrompt);

    for (const question of questionsWithAI) {
      setGeneratingAI(question.id);
      try {
        const response = await fetch("/api/ai-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formFields: [{
              id: question.id,
              name: question.id,
              type: "textarea",
              label: question.aiPrompt
            }],
            jobDescription: `${opportunity.title} at ${opportunity.company}. ${opportunity.description || ""}`,
            userProfile: profile,
          }),
        });

        const data = await response.json();
        if (data.success && data.filledData) {
          const answer = data.filledData[question.id] || data.filledData[Object.keys(data.filledData)[0]];
          if (answer) {
            setFormData(prev => ({ ...prev, [question.id]: answer }));
          }
        }
      } catch (error) {
        console.error(`AI generation error for ${question.id}:`, error);
      }
    }

    setGeneratingAI(null);
    setGeneratingAll(false);
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to apply");
        return;
      }

      // Save application to database
      await supabase.from("applications").insert({
        user_id: user.id,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        company_name: opportunity.company,
        status: "applied",
        application_data: formData,
        job_url: opportunity.url,
      });

      // Update saved_opportunities if it was saved
      await supabase
        .from("saved_opportunities")
        .update({ applied: true, applied_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunity.id);

      setIsSubmitted(true);

      setTimeout(() => {
        onApplied();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-navy mb-2">Application Submitted!</h2>
          <p className="text-gray-text mb-4">
            Your application to {opportunity.company} has been recorded.
          </p>
          <p className="text-sm text-gray-text">
            Track your applications in the &quot;Applied&quot; tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal to-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-navy text-sm sm:text-base">{opportunity.company}</h2>
              <p className="text-xs sm:text-sm text-gray-text line-clamp-1">{opportunity.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4">
          {/* Job Info Card */}
          <div className="bg-gray-light rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="flex items-center gap-1 text-sm text-gray-text">
                <MapPin className="w-4 h-4" />
                {opportunity.location}
              </span>
              {opportunity.posted_date && (
                <span className="flex items-center gap-1 text-sm text-gray-text">
                  <Clock className="w-4 h-4" />
                  Posted {new Date(opportunity.posted_date).toLocaleDateString()}
                </span>
              )}
              {(opportunity.salary_min || opportunity.salary_max) && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <DollarSign className="w-4 h-4" />
                  {opportunity.salary_min && opportunity.salary_max
                    ? `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`
                    : opportunity.salary_min
                    ? `From $${opportunity.salary_min.toLocaleString()}`
                    : `Up to $${opportunity.salary_max?.toLocaleString()}`}
                </span>
              )}
            </div>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {opportunity.tags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="text-xs bg-white text-gray-text px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description toggle */}
            {opportunity.description && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center gap-1 text-sm text-teal font-medium"
              >
                <FileText className="w-4 h-4" />
                {showDescription ? "Hide" : "Show"} Job Description
                {showDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            {showDescription && opportunity.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-text whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-sm">1</span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {APPLICATION_FIELDS.map((field) => (
                  <div key={field.id} className="relative">
                    <label className="block text-xs font-medium text-gray-text mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 bg-gray-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                      {formData[field.id] && (
                        <button
                          onClick={() => copyToClipboard(formData[field.id], field.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedField === field.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-navy flex items-center gap-2">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Application Questions
                </h3>
                <button
                  onClick={generateAllAIAnswers}
                  disabled={generatingAll || !profile}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {generatingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Filling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Fill All with AI
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-4">
                {APPLICATION_QUESTIONS.map((question) => (
                  <div key={question.id} className="bg-gray-light rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <label className="text-sm font-medium text-navy flex-1 pr-2">
                        {question.label}
                      </label>
                      <div className="flex gap-1">
                        {formData[question.id] && (
                          <button
                            onClick={() => copyToClipboard(formData[question.id], question.id)}
                            className="p-1.5 hover:bg-gray-200 rounded-full"
                            title="Copy answer"
                          >
                            {copiedField === question.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                        {question.aiPrompt && (
                          <button
                            onClick={() => generateAIAnswer(question.id, question.aiPrompt!)}
                            disabled={generatingAI === question.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 disabled:opacity-50"
                            title="Generate with AI"
                          >
                            {generatingAI === question.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            AI
                          </button>
                        )}
                      </div>
                    </div>

                    {question.type === "select" ? (
                      <select
                        value={formData[question.id] || ""}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                      >
                        <option value="">Select...</option>
                        {question.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={formData[question.id] || ""}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                        placeholder={savedAnswers[question.id] ? "Using your saved answer..." : "Write your answer..."}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
                      />
                    )}

                    {savedAnswers[question.id] && !formData[question.id] && (
                      <button
                        onClick={() => handleChange(question.id, savedAnswers[question.id])}
                        className="mt-2 text-xs text-teal hover:underline"
                      >
                        Use saved answer from Application Prep
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-teal to-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Application
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-text mt-2">
            Your application will be tracked in your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
