"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check } from "lucide-react";
import { Experience, Project } from "@/types/database";

// Step definitions
const TOTAL_STEPS = 7;

// Options
const universities = [
  "UC Berkeley",
  "Stanford University",
  "UCLA",
  "USC",
  "UC San Diego",
  "UC Davis",
  "UC Irvine",
  "UC Santa Barbara",
  "Cal Poly SLO",
  "San Jose State University",
  "Santa Clara University",
  "San Francisco State University",
  "Other",
];

const degreeTypes = [
  "Bachelor of Science (B.S.)",
  "Bachelor of Arts (B.A.)",
  "Master of Science (M.S.)",
  "Master of Arts (M.A.)",
  "Ph.D.",
  "Other",
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const languageOptions = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "C#", "Go", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL", "HTML/CSS"
];

const frameworkOptions = [
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "Django", "Flask",
  "FastAPI", "Spring Boot", "Ruby on Rails", "TensorFlow", "PyTorch", "Pandas", "NumPy"
];

const toolOptions = [
  "Git", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MongoDB",
  "Redis", "Linux", "Figma", "Jira", "CI/CD", "Jenkins", "Terraform"
];

const workAuthOptions = [
  "US Citizen",
  "Permanent Resident (Green Card)",
  "F-1 Visa (OPT eligible)",
  "H-1B Visa",
  "Other work authorization",
  "Will require sponsorship"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    full_name: "",
    phone: "",
    city: "",
    state: "",

    // Step 2: Links
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",

    // Step 3: Education
    university: "",
    degree_type: "",
    major: "",
    minor: "",
    graduation_month: "",
    graduation_year: "",
    gpa: "",
    relevant_coursework: [] as string[],

    // Step 4: Experience
    experiences: [] as Experience[],

    // Step 5: Projects
    projects: [] as Project[],

    // Step 6: Skills
    languages: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],

    // Step 7: Additional
    work_authorization: "",
    willing_to_relocate: true,
    preferred_locations: [] as string[],
    interests: [] as string[],
  });

  // Temporary state for adding items
  const [newCoursework, setNewCoursework] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Toggle functions
  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const arr = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: arr.includes(item)
        ? arr.filter((i) => i !== item)
        : [...arr, item],
    });
  };

  // Add coursework
  const addCoursework = () => {
    if (!newCoursework.trim()) return;
    setFormData({
      ...formData,
      relevant_coursework: [...formData.relevant_coursework, newCoursework.trim()],
    });
    setNewCoursework("");
  };

  // Add preferred location
  const addLocation = () => {
    if (!newLocation.trim()) return;
    setFormData({
      ...formData,
      preferred_locations: [...formData.preferred_locations, newLocation.trim()],
    });
    setNewLocation("");
  };

  // Experience management
  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    setFormData({ ...formData, experiences: [...formData.experiences, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((exp) => exp.id !== id),
    });
  };

  const addBullet = (expId: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      ),
    });
  };

  const updateBullet = (expId: string, index: number, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.map((b, i) => (i === index ? value : b)) }
          : exp
      ),
    });
  };

  const removeBullet = (expId: string, index: number) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== index) }
          : exp
      ),
    });
  };

  // Project management
  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: "",
      technologies: [],
      date: "",
      bullets: [""],
      link: "",
    };
    setFormData({ ...formData, projects: [...formData.projects, newProj] });
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setFormData({
      ...formData,
      projects: formData.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((proj) => proj.id !== id),
    });
  };

  const addProjectBullet = (projId: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.map((proj) =>
        proj.id === projId ? { ...proj, bullets: [...proj.bullets, ""] } : proj
      ),
    });
  };

  const updateProjectBullet = (projId: string, index: number, value: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.map((proj) =>
        proj.id === projId
          ? { ...proj, bullets: proj.bullets.map((b, i) => (i === index ? value : b)) }
          : proj
      ),
    });
  };

  const removeProjectBullet = (projId: string, index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.map((proj) =>
        proj.id === projId
          ? { ...proj, bullets: proj.bullets.filter((_, i) => i !== index) }
          : proj
      ),
    });
  };

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Build location string
      const location = formData.city && formData.state
        ? `${formData.city}, ${formData.state}`
        : formData.state || formData.city || "California";

      // Combine all skills
      const allSkills = [...formData.languages, ...formData.frameworks, ...formData.tools];

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          location,
          linkedin_url: formData.linkedin_url || null,
          github_url: formData.github_url || null,
          portfolio_url: formData.portfolio_url || null,
          university: formData.university,
          degree_type: formData.degree_type,
          major: formData.major,
          minor: formData.minor || null,
          graduation_month: formData.graduation_month,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          relevant_coursework: formData.relevant_coursework,
          experiences: formData.experiences,
          projects: formData.projects,
          skills: allSkills,
          languages: formData.languages,
          frameworks: formData.frameworks,
          tools: formData.tools,
          work_authorization: formData.work_authorization,
          willing_to_relocate: formData.willing_to_relocate,
          preferred_locations: formData.preferred_locations,
          interests: formData.interests,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        alert("Error saving profile. Please try again.");
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
        return formData.full_name;
      case 2:
        return true; // Links optional
      case 3:
        return formData.university && formData.major;
      case 4:
        return true; // Experience optional
      case 5:
        return true; // Projects optional
      case 6:
        return formData.languages.length > 0 || formData.frameworks.length > 0 || formData.tools.length > 0;
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-text mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span className="text-teal font-medium">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Let&apos;s start with the basics</h2>
            <p className="text-gray-text mb-6">This info will appear at the top of your resume</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Alex Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Berkeley"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="CA"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Links */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Professional Links</h2>
            <p className="text-gray-text mb-6">Add links to showcase your work (all optional)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="linkedin.com/in/yourname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="github.com/yourname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="yourportfolio.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Education</h2>
            <p className="text-gray-text mb-6">Tell us about your academic background</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  University *
                </label>
                <select
                  value={universities.includes(formData.university) ? formData.university : (formData.university ? "Other" : "")}
                  onChange={(e) => {
                    if (e.target.value === "Other") {
                      setFormData({ ...formData, university: "" });
                    } else {
                      setFormData({ ...formData, university: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select university</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
                {(!universities.includes(formData.university) || formData.university === "") && (
                  <input
                    type="text"
                    value={universities.includes(formData.university) ? "" : formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Type your university name"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Degree Type
                </label>
                <select
                  value={degreeTypes.includes(formData.degree_type) ? formData.degree_type : (formData.degree_type ? "Other" : "")}
                  onChange={(e) => {
                    if (e.target.value === "Other") {
                      setFormData({ ...formData, degree_type: "" });
                    } else {
                      setFormData({ ...formData, degree_type: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select degree</option>
                  {degreeTypes.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
                {(!degreeTypes.includes(formData.degree_type) || formData.degree_type === "") && (
                  <input
                    type="text"
                    value={degreeTypes.includes(formData.degree_type) ? "" : formData.degree_type}
                    onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Type your degree type"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    Major *
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    Minor
                  </label>
                  <input
                    type="text"
                    value={formData.minor}
                    onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Business"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    Graduation Month
                  </label>
                  <select
                    value={formData.graduation_month}
                    onChange={(e) => setFormData({ ...formData, graduation_month: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="">Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-1">
                    Graduation Year
                  </label>
                  <select
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="">Year</option>
                    {[2024, 2025, 2026, 2027, 2028, 2029].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  GPA (out of 4.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="3.78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Relevant Coursework
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCoursework}
                    onChange={(e) => setNewCoursework(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCoursework())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="e.g. Data Structures"
                  />
                  <button
                    type="button"
                    onClick={addCoursework}
                    className="px-4 py-2 bg-teal text-white rounded-input"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.relevant_coursework.map((course, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-light text-gray-text rounded-full text-sm flex items-center gap-1">
                      {course}
                      <button onClick={() => setFormData({
                        ...formData,
                        relevant_coursework: formData.relevant_coursework.filter((_, idx) => idx !== i)
                      })}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Work Experience</h2>
            <p className="text-gray-text mb-6">Add internships, jobs, or research positions</p>

            {formData.experiences.map((exp, expIndex) => (
              <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-navy">Experience {expIndex + 1}</span>
                  <button onClick={() => removeExperience(exp.id)} className="text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Job Title (e.g. Software Engineering Intern)"
                  />

                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Company Name"
                  />

                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Location (e.g. San Francisco, CA)"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                      placeholder="Start (e.g. Jun 2024)"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      disabled={exp.current}
                      className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal disabled:bg-gray-100"
                      placeholder={exp.current ? "Present" : "End (e.g. Aug 2024)"}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-text">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                      className="rounded"
                    />
                    I currently work here
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Bullet Points (describe your accomplishments)
                    </label>
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2 mb-2">
                        <span className="text-gray-text mt-2">•</span>
                        <textarea
                          value={bullet}
                          onChange={(e) => updateBullet(exp.id, bulletIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal text-sm"
                          placeholder="Built payment dashboard using React, reducing review time by 40%"
                          rows={2}
                        />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => removeBullet(exp.id, bulletIndex)} className="text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBullet(exp.id)}
                      className="text-teal text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add bullet
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-text hover:border-teal hover:text-teal transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Experience
            </button>
          </div>
        )}

        {/* Step 5: Projects */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Projects</h2>
            <p className="text-gray-text mb-6">Showcase your personal or academic projects</p>

            {formData.projects.map((proj, projIndex) => (
              <div key={proj.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-navy">Project {projIndex + 1}</span>
                  <button onClick={() => removeProject(proj.id)} className="text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Project Name"
                  />

                  <input
                    type="text"
                    value={proj.technologies.join(", ")}
                    onChange={(e) => updateProject(proj.id, "technologies", e.target.value.split(", ").filter(Boolean))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Technologies (comma separated: React, Node.js, MongoDB)"
                  />

                  <input
                    type="text"
                    value={proj.date}
                    onChange={(e) => updateProject(proj.id, "date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Date (e.g. Nov 2024)"
                  />

                  <input
                    type="url"
                    value={proj.link || ""}
                    onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="Project URL (optional)"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Bullet Points
                    </label>
                    {proj.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2 mb-2">
                        <span className="text-gray-text mt-2">•</span>
                        <textarea
                          value={bullet}
                          onChange={(e) => updateProjectBullet(proj.id, bulletIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal text-sm"
                          placeholder="Built full-stack app with 500+ daily users"
                          rows={2}
                        />
                        {proj.bullets.length > 1 && (
                          <button onClick={() => removeProjectBullet(proj.id, bulletIndex)} className="text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addProjectBullet(proj.id)}
                      className="text-teal text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add bullet
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addProject}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-text hover:border-teal hover:text-teal transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Project
            </button>
          </div>
        )}

        {/* Step 6: Skills */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Technical Skills</h2>
            <p className="text-gray-text mb-6">Select your programming languages, frameworks, and tools</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy mb-3">
                  Programming Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem("languages", lang)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? "bg-teal text-white"
                          : "bg-gray-light text-gray-text hover:bg-gray-200"
                      }`}
                    >
                      {formData.languages.includes(lang) && <Check className="w-4 h-4 inline mr-1" />}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-3">
                  Frameworks & Libraries
                </label>
                <div className="flex flex-wrap gap-2">
                  {frameworkOptions.map((fw) => (
                    <button
                      key={fw}
                      type="button"
                      onClick={() => toggleArrayItem("frameworks", fw)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.frameworks.includes(fw)
                          ? "bg-teal text-white"
                          : "bg-gray-light text-gray-text hover:bg-gray-200"
                      }`}
                    >
                      {formData.frameworks.includes(fw) && <Check className="w-4 h-4 inline mr-1" />}
                      {fw}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-3">
                  Developer Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {toolOptions.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleArrayItem("tools", tool)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.tools.includes(tool)
                          ? "bg-teal text-white"
                          : "bg-gray-light text-gray-text hover:bg-gray-200"
                      }`}
                    >
                      {formData.tools.includes(tool) && <Check className="w-4 h-4 inline mr-1" />}
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Additional Info */}
        {step === 7 && (
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">Almost done!</h2>
            <p className="text-gray-text mb-6">A few more details to help match you with opportunities</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">
                  Work Authorization
                </label>
                <select
                  value={formData.work_authorization}
                  onChange={(e) => setFormData({ ...formData, work_authorization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Select status</option>
                  {workAuthOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.willing_to_relocate}
                    onChange={(e) => setFormData({ ...formData, willing_to_relocate: e.target.checked })}
                    className="w-5 h-5 rounded text-teal focus:ring-teal"
                  />
                  <span className="text-navy">I&apos;m willing to relocate for the right opportunity</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Preferred Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
                    placeholder="e.g. San Francisco, CA"
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 bg-teal text-white rounded-input"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_locations.map((loc, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-light text-gray-text rounded-full text-sm flex items-center gap-1">
                      {loc}
                      <button onClick={() => setFormData({
                        ...formData,
                        preferred_locations: formData.preferred_locations.filter((_, idx) => idx !== i)
                      })}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-200 text-gray-text rounded-input font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating your profile..." : "Complete Setup"}
            </button>
          )}
        </div>

        {/* Skip link */}
        {step > 1 && step < TOTAL_STEPS && (
          <button
            type="button"
            onClick={handleNext}
            className="w-full mt-3 text-gray-text text-sm hover:underline"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
