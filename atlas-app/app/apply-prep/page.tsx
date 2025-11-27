"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Sparkles, Save, Check, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

// Common application questions
const COMMON_QUESTIONS = [
  {
    id: "why_company",
    label: "Why do you want to work at [Company]?",
    placeholder: "I'm excited about [Company] because...",
    type: "textarea",
    aiPrompt: "why_company",
  },
  {
    id: "why_role",
    label: "Why are you interested in this role?",
    placeholder: "This role aligns with my career goals because...",
    type: "textarea",
    aiPrompt: "why_role",
  },
  {
    id: "strengths",
    label: "What are your greatest strengths?",
    placeholder: "My key strengths include...",
    type: "textarea",
    aiPrompt: "strengths",
  },
  {
    id: "experience",
    label: "Describe a relevant project or experience",
    placeholder: "In my previous project, I...",
    type: "textarea",
    aiPrompt: "experience",
  },
  {
    id: "challenge",
    label: "Describe a challenge you overcame",
    placeholder: "One challenge I faced was...",
    type: "textarea",
    aiPrompt: "challenge",
  },
  {
    id: "availability",
    label: "When are you available to start?",
    placeholder: "I am available to start...",
    type: "text",
    aiPrompt: null,
  },
  {
    id: "work_auth",
    label: "Are you authorized to work in the US?",
    placeholder: "",
    type: "select",
    options: ["Yes", "No", "Require Sponsorship"],
    aiPrompt: null,
  },
  {
    id: "salary_expectation",
    label: "What are your salary expectations?",
    placeholder: "My expected salary range is...",
    type: "text",
    aiPrompt: null,
  },
];

export default function ApplyPrepPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    loadSavedAnswers();
  }, []);

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
    setLoading(false);
  };

  const loadSavedAnswers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("application_answers")
        .eq("id", user.id)
        .single();
      if (data?.application_answers) {
        setAnswers(data.application_answers);
      }
    }
  };

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ application_answers: answers })
        .eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generateAIAnswer = async (questionId: string, aiPrompt: string) => {
    if (!profile) return;
    setGeneratingAI(questionId);

    try {
      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: [{ id: questionId, name: questionId, type: "textarea", label: aiPrompt }],
          jobDescription: "General internship application",
          userProfile: profile,
        }),
      });

      const data = await response.json();
      if (data.success && data.filledData) {
        const answer = data.filledData[questionId] || data.filledData[Object.keys(data.filledData)[0]];
        if (answer) {
          setAnswers(prev => ({ ...prev, [questionId]: answer }));
          setSaved(false);
        }
      }
    } catch (error) {
      console.error("AI generation error:", error);
    }

    setGeneratingAI(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <Header />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-navy">Application Prep</h1>
            <p className="text-sm text-gray-text">Answer common questions ahead of time</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-teal to-blue-500 rounded-card p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI-Powered Answers</span>
          </div>
          <p className="text-sm opacity-90">
            Click the AI button to generate personalized answers based on your profile.
            Edit and save them for quick use on applications!
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="px-4 space-y-4 pb-4">
        {COMMON_QUESTIONS.map((question) => (
          <div key={question.id} className="bg-white rounded-card p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <label className="text-sm font-medium text-navy flex-1">
                {question.label}
              </label>
              {question.aiPrompt && (
                <button
                  onClick={() => generateAIAnswer(question.id, question.aiPrompt!)}
                  disabled={generatingAI === question.id}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 disabled:opacity-50"
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

            {question.type === "textarea" ? (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full px-3 py-2 bg-gray-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
              />
            ) : question.type === "select" ? (
              <select
                value={answers[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="w-full px-3 py-2 bg-gray-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="">Select...</option>
                {question.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className="w-full px-3 py-2 bg-gray-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-teal to-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Answers
            </>
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
