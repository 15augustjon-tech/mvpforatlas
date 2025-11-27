// ATLAS AI Auto-Fill Content Script
console.log("ATLAS AI Auto-Fill loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "AI_FILL_FORM") {
    handleAIFill(request.profile, request.apiUrl)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function handleAIFill(profile, apiUrl) {
  // Step 1: Detect all form fields on the page
  const formFields = detectFormFields();

  if (formFields.length === 0) {
    return { success: false, error: "No form fields found on this page" };
  }

  // Step 2: Get job description from page
  const jobDescription = getJobDescription();

  // Step 3: Check for resume upload field and trigger download
  const hasResumeField = detectResumeUploadField();
  if (hasResumeField) {
    triggerResumeDownload(profile, apiUrl);
  }

  // Step 4: Call AI API to get smart fill values
  try {
    const response = await fetch(apiUrl + "/api/ai-autofill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formFields: formFields.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
        })),
        jobDescription,
        userProfile: profile,
      }),
    });

    if (!response.ok) {
      throw new Error("AI API request failed");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "AI failed to generate responses");
    }

    // Step 4: Fill the form with AI-generated values
    const filledCount = fillFormWithAI(formFields, data.filledData);

    return { success: true, fieldsCount: filledCount };
  } catch (error) {
    console.error("AI Fill error:", error);
    // Fallback to basic fill
    const filledCount = fillFormBasic(formFields, profile);
    return { success: true, fieldsCount: filledCount, fallback: true };
  }
}

function detectFormFields() {
  const fields = [];
  const inputs = document.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    if (input.type === "hidden" || input.type === "submit" || input.type === "button") {
      return;
    }

    const label = findLabel(input);

    fields.push({
      element: input,
      id: input.id || "",
      name: input.name || "",
      type: input.type || input.tagName.toLowerCase(),
      label: label,
      placeholder: input.placeholder || "",
    });
  });

  return fields;
}

function findLabel(input) {
  // Check for associated label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent.trim();
  }

  // Check parent for label
  const parent = input.closest("div, fieldset, section");
  if (parent) {
    const label = parent.querySelector("label, .label, [class*='label']");
    if (label) return label.textContent.trim();
  }

  // Check aria-label
  if (input.getAttribute("aria-label")) {
    return input.getAttribute("aria-label");
  }

  return "";
}

function getJobDescription() {
  // Try to find job description on the page
  const selectors = [
    ".job-description",
    "#job-description",
    "[class*='job-desc']",
    "[class*='description']",
    "article",
    ".posting-description",
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.length > 100) {
      return el.textContent.slice(0, 2000); // Limit to 2000 chars
    }
  }

  // Fallback: get page title
  return document.title;
}

function fillFormWithAI(fields, filledData) {
  let count = 0;

  fields.forEach((field) => {
    // Try to find matching value from AI response
    const key = field.id || field.name || field.label.toLowerCase().replace(/\s+/g, "_");
    let value = null;

    // Check various possible keys
    for (const [k, v] of Object.entries(filledData)) {
      if (
        k === key ||
        k === field.id ||
        k === field.name ||
        k.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(k.toLowerCase())
      ) {
        value = v;
        break;
      }
    }

    if (value && value !== "") {
      setFieldValue(field.element, value);
      count++;
    }
  });

  return count;
}

function fillFormBasic(fields, profile) {
  let count = 0;

  const mappings = {
    // Name fields
    name: profile.full_name,
    full_name: profile.full_name,
    first_name: profile.full_name?.split(" ")[0],
    last_name: profile.full_name?.split(" ").slice(1).join(" "),
    firstname: profile.full_name?.split(" ")[0],
    lastname: profile.full_name?.split(" ").slice(1).join(" "),

    // Contact
    email: profile.email,
    phone: profile.phone,
    telephone: profile.phone,
    mobile: profile.phone,

    // Location
    city: profile.city,
    state: profile.state,
    location: profile.location || `${profile.city}, ${profile.state}`,

    // Education
    university: profile.university,
    school: profile.university,
    college: profile.university,
    degree: profile.degree_type,
    major: profile.major,
    gpa: profile.gpa?.toString(),
    graduation: profile.graduation_year?.toString(),
    graduation_year: profile.graduation_year?.toString(),

    // Links
    linkedin: profile.linkedin_url,
    github: profile.github_url,
    portfolio: profile.portfolio_url,
    website: profile.portfolio_url,
  };

  fields.forEach((field) => {
    const searchKey = (field.id + field.name + field.label + field.placeholder).toLowerCase();

    for (const [key, value] of Object.entries(mappings)) {
      if (value && searchKey.includes(key)) {
        setFieldValue(field.element, value);
        count++;
        break;
      }
    }
  });

  return count;
}

function setFieldValue(element, value) {
  if (element.tagName === "SELECT") {
    // For select, find matching option
    const options = element.options;
    for (let i = 0; i < options.length; i++) {
      if (
        options[i].value.toLowerCase().includes(value.toLowerCase()) ||
        options[i].text.toLowerCase().includes(value.toLowerCase())
      ) {
        element.value = options[i].value;
        break;
      }
    }
  } else {
    element.value = value;
  }

  // Trigger events so frameworks detect the change
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

// Detect if there's a resume upload field
function detectResumeUploadField() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  for (const input of fileInputs) {
    const label = findLabel(input);
    const searchText = (label + input.name + input.id + (input.accept || "")).toLowerCase();
    if (
      searchText.includes("resume") ||
      searchText.includes("cv") ||
      searchText.includes("pdf") ||
      searchText.includes("document")
    ) {
      // Highlight the resume upload field
      input.style.border = "3px solid #14b8a6";
      input.style.borderRadius = "8px";
      input.style.padding = "8px";
      return true;
    }
  }
  return false;
}

// Trigger resume PDF download
async function triggerResumeDownload(profile, apiUrl) {
  try {
    // Call API to generate resume PDF
    const response = await fetch(apiUrl + "/api/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const firstName = profile.full_name?.split(" ")[0] || "Resume";
      const lastName = profile.full_name?.split(" ").slice(1).join("_") || "";
      const fileName = lastName ? `${firstName}_${lastName}_Resume.pdf` : `${firstName}_Resume.pdf`;

      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification("Resume downloaded! Drag it to the upload field.", "success");
    }
  } catch (error) {
    console.error("Resume download error:", error);
    showNotification("Open ATLAS to download your resume", "info");
  }
}

// Show floating notification
function showNotification(message, type = "success") {
  const existing = document.getElementById("atlas-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.id = "atlas-notification";
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "linear-gradient(135deg, #14b8a6, #0ea5e9)" : "#ef4444"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    ">
      ${message}
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}
