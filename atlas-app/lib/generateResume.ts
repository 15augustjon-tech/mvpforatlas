import { jsPDF } from "jspdf";
import { Profile } from "@/types/database";

export function generateResume(profile: Profile): jsPDF {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 40;

  // Font sizes (matching Jake's Resume template)
  const nameSize = 18;
  const contactSize = 10;
  const sectionTitleSize = 11;
  const entryTitleSize = 10;
  const bodySize = 10;

  // Colors - pure black for ATS compatibility
  const black: [number, number, number] = [0, 0, 0];

  // Helper function to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 40;
    }
  };

  // ============================================
  // HEADER - Name (centered, bold, uppercase)
  // ============================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(profile.full_name?.toUpperCase() || "YOUR NAME", pageWidth / 2, y, { align: "center" });
  y += 16;

  // ============================================
  // CONTACT INFO LINE (centered, separated by |)
  // ============================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(contactSize);

  const contactItems: string[] = [];
  if (profile.phone) contactItems.push(profile.phone);
  if (profile.email) contactItems.push(profile.email);
  if (profile.linkedin_url) {
    const linkedin = profile.linkedin_url.replace("https://", "").replace("http://", "");
    contactItems.push(linkedin);
  }
  if (profile.github_url) {
    const github = profile.github_url.replace("https://", "").replace("http://", "");
    contactItems.push(github);
  }
  if (profile.portfolio_url) {
    const portfolio = profile.portfolio_url.replace("https://", "").replace("http://", "");
    contactItems.push(portfolio);
  }

  if (contactItems.length > 0) {
    const contactLine = contactItems.join(" | ");
    doc.text(contactLine, pageWidth / 2, y, { align: "center" });
  }
  y += 14;

  // Horizontal line under header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // ============================================
  // EDUCATION SECTION
  // ============================================
  if (profile.university) {
    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionTitleSize);
    doc.text("EDUCATION", margin, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // University row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(entryTitleSize);
    doc.text(profile.university, margin, y);

    // Location (right aligned)
    if (profile.city && profile.state) {
      doc.setFont("helvetica", "normal");
      doc.text(`${profile.city}, ${profile.state}`, pageWidth - margin, y, { align: "right" });
    }
    y += 12;

    // Degree row
    doc.setFont("helvetica", "italic");
    doc.setFontSize(entryTitleSize);

    let degreeText = "";
    if (profile.degree_type && profile.major) {
      degreeText = `${profile.degree_type} in ${profile.major}`;
    } else if (profile.major) {
      degreeText = `Bachelor's in ${profile.major}`;
    }
    if (profile.minor) {
      degreeText += `, Minor in ${profile.minor}`;
    }

    doc.text(degreeText, margin, y);

    // Graduation date (right aligned)
    if (profile.graduation_month && profile.graduation_year) {
      doc.setFont("helvetica", "normal");
      doc.text(`${profile.graduation_month} ${profile.graduation_year}`, pageWidth - margin, y, { align: "right" });
    } else if (profile.graduation_year) {
      doc.setFont("helvetica", "normal");
      doc.text(`Expected ${profile.graduation_year}`, pageWidth - margin, y, { align: "right" });
    }
    y += 12;

    // GPA row
    if (profile.gpa) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(entryTitleSize);
      doc.text(`GPA: ${profile.gpa}/4.0`, margin, y);
      y += 12;
    }

    // Relevant Coursework
    if (profile.relevant_coursework && profile.relevant_coursework.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(entryTitleSize);
      const courseworkLabel = "Relevant Coursework: ";
      doc.text(courseworkLabel, margin, y);

      doc.setFont("helvetica", "normal");
      const courseworkText = profile.relevant_coursework.join(", ");
      const labelWidth = doc.getTextWidth(courseworkLabel);
      const courseworkLines = doc.splitTextToSize(courseworkText, contentWidth - labelWidth);
      doc.text(courseworkLines[0], margin + labelWidth, y);
      if (courseworkLines.length > 1) {
        y += 12;
        for (let i = 1; i < courseworkLines.length; i++) {
          doc.text(courseworkLines[i], margin, y);
          y += 12;
        }
      } else {
        y += 12;
      }
    }

    y += 8;
  }

  // ============================================
  // EXPERIENCE SECTION
  // ============================================
  if (profile.experiences && profile.experiences.length > 0) {
    checkPageBreak(60);

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionTitleSize);
    doc.text("EXPERIENCE", margin, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    for (const exp of profile.experiences) {
      checkPageBreak(50);

      // Title row with date
      doc.setFont("helvetica", "bold");
      doc.setFontSize(entryTitleSize);
      doc.text(exp.title || "Position", margin, y);

      // Date (right aligned)
      doc.setFont("helvetica", "normal");
      const dateText = exp.current
        ? `${exp.startDate} – Present`
        : `${exp.startDate} – ${exp.endDate}`;
      doc.text(dateText, pageWidth - margin, y, { align: "right" });
      y += 12;

      // Company and location (italic)
      doc.setFont("helvetica", "italic");
      const companyLocation = exp.location
        ? `${exp.company}, ${exp.location}`
        : exp.company;
      doc.text(companyLocation, margin, y);
      y += 12;

      // Bullet points
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      const bulletIndent = 10;

      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        checkPageBreak(20);

        const bulletText = `• ${bullet}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - bulletIndent);
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], margin + (i === 0 ? 0 : bulletIndent), y);
          y += 12;
        }
      }

      y += 6;
    }

    y += 4;
  }

  // ============================================
  // PROJECTS SECTION
  // ============================================
  if (profile.projects && profile.projects.length > 0) {
    checkPageBreak(60);

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionTitleSize);
    doc.text("PROJECTS", margin, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    for (const proj of profile.projects) {
      checkPageBreak(50);

      // Project name with date
      doc.setFont("helvetica", "bold");
      doc.setFontSize(entryTitleSize);
      doc.text(proj.name || "Project", margin, y);

      // Date (right aligned)
      if (proj.date) {
        doc.setFont("helvetica", "normal");
        doc.text(proj.date, pageWidth - margin, y, { align: "right" });
      }
      y += 12;

      // Technologies (italic)
      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(entryTitleSize);
        doc.text(proj.technologies.join(", "), margin, y);
        y += 12;
      }

      // Bullet points
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      const bulletIndent = 10;

      for (const bullet of proj.bullets) {
        if (!bullet.trim()) continue;
        checkPageBreak(20);

        const bulletText = `• ${bullet}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - bulletIndent);
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], margin + (i === 0 ? 0 : bulletIndent), y);
          y += 12;
        }
      }

      y += 6;
    }

    y += 4;
  }

  // ============================================
  // TECHNICAL SKILLS SECTION
  // ============================================
  const hasSkills =
    (profile.languages && profile.languages.length > 0) ||
    (profile.frameworks && profile.frameworks.length > 0) ||
    (profile.tools && profile.tools.length > 0) ||
    (profile.skills && profile.skills.length > 0);

  if (hasSkills) {
    checkPageBreak(50);

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionTitleSize);
    doc.text("TECHNICAL SKILLS", margin, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    doc.setFontSize(entryTitleSize);

    // Languages
    if (profile.languages && profile.languages.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Languages: ", margin, y);
      const langLabelWidth = doc.getTextWidth("Languages: ");
      doc.setFont("helvetica", "normal");
      const langText = profile.languages.join(", ");
      const langLines = doc.splitTextToSize(langText, contentWidth - langLabelWidth);
      doc.text(langLines[0], margin + langLabelWidth, y);
      y += 12;
      for (let i = 1; i < langLines.length; i++) {
        doc.text(langLines[i], margin, y);
        y += 12;
      }
    }

    // Frameworks
    if (profile.frameworks && profile.frameworks.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Frameworks: ", margin, y);
      const fwLabelWidth = doc.getTextWidth("Frameworks: ");
      doc.setFont("helvetica", "normal");
      const fwText = profile.frameworks.join(", ");
      const fwLines = doc.splitTextToSize(fwText, contentWidth - fwLabelWidth);
      doc.text(fwLines[0], margin + fwLabelWidth, y);
      y += 12;
      for (let i = 1; i < fwLines.length; i++) {
        doc.text(fwLines[i], margin, y);
        y += 12;
      }
    }

    // Tools
    if (profile.tools && profile.tools.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Tools: ", margin, y);
      const toolLabelWidth = doc.getTextWidth("Tools: ");
      doc.setFont("helvetica", "normal");
      const toolText = profile.tools.join(", ");
      const toolLines = doc.splitTextToSize(toolText, contentWidth - toolLabelWidth);
      doc.text(toolLines[0], margin + toolLabelWidth, y);
      y += 12;
      for (let i = 1; i < toolLines.length; i++) {
        doc.text(toolLines[i], margin, y);
        y += 12;
      }
    }

    // Fallback to general skills array if no categorized skills
    if (
      (!profile.languages || profile.languages.length === 0) &&
      (!profile.frameworks || profile.frameworks.length === 0) &&
      (!profile.tools || profile.tools.length === 0) &&
      profile.skills &&
      profile.skills.length > 0
    ) {
      doc.setFont("helvetica", "normal");
      const skillsText = profile.skills.join(", ");
      const skillLines = doc.splitTextToSize(skillsText, contentWidth);
      for (const line of skillLines) {
        doc.text(line, margin, y);
        y += 12;
      }
    }

    y += 8;
  }

  // ============================================
  // INTERESTS (optional, if space allows)
  // ============================================
  if (profile.interests && profile.interests.length > 0) {
    checkPageBreak(40);

    // Only add if we have room
    if (y < doc.internal.pageSize.getHeight() - 60) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(sectionTitleSize);
      doc.text("INTERESTS", margin, y);
      y += 2;
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(entryTitleSize);
      const interestsText = profile.interests.join(", ");
      const interestLines = doc.splitTextToSize(interestsText, contentWidth);
      for (const line of interestLines) {
        doc.text(line, margin, y);
        y += 12;
      }
    }
  }

  return doc;
}

export function downloadResume(profile: Profile) {
  const doc = generateResume(profile);
  const firstName = profile.full_name?.split(" ")[0] || "Resume";
  const lastName = profile.full_name?.split(" ").slice(1).join("_") || "";
  const fileName = lastName
    ? `${firstName}_${lastName}_Resume.pdf`
    : `${firstName}_Resume.pdf`;
  doc.save(fileName);
}
