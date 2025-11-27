import { jsPDF } from "jspdf";
import { Profile } from "@/types/database";

export function generateResume(profile: Profile): jsPDF {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = 50;

  // Colors - professional dark gray, not black
  const black = [33, 33, 33];
  const darkGray = [68, 68, 68];
  const mediumGray = [102, 102, 102];

  // ============================================
  // HEADER - Name
  // ============================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(profile.full_name?.toUpperCase() || "YOUR NAME", pageWidth / 2, y, { align: "center" });
  y += 25;

  // ============================================
  // CONTACT INFO LINE
  // ============================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const contactItems = [];
  if (profile.email) contactItems.push(profile.email);
  if (profile.location) contactItems.push(profile.location);

  const contactLine = contactItems.join("  •  ");
  doc.text(contactLine, pageWidth / 2, y, { align: "center" });
  y += 30;

  // ============================================
  // HORIZONTAL LINE
  // ============================================
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 25;

  // ============================================
  // EDUCATION SECTION
  // ============================================
  // Section header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("EDUCATION", margin, y);
  y += 18;

  // University name and date on same line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(profile.university || "University Name", margin, y);

  // Graduation date aligned right
  if (profile.graduation_year) {
    doc.setFont("helvetica", "normal");
    doc.text(`Expected ${profile.graduation_year}`, pageWidth - margin, y, { align: "right" });
  }
  y += 15;

  // Degree info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);

  let degreeText = "";
  if (profile.major) {
    degreeText = `Bachelor's in ${profile.major}`;
  }
  if (profile.gpa) {
    degreeText += degreeText ? `  •  GPA: ${profile.gpa}` : `GPA: ${profile.gpa}`;
  }
  if (degreeText) {
    doc.text(degreeText, margin, y);
  }
  y += 30;

  // ============================================
  // SKILLS SECTION
  // ============================================
  if (profile.skills && profile.skills.length > 0) {
    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text("SKILLS", margin, y);
    y += 18;

    // Skills as comma-separated list
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    const skillsText = profile.skills.join(", ");
    const splitSkills = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(splitSkills, margin, y);
    y += splitSkills.length * 14 + 20;
  }

  // ============================================
  // EXPERIENCE SECTION
  // ============================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("EXPERIENCE", margin, y);
  y += 18;

  // Placeholder experience entry
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text("Position Title", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text("Month Year – Present", pageWidth - margin, y, { align: "right" });
  y += 14;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Company Name, Location", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  const bullets = [
    "• Add your accomplishments and responsibilities here",
    "• Use action verbs and quantify results when possible",
    "• Keep bullet points concise and impactful",
  ];
  bullets.forEach((bullet) => {
    doc.text(bullet, margin + 10, y);
    y += 14;
  });
  y += 20;

  // ============================================
  // PROJECTS SECTION
  // ============================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("PROJECTS", margin, y);
  y += 18;

  // Placeholder project entry
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text("Project Name", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  const projectBullets = [
    "• Describe what you built and the technologies used",
    "• Highlight the impact or results of the project",
  ];
  projectBullets.forEach((bullet) => {
    doc.text(bullet, margin + 10, y);
    y += 14;
  });
  y += 20;

  // ============================================
  // INTERESTS SECTION (if they have any)
  // ============================================
  if (profile.interests && profile.interests.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text("INTERESTS", margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    const interestsText = profile.interests.join(", ");
    const splitInterests = doc.splitTextToSize(interestsText, contentWidth);
    doc.text(splitInterests, margin, y);
  }

  return doc;
}

export function downloadResume(profile: Profile) {
  const doc = generateResume(profile);
  const firstName = profile.full_name?.split(" ")[0] || "Resume";
  const fileName = `${firstName}_Resume.pdf`;
  doc.save(fileName);
}
