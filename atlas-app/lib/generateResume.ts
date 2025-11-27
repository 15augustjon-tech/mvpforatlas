import { jsPDF } from "jspdf";
import { Profile } from "@/types/database";

export function generateResume(profile: Profile): jsPDF {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // Page setup - wider margins for breathing room
  const pageWidth = doc.internal.pageSize.getWidth(); // 612pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792pt
  const margin = 54; // 0.75 inch margins
  const contentWidth = pageWidth - margin * 2;
  let y = 54;

  // Font sizes - slightly larger for readability
  const nameSize = 16;
  const sectionTitleSize = 10;
  const bodySize = 10;
  const smallSize = 9;

  // Line heights - more generous spacing
  const lineHeight = 13;
  const sectionGap = 16;
  const entryGap = 10;

  // Helper function to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 54) {
      doc.addPage();
      y = 54;
    }
  };

  // Helper to draw section header with underline
  const drawSectionHeader = (title: string) => {
    checkPageBreak(30);
    doc.setFont("times", "bold");
    doc.setFontSize(sectionTitleSize);
    doc.text(title, margin, y);
    y += 3;
    doc.setLineWidth(0.75);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight;
  };

  // ============================================
  // HEADER - Name (centered, bold)
  // ============================================
  doc.setFont("times", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(0, 0, 0);
  doc.text(profile.full_name?.toUpperCase() || "YOUR NAME", pageWidth / 2, y, { align: "center" });
  y += 18;

  // ============================================
  // CONTACT INFO LINE
  // ============================================
  doc.setFont("times", "normal");
  doc.setFontSize(smallSize);

  const contactItems: string[] = [];
  if (profile.phone) contactItems.push(profile.phone);
  if (profile.email) contactItems.push(profile.email);
  if (profile.linkedin_url) {
    const linkedin = profile.linkedin_url.replace("https://", "").replace("http://", "").replace("www.", "");
    contactItems.push(linkedin);
  }
  if (profile.github_url) {
    const github = profile.github_url.replace("https://", "").replace("http://", "").replace("www.", "");
    contactItems.push(github);
  }

  if (contactItems.length > 0) {
    const contactLine = contactItems.join("  |  ");
    doc.text(contactLine, pageWidth / 2, y, { align: "center" });
  }
  y += sectionGap + 4;

  // ============================================
  // EDUCATION SECTION
  // ============================================
  if (profile.university) {
    drawSectionHeader("EDUCATION");

    // University and location on same line
    doc.setFont("times", "bold");
    doc.setFontSize(bodySize);
    doc.text(profile.university, margin, y);

    if (profile.city && profile.state) {
      doc.setFont("times", "normal");
      doc.text(`${profile.city}, ${profile.state}`, pageWidth - margin, y, { align: "right" });
    }
    y += lineHeight;

    // Degree and graduation date
    doc.setFont("times", "italic");
    let degreeText = "";
    if (profile.degree_type && profile.major) {
      degreeText = `${profile.degree_type}, ${profile.major}`;
    } else if (profile.major) {
      degreeText = `Bachelor of Science, ${profile.major}`;
    }
    if (profile.minor) {
      degreeText += `, Minor in ${profile.minor}`;
    }
    doc.text(degreeText, margin, y);

    // Graduation date
    doc.setFont("times", "normal");
    if (profile.graduation_month && profile.graduation_year) {
      doc.text(`${profile.graduation_month} ${profile.graduation_year}`, pageWidth - margin, y, { align: "right" });
    } else if (profile.graduation_year) {
      doc.text(`Expected ${profile.graduation_year}`, pageWidth - margin, y, { align: "right" });
    }
    y += lineHeight;

    // GPA on its own line
    if (profile.gpa) {
      doc.setFont("times", "normal");
      doc.text(`GPA: ${profile.gpa}/4.0`, margin, y);
      y += lineHeight;
    }

    // Relevant Coursework
    if (profile.relevant_coursework && profile.relevant_coursework.length > 0) {
      doc.setFont("times", "bold");
      const label = "Relevant Coursework: ";
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);

      doc.setFont("times", "normal");
      const courseworkText = profile.relevant_coursework.join(", ");
      const lines = doc.splitTextToSize(courseworkText, contentWidth - labelWidth);
      doc.text(lines[0], margin + labelWidth, y);
      y += lineHeight;

      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
    }

    y += sectionGap;
  }

  // ============================================
  // EXPERIENCE SECTION
  // ============================================
  if (profile.experiences && profile.experiences.length > 0) {
    drawSectionHeader("EXPERIENCE");

    for (let i = 0; i < profile.experiences.length; i++) {
      const exp = profile.experiences[i];
      checkPageBreak(60);

      // Job title and date
      doc.setFont("times", "bold");
      doc.setFontSize(bodySize);
      doc.text(exp.title || "Position Title", margin, y);

      doc.setFont("times", "normal");
      const dateText = exp.current
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;
      doc.text(dateText, pageWidth - margin, y, { align: "right" });
      y += lineHeight;

      // Company and location
      doc.setFont("times", "italic");
      const companyLine = exp.location ? `${exp.company}, ${exp.location}` : exp.company;
      doc.text(companyLine, margin, y);
      y += lineHeight + 2;

      // Bullet points
      doc.setFont("times", "normal");
      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        checkPageBreak(lineHeight * 2);

        const bulletText = bullet;
        const lines = doc.splitTextToSize(bulletText, contentWidth - 12);

        // Draw bullet
        doc.text("•", margin, y);

        for (let j = 0; j < lines.length; j++) {
          doc.text(lines[j], margin + 12, y);
          y += lineHeight;
        }
      }

      // Add space between experiences (but not after the last one)
      if (i < profile.experiences.length - 1) {
        y += entryGap;
      }
    }

    y += sectionGap;
  }

  // ============================================
  // PROJECTS SECTION
  // ============================================
  if (profile.projects && profile.projects.length > 0) {
    drawSectionHeader("PROJECTS");

    for (let i = 0; i < profile.projects.length; i++) {
      const proj = profile.projects[i];
      checkPageBreak(50);

      // Project name and date
      doc.setFont("times", "bold");
      doc.setFontSize(bodySize);
      doc.text(proj.name || "Project Name", margin, y);

      if (proj.date) {
        doc.setFont("times", "normal");
        doc.text(proj.date, pageWidth - margin, y, { align: "right" });
      }
      y += lineHeight;

      // Technologies
      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("times", "italic");
        doc.text(proj.technologies.join(", "), margin, y);
        y += lineHeight + 2;
      }

      // Bullet points
      doc.setFont("times", "normal");
      for (const bullet of proj.bullets) {
        if (!bullet.trim()) continue;
        checkPageBreak(lineHeight * 2);

        const lines = doc.splitTextToSize(bullet, contentWidth - 12);
        doc.text("•", margin, y);

        for (let j = 0; j < lines.length; j++) {
          doc.text(lines[j], margin + 12, y);
          y += lineHeight;
        }
      }

      if (i < profile.projects.length - 1) {
        y += entryGap;
      }
    }

    y += sectionGap;
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
    drawSectionHeader("SKILLS");

    doc.setFontSize(bodySize);

    // Languages
    if (profile.languages && profile.languages.length > 0) {
      doc.setFont("times", "bold");
      const label = "Languages: ";
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);

      doc.setFont("times", "normal");
      const text = profile.languages.join(", ");
      const lines = doc.splitTextToSize(text, contentWidth - labelWidth);
      doc.text(lines[0], margin + labelWidth, y);
      y += lineHeight;

      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
    }

    // Frameworks
    if (profile.frameworks && profile.frameworks.length > 0) {
      doc.setFont("times", "bold");
      const label = "Frameworks: ";
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);

      doc.setFont("times", "normal");
      const text = profile.frameworks.join(", ");
      const lines = doc.splitTextToSize(text, contentWidth - labelWidth);
      doc.text(lines[0], margin + labelWidth, y);
      y += lineHeight;

      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
    }

    // Tools
    if (profile.tools && profile.tools.length > 0) {
      doc.setFont("times", "bold");
      const label = "Developer Tools: ";
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);

      doc.setFont("times", "normal");
      const text = profile.tools.join(", ");
      const lines = doc.splitTextToSize(text, contentWidth - labelWidth);
      doc.text(lines[0], margin + labelWidth, y);
      y += lineHeight;

      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
    }

    // Fallback to general skills
    if (
      (!profile.languages || profile.languages.length === 0) &&
      (!profile.frameworks || profile.frameworks.length === 0) &&
      (!profile.tools || profile.tools.length === 0) &&
      profile.skills &&
      profile.skills.length > 0
    ) {
      doc.setFont("times", "normal");
      const text = profile.skills.join(", ");
      const lines = doc.splitTextToSize(text, contentWidth);
      for (const line of lines) {
        doc.text(line, margin, y);
        y += lineHeight;
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
