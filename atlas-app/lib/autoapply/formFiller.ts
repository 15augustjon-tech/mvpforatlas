import { Page } from 'playwright';
import { matchFieldToProfile } from './fieldDetector';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  school: string;
  major: string;
  graduation_year: number;
  gpa?: string;
  skills: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  resume_url?: string;
  work_authorized?: boolean;
  available_start?: string;
}

export interface FillResult {
  success: boolean;
  fieldsFilled: number;
  fieldsTotal: number;
  errors: string[];
  filledFields: { field: string; value: string }[];
}

// Split full name into first/last
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: '' };
  }
  return {
    first: parts[0],
    last: parts.slice(1).join(' ')
  };
}

// Get value from profile based on mapped field
function getProfileValue(profile: UserProfile, mappedField: string): string {
  const { first, last } = splitName(profile.full_name || '');

  const valueMap: Record<string, string> = {
    firstName: first,
    lastName: last,
    fullName: profile.full_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    linkedin: profile.linkedin_url || '',
    github: profile.github_url || '',
    portfolio: profile.portfolio_url || '',
    university: profile.school || '',
    major: profile.major || '',
    graduationYear: profile.graduation_year?.toString() || '',
    gpa: profile.gpa || '',
    location: profile.location || '',
    workAuthorization: profile.work_authorized ? 'Yes' : '',
    startDate: profile.available_start || 'Immediately',
    salary: '',
  };

  return valueMap[mappedField] || '';
}

export async function detectAndFillForm(
  page: Page,
  profile: UserProfile,
  aiAnswers?: Record<string, string>
): Promise<FillResult> {
  const result: FillResult = {
    success: false,
    fieldsFilled: 0,
    fieldsTotal: 0,
    errors: [],
    filledFields: []
  };

  try {
    // Wait for form to be ready
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Find all input fields
    const inputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    const textareas = await page.$$('textarea');
    const selects = await page.$$('select');

    const allFields = [...inputs, ...textareas, ...selects];
    result.fieldsTotal = allFields.length;

    for (const field of allFields) {
      try {
        // Get field attributes
        const fieldName = await field.getAttribute('name') || '';
        const fieldId = await field.getAttribute('id') || '';
        const fieldType = await field.getAttribute('type') || 'text';
        const placeholder = await field.getAttribute('placeholder') || '';
        const ariaLabel = await field.getAttribute('aria-label') || '';

        // Try to find associated label
        let labelText = '';
        if (fieldId) {
          const label = await page.$(`label[for="${fieldId}"]`);
          if (label) {
            labelText = await label.textContent() || '';
          }
        }
        // Also check parent label
        const parentLabel = await field.$('xpath=ancestor::label');
        if (parentLabel) {
          labelText += ' ' + (await parentLabel.textContent() || '');
        }

        // Match field to profile
        const mappedField = matchFieldToProfile(
          fieldName,
          fieldId,
          labelText + ' ' + ariaLabel,
          placeholder
        );

        if (!mappedField) {
          continue;
        }

        // Get value to fill
        let value = '';

        // Check if it's a textarea that needs AI answer
        const tagName = await field.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'textarea' && aiAnswers) {
          if (mappedField === 'whyInterested' && aiAnswers.why_company) {
            value = aiAnswers.why_company;
          } else if (mappedField === 'experience' && aiAnswers.experience) {
            value = aiAnswers.experience;
          } else if (mappedField === 'coverLetter' && aiAnswers.why_role) {
            value = aiAnswers.why_role;
          }
        }

        // Fall back to profile value
        if (!value) {
          value = getProfileValue(profile, mappedField);
        }

        if (!value) {
          continue;
        }

        // Handle different field types
        if (tagName === 'select') {
          const options = await field.$$('option');
          for (const option of options) {
            const optionText = (await option.textContent() || '').toLowerCase();
            const optionValue = (await option.getAttribute('value') || '').toLowerCase();
            if (optionText.includes(value.toLowerCase()) || optionValue.includes(value.toLowerCase())) {
              await field.selectOption({ label: await option.textContent() || '' });
              result.fieldsFilled++;
              result.filledFields.push({ field: mappedField, value });
              break;
            }
          }
        } else if (fieldType === 'file') {
          if (profile.resume_url && mappedField === 'resume') {
            result.errors.push('File upload requires local file path');
          }
        } else if (fieldType === 'checkbox') {
          if (mappedField === 'workAuthorization' && profile.work_authorized) {
            await field.check();
            result.fieldsFilled++;
            result.filledFields.push({ field: mappedField, value: 'checked' });
          }
        } else if (fieldType === 'radio') {
          const radioValue = await field.getAttribute('value') || '';
          if (value.toLowerCase() === radioValue.toLowerCase() ||
              (value.toLowerCase() === 'yes' && radioValue.toLowerCase() === 'yes')) {
            await field.check();
            result.fieldsFilled++;
            result.filledFields.push({ field: mappedField, value: radioValue });
          }
        } else {
          // Regular text input or textarea
          await field.click();
          await field.fill('');
          await field.type(value, { delay: 30 }); // Human-like typing
          result.fieldsFilled++;
          result.filledFields.push({ field: mappedField, value });
        }

        // Small random delay between fields
        await page.waitForTimeout(Math.random() * 300 + 100);

      } catch (fieldError) {
        result.errors.push(`Error filling field: ${fieldError}`);
      }
    }

    result.success = result.fieldsFilled > 0;

  } catch (error) {
    result.errors.push(`Form detection error: ${error}`);
  }

  return result;
}
