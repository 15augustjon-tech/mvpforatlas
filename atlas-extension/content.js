/**
 * ATLAS Auto-Fill Content Script
 * Detects and fills job application forms
 */

// Listen for fill command from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    const result = fillJobApplication(message.profile);
    sendResponse(result);
  }
  return true;
});

/**
 * Main function to fill job application forms
 */
function fillJobApplication(profile) {
  console.log('ATLAS: Starting auto-fill...');

  let filledCount = 0;

  // Field mappings: profile key -> possible selectors
  const fieldMappings = [
    {
      profileKey: 'firstName',
      selectors: [
        'input[name*="first" i]',
        'input[name*="fname" i]',
        'input[id*="first" i]',
        'input[autocomplete="given-name"]',
        'input[placeholder*="first name" i]',
        'input[aria-label*="first name" i]',
        // Greenhouse specific
        'input#first_name',
        'input[name="job_application[first_name]"]',
        // Lever specific
        'input[name="name"]', // Sometimes combined
        // Workday
        'input[data-automation-id*="firstName" i]',
      ],
      value: profile.firstName
    },
    {
      profileKey: 'lastName',
      selectors: [
        'input[name*="last" i]',
        'input[name*="lname" i]',
        'input[id*="last" i]',
        'input[autocomplete="family-name"]',
        'input[placeholder*="last name" i]',
        'input[aria-label*="last name" i]',
        // Greenhouse
        'input#last_name',
        'input[name="job_application[last_name]"]',
        // Workday
        'input[data-automation-id*="lastName" i]',
      ],
      value: profile.lastName
    },
    {
      profileKey: 'email',
      selectors: [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[autocomplete="email"]',
        'input[placeholder*="email" i]',
        // Greenhouse
        'input#email',
        'input[name="job_application[email]"]',
        // Workday
        'input[data-automation-id*="email" i]',
      ],
      value: profile.email
    },
    {
      profileKey: 'phone',
      selectors: [
        'input[type="tel"]',
        'input[name*="phone" i]',
        'input[name*="mobile" i]',
        'input[id*="phone" i]',
        'input[autocomplete="tel"]',
        'input[placeholder*="phone" i]',
        // Greenhouse
        'input#phone',
        'input[name="job_application[phone]"]',
        // Workday
        'input[data-automation-id*="phone" i]',
      ],
      value: profile.phone
    },
    {
      profileKey: 'linkedin',
      selectors: [
        'input[name*="linkedin" i]',
        'input[id*="linkedin" i]',
        'input[placeholder*="linkedin" i]',
        'input[aria-label*="linkedin" i]',
        // Generic social/URL fields that might be LinkedIn
        'input[name*="social" i]',
      ],
      value: profile.linkedin
    },
    {
      profileKey: 'university',
      selectors: [
        'input[name*="school" i]',
        'input[name*="university" i]',
        'input[name*="college" i]',
        'input[name*="institution" i]',
        'input[id*="school" i]',
        'input[id*="university" i]',
        'input[placeholder*="school" i]',
        'input[placeholder*="university" i]',
        'input[aria-label*="school" i]',
        'input[aria-label*="university" i]',
      ],
      value: profile.university
    },
    {
      profileKey: 'major',
      selectors: [
        'input[name*="major" i]',
        'input[name*="degree" i]',
        'input[name*="study" i]',
        'input[name*="field" i]',
        'input[id*="major" i]',
        'input[placeholder*="major" i]',
        'input[placeholder*="degree" i]',
        'input[aria-label*="major" i]',
      ],
      value: profile.major
    },
    {
      profileKey: 'gradYear',
      selectors: [
        'input[name*="graduation" i]',
        'input[name*="grad" i][name*="year" i]',
        'input[id*="graduation" i]',
        'input[placeholder*="graduation" i]',
        'input[placeholder*="grad year" i]',
        'input[aria-label*="graduation" i]',
        // Sometimes it's a select
        'select[name*="graduation" i]',
        'select[name*="year" i]',
      ],
      value: profile.gradYear
    },
    {
      profileKey: 'gpa',
      selectors: [
        'input[name*="gpa" i]',
        'input[id*="gpa" i]',
        'input[placeholder*="gpa" i]',
        'input[aria-label*="gpa" i]',
      ],
      value: profile.gpa
    },
  ];

  // Also try to fill full name if there's a combined name field
  if (profile.firstName && profile.lastName) {
    fieldMappings.push({
      profileKey: 'fullName',
      selectors: [
        'input[name="name"]',
        'input[name*="full" i][name*="name" i]',
        'input[id*="full" i][id*="name" i]',
        'input[placeholder*="full name" i]',
        'input[autocomplete="name"]',
        'input[aria-label*="full name" i]',
        // Lever uses this
        'input[name="cards[0]"]',
      ],
      value: `${profile.firstName} ${profile.lastName}`
    });
  }

  // Try to fill each field
  for (const field of fieldMappings) {
    if (!field.value) continue;

    for (const selector of field.selectors) {
      const filled = tryFillField(selector, field.value);
      if (filled) {
        filledCount++;
        console.log(`ATLAS: Filled ${field.profileKey}`);
        break; // Move to next field
      }
    }
  }

  // Also try label-based detection
  filledCount += fillByLabels(profile);

  console.log(`ATLAS: Filled ${filledCount} fields`);

  // Show visual feedback
  showFillNotification(filledCount);

  return { success: true, filledCount };
}

