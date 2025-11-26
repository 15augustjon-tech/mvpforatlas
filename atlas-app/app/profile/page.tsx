"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, GraduationCap, Briefcase, X, Plus, FileText, Upload } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditedProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    await supabase
      .from("profiles")
      .update({
        full_name: editedProfile.full_name,
        university: editedProfile.university,
        major: editedProfile.major,
        graduation_year: editedProfile.graduation_year,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setProfile({ ...profile, ...editedProfile });
    setEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !profile) return;
    const updatedSkills = [...(profile.skills || []), newSkill.trim()];
    await supabase
      .from("profiles")
      .update({ skills: updatedSkills })
      .eq("id", profile.id);
    setProfile({ ...profile, skills: updatedSkills });
    setNewSkill("");
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!profile) return;
    const updatedSkills = (profile.skills || []).filter(s => s !== skillToRemove);
    await supabase
      .from("profiles")
      .update({ skills: updatedSkills })
      .eq("id", profile.id);
    setProfile({ ...profile, skills: updatedSkills });
  };

  const addInterest = async () => {
    if (!newInterest.trim() || !profile) return;
    const updatedInterests = [...(profile.interests || []), newInterest.trim()];
    await supabase
      .from("profiles")
      .update({ interests: updatedInterests })
      .eq("id", profile.id);
    setProfile({ ...profile, interests: updatedInterests });
    setNewInterest("");
  };

  const removeInterest = async (interestToRemove: string) => {
    if (!profile) return;
    const updatedInterests = (profile.interests || []).filter(i => i !== interestToRemove);
    await supabase
      .from("profiles")
      .update({ interests: updatedInterests })
      .eq("id", profile.id);
    setProfile({ ...profile, interests: updatedInterests });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setResumeUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}-resume.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      await supabase
        .from("profiles")
        .update({ resume_url: urlData.publicUrl })
        .eq("id", profile.id);

      setProfile({ ...profile, resume_url: urlData.publicUrl });
    }
    setResumeUploading(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light pb-20">
      <Header />

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-navy">Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-teal font-medium"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setEditedProfile(profile || {});
                }}
                className="text-gray-text font-medium"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="text-teal font-medium">
                Save
              </button>
            </div>
          )}
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center text-white text-xl font-bold">
            {getInitials(profile?.full_name ?? null)}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={editedProfile.full_name || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, full_name: e.target.value })
                }
                className="text-xl font-bold text-navy w-full border-b border-gray-200 focus:outline-none focus:border-teal pb-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-navy">
                {profile?.full_name || "Add your name"}
              </h2>
            )}
            <p className="text-gray-text">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        {/* University */}
        <div className="bg-white rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-5 h-5 text-teal" />
            <span className="font-medium text-navy">Education</span>
          </div>
          {editing ? (
            <div className="space-y-2 ml-8">
              <input
                type="text"
                value={editedProfile.university || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, university: e.target.value })
                }
                placeholder="University"
                className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                type="text"
                value={editedProfile.major || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, major: e.target.value })
                }
                placeholder="Major"
                className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                type="number"
                value={editedProfile.graduation_year || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    graduation_year: parseInt(e.target.value),
                  })
                }
                placeholder="Graduation Year"
                className="w-full px-3 py-2 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          ) : (
            <div className="ml-8 text-gray-text">
              <p>{profile?.university || "Not set"}</p>
              <p>
                {profile?.major} {profile?.graduation_year && `• Class of ${profile.graduation_year}`}
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-card p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-teal" />
            <span className="font-medium text-navy">Location</span>
          </div>
          <p className="ml-8 text-gray-text">{profile?.location || "California"}</p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-teal" />
              <span className="font-medium text-navy">Skills</span>
            </div>
            <button
              onClick={() => setEditingSkills(!editingSkills)}
              className="text-teal text-sm font-medium"
            >
              {editingSkills ? "Done" : "Edit"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-light text-gray-text rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  {editingSkills && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-text">No skills added</p>
            )}
          </div>
          {editingSkills && (
            <div className="mt-3 ml-8 flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                onClick={addSkill}
                className="px-3 py-2 bg-teal text-white rounded-input text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="bg-white rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 text-teal text-center">★</span>
              <span className="font-medium text-navy">Interests</span>
            </div>
            <button
              onClick={() => setEditingInterests(!editingInterests)}
              className="text-teal text-sm font-medium"
            >
              {editingInterests ? "Done" : "Edit"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {profile?.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm flex items-center gap-1"
                >
                  {interest}
                  {editingInterests && (
                    <button onClick={() => removeInterest(interest)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-text">No interests added</p>
            )}
          </div>
          {editingInterests && (
            <div className="mt-3 ml-8 flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addInterest()}
                placeholder="Add an interest..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                onClick={addInterest}
                className="px-3 py-2 bg-teal text-white rounded-input text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="bg-white rounded-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-teal" />
            <span className="font-medium text-navy">Resume</span>
          </div>
          <div className="ml-8">
            {profile?.resume_url ? (
              <div className="flex items-center gap-3">
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal underline text-sm"
                >
                  View Resume
                </a>
                <label className="text-gray-text text-sm cursor-pointer hover:text-teal">
                  Replace
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-teal transition-colors">
                <Upload className="w-5 h-5 text-gray-text" />
                <span className="text-gray-text text-sm">
                  {resumeUploading ? "Uploading..." : "Upload Resume (PDF, DOC)"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={resumeUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-500 bg-white rounded-card"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
