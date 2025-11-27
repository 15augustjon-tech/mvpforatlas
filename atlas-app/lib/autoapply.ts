/**
 * Steel.dev Auto-Apply Integration
 * Uses Steel's browser automation to fill job application forms
 */

const STEEL_API_KEY = process.env.STEEL_API_KEY;
const STEEL_BASE_URL = "https://api.steel.dev/v1";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  resumeUrl?: string;
}

interface ApplyResult {
  success: boolean;
  message: string;
  sessionId?: string;
}

export async function autoApply(jobUrl: string, profile: ProfileData): Promise<ApplyResult> {
  if (!STEEL_API_KEY) {
    return {
      success: false,
      message: "Steel API key not configured. Opening application manually.",
    };
  }

  try {
    // Create a Steel browser session
    const sessionRes = await fetch(`${STEEL_BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        "Steel-Api-Key": STEEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        useProxy: true,
        solveCaptcha: true,
      }),
    });

    if (!sessionRes.ok) {
      const error = await sessionRes.text();
      console.error("Steel session error:", error);
      return {
        success: false,
        message: "Could not start browser session. Opening application manually.",
      };
    }

    const session = await sessionRes.json();
    const sessionId = session.id;

    // Navigate to job URL
    await executeAction(sessionId, {
      action: "goto",
      url: jobUrl,
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Common form field selectors and values
    const fieldsToFill = [
      {
        selectors: ['input[name*="first" i]', 'input[name*="fname" i]', 'input[id*="first" i]', 'input[placeholder*="first" i]'],
        value: profile.firstName
      },
      {
        selectors: ['input[name*="last" i]', 'input[name*="lname" i]', 'input[id*="last" i]', 'input[placeholder*="last" i]'],
        value: profile.lastName
      },
      {
        selectors: ['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'],
        value: profile.email
      },
      {
        selectors: ['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'],
        value: profile.phone
      },
      {
        selectors: ['input[name*="linkedin" i]', 'input[id*="linkedin" i]', 'input[placeholder*="linkedin" i]'],
        value: profile.linkedin
      },
      {
        selectors: ['input[name*="school" i]', 'input[name*="university" i]', 'input[id*="university" i]'],
        value: profile.university
      },
      {
        selectors: ['input[name*="major" i]', 'input[name*="study" i]', 'input[id*="major" i]'],
        value: profile.major
      },
      {
        selectors: ['input[name*="graduation" i]', 'input[name*="year" i]', 'input[id*="graduation" i]'],
        value: profile.graduationYear
      },
    ];

    // Try to fill each field
    for (const field of fieldsToFill) {
      if (!field.value) continue;

      for (const selector of field.selectors) {
        try {
          await executeAction(sessionId, {
            action: "fill",
            selector,
            value: field.value,
          });
          break; // Stop trying other selectors if one works
        } catch {
          // Selector not found, try next one
        }
      }
    }

    // Don't close session immediately - let user review
    // Session will auto-close after timeout

    return {
      success: true,
      message: "Form pre-filled! Review and submit your application.",
      sessionId,
    };

  } catch (error) {
    console.error("Auto-apply error:", error);
    return {
      success: false,
      message: "Could not auto-fill form. Opening application manually.",
    };
  }
}

async function executeAction(sessionId: string, action: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${STEEL_BASE_URL}/sessions/${sessionId}/actions`, {
    method: "POST",
    headers: {
      "Steel-Api-Key": STEEL_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error(`Action failed: ${response.status}`);
  }

  return response.json();
}

export async function closeSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${STEEL_BASE_URL}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Steel-Api-Key": STEEL_API_KEY!,
      },
    });
  } catch (error) {
    console.error("Error closing session:", error);
  }
}