/**
 * Try to fill a field by selector
 */
function tryFillField(selector, value) {
  try {
    const elements = document.querySelectorAll(selector);

    for (const el of elements) {
      // Skip hidden or readonly fields
      if (el.offsetParent === null || el.readOnly || el.disabled) continue;

      // Skip already filled fields (unless empty)
      if (el.value && el.value.trim() !== '') continue;

      if (el.tagName === 'SELECT') {
        return fillSelect(el, value);
      } else {
        return fillInput(el, value);
      }
    }
  } catch (e) {
    console.log(`ATLAS: Selector error for ${selector}:`, e);
  }

  return false;
}

/**
 * Fill an input field and trigger events
 */
function fillInput(input, value) {
  // Set the value
  input.value = value;

  // Trigger events that React/Vue/Angular listen for
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));

  // For React specifically
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return true;
}

/**
 * Fill a select dropdown
 */
function fillSelect(select, value) {
  const options = select.options;
  const valueLower = value.toLowerCase();

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].text.toLowerCase();
    const optionValue = options[i].value.toLowerCase();

    if (optionText.includes(valueLower) || optionValue.includes(valueLower) ||
        valueLower.includes(optionText) || valueLower.includes(optionValue)) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }

  return false;
}

/**
 * Try to fill fields by finding associated labels
 */
function fillByLabels(profile) {
  let filled = 0;

  const labelMappings = [
    { labels: ['first name'], value: profile.firstName },
    { labels: ['last name', 'surname'], value: profile.lastName },
    { labels: ['email', 'e-mail'], value: profile.email },
    { labels: ['phone', 'mobile', 'telephone'], value: profile.phone },
    { labels: ['linkedin'], value: profile.linkedin },
    { labels: ['university', 'school', 'college', 'institution'], value: profile.university },
    { labels: ['major', 'field of study', 'degree'], value: profile.major },
    { labels: ['graduation', 'grad year'], value: profile.gradYear },
    { labels: ['gpa', 'grade point'], value: profile.gpa },
  ];

  const labels = document.querySelectorAll('label');

  for (const label of labels) {
    const labelText = label.textContent?.toLowerCase() || '';

    for (const mapping of labelMappings) {
      if (!mapping.value) continue;

      const matches = mapping.labels.some(l => labelText.includes(l));
      if (!matches) continue;

      // Find associated input
      let input = null;

      // Try 'for' attribute
      if (label.htmlFor) {
        input = document.getElementById(label.htmlFor);
      }

      // Try nested input
      if (!input) {
        input = label.querySelector('input, select, textarea');
      }

      // Try next sibling
      if (!input) {
        input = label.nextElementSibling;
        if (input && !['INPUT', 'SELECT', 'TEXTAREA'].includes(input.tagName)) {
          input = input.querySelector('input, select, textarea');
        }
      }

      if (input && !input.value) {
        if (input.tagName === 'SELECT') {
          if (fillSelect(input, mapping.value)) filled++;
        } else {
          if (fillInput(input, mapping.value)) filled++;
        }
      }
    }
  }

  return filled;
}

/**
 * Show a notification that fields were filled
 */
function showFillNotification(count) {
  // Remove existing notification if any
  const existing = document.getElementById('atlas-fill-notification');
  if (existing) existing.remove();

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'atlas-fill-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #14b8a6, #3b82f6);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: atlasSlideIn 0.3s ease;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>ATLAS filled ${count} field${count !== 1 ? 's' : ''}! Review and submit.</span>
    </div>
    <style>
      @keyframes atlasSlideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'atlasSlideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

console.log('ATLAS Auto-Fill extension loaded');
