import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { jobUrl, jobTitle, company } = await request.json();

    if (!jobUrl) {
      return NextResponse.json({ error: "Job URL is required" }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Launch browser and apply
    const result = await autoApplyToJob(jobUrl, profile, jobTitle, company);

    // Log the application
    await supabase.from("applications").insert({
      user_id: user.id,
      job_url: jobUrl,
      job_title: jobTitle || "Unknown",
      company: company || "Unknown",
      status: result.success ? "applied" : "failed",
      applied_at: new Date().toISOString(),
      notes: result.message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Auto-apply error:", error);
    return NextResponse.json(
      { success: false, error: "Auto-apply failed" },
      { status: 500 }
    );
  }
}

async function autoApplyToJob(
  jobUrl: string,
  profile: Record<string, unknown>,
  jobTitle?: string,
  company?: string
) {
  let browser = null;

  try {
    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });

    const page = await context.newPage();

    // Navigate to job page
    await page.goto(jobUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Get page content for job description
    const jobDescription = await page.evaluate(() => {
      const selectors = [
        ".job-description",
        "#job-description",
        '[class*="job-desc"]',
        '[class*="description"]',
        "article",
        ".posting-description",
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent && el.textContent.length > 100) {
          return el.textContent.slice(0, 3000);
        }
      }
      return document.title;
    });

    // Find and click apply button
    const applyButton = await findApplyButton(page);

    if (!applyButton) {
      return {
        success: false,
        message: "Could not find apply button on this page",
      };
    }

    await applyButton.click();
    await page.waitForTimeout(2000);

    // Detect form fields
    const formFields = await page.evaluate(() => {
      const fields: Array<{
        selector: string;
        id: string;
        name: string;
        type: string;
        label: string;
        placeholder: string;
      }> = [];
      const inputs = document.querySelectorAll("input, textarea, select");

      inputs.forEach((input, index) => {
        const el = input as HTMLInputElement;
        if (
          el.type === "hidden" ||
          el.type === "submit" ||
          el.type === "button"
        ) {
          return;
        }

        // Find label
        let label = "";
        if (el.id) {
          const labelEl = document.querySelector(`label[for="${el.id}"]`);
          if (labelEl) label = labelEl.textContent?.trim() || "";
        }
        if (!label) {
          const parent = el.closest("div, fieldset");
          if (parent) {
            const labelEl = parent.querySelector("label");
            if (labelEl) label = labelEl.textContent?.trim() || "";
          }
        }

        fields.push({
          selector: el.id
            ? `#${el.id}`
            : el.name
              ? `[name="${el.name}"]`
              : `input:nth-of-type(${index + 1})`,
          id: el.id || "",
          name: el.name || "",
          type: el.type || el.tagName.toLowerCase(),
          label: label,
          placeholder: el.placeholder || "",
        });
      });

      return fields;
    });

    if (formFields.length === 0) {
      return { success: false, message: "No form fields found after clicking apply" };
    }

    // Use AI to generate fill values
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a job application assistant. Generate appropriate values for job application form fields based on the user's profile. Return a JSON object with field IDs/names as keys and values to fill.

For questions like "Why do you want to work here?", write a compelling 2-3 sentence answer that:
- References the specific company and role
- Connects their experience to the job
- Shows genuine enthusiasm

Be professional and concise.`,
        },
        {
          role: "user",
          content: `Fill this job application form.

Job: ${jobTitle || "Unknown"} at ${company || "Unknown"}
Job Description: ${jobDescription}

User Profile:
- Name: ${profile.full_name}
- Email: ${profile.email}
- Phone: ${profile.phone}
- Location: ${profile.city}, ${profile.state}
- University: ${profile.university}
- Degree: ${profile.degree_type} in ${profile.major}
- GPA: ${profile.gpa}
- Graduation: ${profile.graduation_year}
- LinkedIn: ${profile.linkedin_url}
- GitHub: ${profile.github_url}
- Skills: ${JSON.stringify(profile.skills)}

Form Fields to fill:
${JSON.stringify(formFields, null, 2)}

Return JSON only with field identifiers as keys and values to fill.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const fillData = JSON.parse(aiResponse.choices[0].message.content || "{}");

    // Fill each field
    let filledCount = 0;
    for (const field of formFields) {
      const key = field.id || field.name || field.label.toLowerCase().replace(/\s+/g, "_");
      let value = null;

      // Find matching value
      for (const [k, v] of Object.entries(fillData)) {
        if (
          k === key ||
          k === field.id ||
          k === field.name ||
          k.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(k.toLowerCase())
        ) {
          value = v as string;
          break;
        }
      }

      if (value) {
        try {
          if (field.type === "select") {
            await page.selectOption(field.selector, { label: value });
          } else {
            await page.fill(field.selector, value);
          }
          filledCount++;
        } catch (e) {
          console.log(`Could not fill field ${field.selector}:`, e);
        }
      }
    }

    // Check for resume upload
    const hasResumeUpload = await page.evaluate(() => {
      const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
      for (let i = 0; i < fileInputs.length; i++) {
        const el = fileInputs[i] as HTMLInputElement;
        const text = (el.name + el.id + (el.accept || "")).toLowerCase();
        if (
          text.includes("resume") ||
          text.includes("cv") ||
          text.includes("pdf")
        ) {
          return true;
        }
      }
      return false;
    });

    // Try to submit the form
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")');

    if (submitButton) {
      // Don't actually submit in this version - just report success
      // await submitButton.click();
      return {
        success: true,
        message: `Filled ${filledCount} fields. Resume upload ${hasResumeUpload ? "required" : "not found"}. Ready to submit.`,
        fieldsFilledCount: filledCount,
        requiresResumeUpload: hasResumeUpload,
        readyToSubmit: true,
      };
    }

    return {
      success: true,
      message: `Filled ${filledCount} fields but could not find submit button`,
      fieldsFilledCount: filledCount,
      readyToSubmit: false,
    };
  } catch (error) {
    console.error("Browser automation error:", error);
    return {
      success: false,
      message: `Automation error: ${(error as Error).message}`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function findApplyButton(page: import("playwright").Page) {
  // Common apply button selectors
  const selectors = [
    'a:has-text("Apply")',
    'button:has-text("Apply")',
    'a:has-text("Apply Now")',
    'button:has-text("Apply Now")',
    '[class*="apply"]',
    '#apply-button',
    '.apply-button',
    'a[href*="apply"]',
  ];

  for (const selector of selectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        const isVisible = await button.isVisible();
        if (isVisible) {
          return button;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}
