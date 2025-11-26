"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const universities = [
  "UC Berkeley",
  "Stanford University",
  "San Jose State University",
  "Santa Clara University",
  "San Francisco State University",
  "UC San Francisco",
  "Other",
];

const majors = [
  "Computer Science",
  "Data Science",
  "Business Administration",
  "Engineering (General)",
  "Economics",
  "Biology",
  "Communications",
  "Other",
];

const interestOptions = [
  "Internships",
  "Full-time Jobs",
  "Hackathons",
  "Scholarships",
  "Research Positions",
  "Fellowships",
];

const skillOptions = [
  "Python",
  "JavaScript",
  "React",
  "Java",
  "SQL",
  "Excel",
  "Data Analysis",
  "Machine Learning",
  "Product Management",
  "Marketing",
  "Design",
  "Writing",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    university: "",
    graduation_year: "",
    major: "",
    gpa: "",
    interests: [] as string[],
    skills: [] as string[],
  });
  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          university: formData.university,
          graduation_year: parseInt(formData.graduation_year),
          major: formData.major,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          interests: formData.interests,
          skills: formData.skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        router.push("/feed");
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name && formData.university && formData.graduation_year;
      case 2:
        return formData.major;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return formData.skills.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-text mb-2">
            <span>Step {step} of 4</span>
          </div>
          <div className="h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  University
                </label>
                <select
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select university</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Graduation Year
                </label>
                <select
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData({ ...formData, graduation_year: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select year</option>
                  {[2024, 2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6">Academic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Major
                </label>
                <select
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select major</option>
                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  GPA (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) =>
                    setFormData({ ...formData, gpa: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="3.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">
              What are you looking for?
            </h2>
            <p className="text-gray-text mb-6">Select at least one</p>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? "bg-teal text-white"
                      : "bg-gray-light text-gray-text hover:bg-gray-200"
                  }`}
                >
                  {formData.interests.includes(interest) && (
                    <Check className="w-4 h-4 inline mr-1" />
                  )}
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Skills */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Your Skills</h2>
            <p className="text-gray-text mb-6">Select your top skills</p>
            <div className="flex flex-wrap gap-3">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.skills.includes(skill)
                      ? "bg-teal text-white"
                      : "bg-gray-light text-gray-text hover:bg-gray-200"
                  }`}
                >
                  {formData.skills.includes(skill) && (
                    <Check className="w-4 h-4 inline mr-1" />
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-200 text-gray-text rounded-input font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
