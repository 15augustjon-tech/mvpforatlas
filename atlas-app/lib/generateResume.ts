import { jsPDF } from "jspdf";
import { Profile } from "@/types/database";

export function generateResume(profile: Profile): jsPDF {
  const doc = new jsPDF();

  // Colors
  const teal = [20, 184, 166];
  const navy = [30, 41, 59];
  const gray = [100, 116, 139];

  let y = 20; // Current Y position

  // Header - Name
  doc.setFontSize(28);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont("helvetica", "bold");
  doc.text(profile.full_name || "Your Name", 20, y);
  y += 10;

  // Contact info line
  doc.setFontSize(10);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont("helvetica", "normal");

  const contactParts = [];
  if (profile.email) contactParts.push(profile.email);
  if (profile.location) contactParts.push(profile.location);

  doc.text(contactParts.join("  |  "), 20, y);
  y += 15;

  // Divider line
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Education Section
  doc.setFontSize(14);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFont("helvetica", "bold");
  doc.text("EDUCATION", 20, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont("helvetica", "bold");
  doc.text(profile.university || "University", 20, y);

  // Graduation year on the right
  if (profile.graduation_year) {
    doc.setFont("helvetica", "normal");
    doc.text(`Class of ${profile.graduation_year}`, 190, y, { align: "right" });
  }
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont("helvetica", "normal");

  const educationDetails = [];
  if (profile.major) educationDetails.push(profile.major);
  if (profile.gpa) educationDetails.push(`GPA: ${profile.gpa}`);

  if (educationDetails.length > 0) {
    doc.text(educationDetails.join("  |  "), 20, y);
  }
  y += 15;

  // Skills Section
  if (profile.skills && profile.skills.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.setFont("helvetica", "bold");
    doc.text("SKILLS", 20, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "normal");

    // Wrap skills text
    const skillsText = profile.skills.join("  •  ");
    const splitSkills = doc.splitTextToSize(skillsText, 170);
    doc.text(splitSkills, 20, y);
    y += splitSkills.length * 6 + 10;
  }

  // Interests Section
  if (profile.interests && profile.interests.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.setFont("helvetica", "bold");
    doc.text("INTERESTS", 20, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "normal");

    const interestsText = profile.interests.join("  •  ");
    const splitInterests = doc.splitTextToSize(interestsText, 170);
    doc.text(splitInterests, 20, y);
    y += splitInterests.length * 6 + 10;
  }

  // Experience Section (placeholder for users to fill)
  doc.setFontSize(14);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFont("helvetica", "bold");
  doc.text("EXPERIENCE", 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Add your work experience, internships, and projects here.", 20, y);
  y += 15;

  // Projects Section (placeholder)
  doc.setFontSize(14);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECTS", 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Add your personal or academic projects here.", 20, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Generated with ATLAS", 105, 285, { align: "center" });

  return doc;
}

export function downloadResume(profile: Profile) {
  const doc = generateResume(profile);
  const fileName = `${(profile.full_name || "resume").replace(/\s+/g, "_")}_Resume.pdf`;
  doc.save(fileName);
}
