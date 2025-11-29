import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { detectAndFillForm, UserProfile, FillResult } from './formFiller';

export interface ApplyResult {
  success: boolean;
  jobUrl: string;
  status: 'filled' | 'submitted' | 'error' | 'captcha' | 'login_required';
  fillResult?: FillResult;
  screenshotPath?: string;
  error?: string;
  timestamp: Date;
}

export interface AutoApplyConfig {
  headless: boolean;
  slowMo: number;
  timeout: number;
  autoSubmit: boolean;
  screenshotOnComplete: boolean;
}

const DEFAULT_CONFIG: AutoApplyConfig = {
  headless: false,
  slowMo: 50,
  timeout: 30000,
  autoSubmit: false,
  screenshotOnComplete: true
};

interface PlatformHandler {
  match: (url: string) => boolean;
  navigate: (page: Page, url: string) => Promise<void>;
  findApplyButton: (page: Page) => Promise<void>;
  fillForm: (page: Page, profile: UserProfile, aiAnswers?: Record<string, string>) => Promise<FillResult>;
  submit: (page: Page) => Promise<void>;
}

// Greenhouse handler
const greenhouseHandler: PlatformHandler = {
  match: (url) => url.includes('greenhouse.io') || url.includes('boards.greenhouse'),

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  async findApplyButton(page) {
    const applyButton = await page.$('a[href*="apply"], button:has-text("Apply")');
    if (applyButton) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
    }
  },

  async fillForm(page, profile, aiAnswers) {
    return detectAndFillForm(page, profile, aiAnswers);
  },

  async submit(page) {
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit")');
    if (submitButton) {
      await submitButton.click();
    }
  }
};

// Lever handler
const leverHandler: PlatformHandler = {
  match: (url) => url.includes('lever.co') || url.includes('jobs.lever'),

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  async findApplyButton(page) {
    const applyButton = await page.$('.posting-btn-submit, a[href*="apply"], button:has-text("Apply")');
    if (applyButton) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
    }
  },

  async fillForm(page, profile, aiAnswers) {
    return detectAndFillForm(page, profile, aiAnswers);
  },

  async submit(page) {
    const submitButton = await page.$('button[type="submit"]:has-text("Submit"), button.postings-btn');
    if (submitButton) {
      await submitButton.click();
    }
  }
};

// Workday handler
const workdayHandler: PlatformHandler = {
  match: (url) => url.includes('myworkday') || url.includes('workday.com'),

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  },

  async findApplyButton(page) {
    const applyButton = await page.$('button[data-automation-id="jobApplyButton"], button:has-text("Apply")');
    if (applyButton) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  },

  async fillForm(page, profile, aiAnswers) {
    return detectAndFillForm(page, profile, aiAnswers);
  },

  async submit(page) {
    const submitButton = await page.$('button[data-automation-id="bottom-navigation-next-button"]');
    if (submitButton) {
      await submitButton.click();
    }
  }
};

// Ashby handler
const ashbyHandler: PlatformHandler = {
  match: (url) => url.includes('ashbyhq.com'),

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  async findApplyButton(page) {
    const applyButton = await page.$('button:has-text("Apply"), a:has-text("Apply")');
    if (applyButton) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
    }
  },

  async fillForm(page, profile, aiAnswers) {
    return detectAndFillForm(page, profile, aiAnswers);
  },

  async submit(page) {
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
    }
  }
};

// LinkedIn Easy Apply handler
const linkedInHandler: PlatformHandler = {
  match: (url) => url.includes('linkedin.com'),

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  async findApplyButton(page) {
    const easyApply = await page.$('button.jobs-apply-button, button:has-text("Easy Apply")');
    if (easyApply) {
      await easyApply.click();
      await page.waitForTimeout(1500);
    }
  },

  async fillForm(page, profile, aiAnswers) {
    let totalFilled = 0;
    let totalFields = 0;
    const allErrors: string[] = [];
    const allFilledFields: { field: string; value: string }[] = [];

    for (let step = 0; step < 5; step++) {
      const result = await detectAndFillForm(page, profile, aiAnswers);
      totalFilled += result.fieldsFilled;
      totalFields += result.fieldsTotal;
      allErrors.push(...result.errors);
      allFilledFields.push(...result.filledFields);

      const nextButton = await page.$('button[aria-label="Continue to next step"], button:has-text("Next")');
      if (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }

    return {
      success: totalFilled > 0,
      fieldsFilled: totalFilled,
      fieldsTotal: totalFields,
      errors: allErrors,
      filledFields: allFilledFields
    };
  },

  async submit(page) {
    const submitButton = await page.$('button[aria-label="Submit application"], button:has-text("Submit")');
    if (submitButton) {
      await submitButton.click();
    }
  }
};

// Generic handler for unknown sites
const genericHandler: PlatformHandler = {
  match: () => true,

  async navigate(page, url) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  async findApplyButton(page) {
    const applyButtons = [
      'button:has-text("Apply")',
      'a:has-text("Apply")',
      'button:has-text("Submit Application")',
      'a:has-text("Submit Application")',
      '[class*="apply"]',
      '[id*="apply"]'
    ];

    for (const selector of applyButtons) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForLoadState('networkidle');
        break;
      }
    }
  },

  async fillForm(page, profile, aiAnswers) {
    return detectAndFillForm(page, profile, aiAnswers);
  },

  async submit(page) {
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Apply")',
      'button:has-text("Send")'
    ];

    for (const selector of submitSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        break;
      }
    }
  }
};

const PLATFORM_HANDLERS = [
  linkedInHandler,
  greenhouseHandler,
  leverHandler,
  workdayHandler,
  ashbyHandler,
  genericHandler
];

function getHandler(url: string): PlatformHandler {
  for (const handler of PLATFORM_HANDLERS) {
    if (handler.match(url)) {
      return handler;
    }
  }
  return genericHandler;
}

export class AutoApplyEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: AutoApplyConfig;

  constructor(config: Partial<AutoApplyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  async applyToJob(
    jobUrl: string,
    profile: UserProfile,
    aiAnswers?: Record<string, string>
  ): Promise<ApplyResult> {
    if (!this.context) {
      await this.initialize();
    }

    const page = await this.context!.newPage();
    const handler = getHandler(jobUrl);

    const result: ApplyResult = {
      success: false,
      jobUrl,
      status: 'error',
      timestamp: new Date()
    };

    try {
      await handler.navigate(page, jobUrl);

      const loginRequired = await page.$('input[type="password"], [class*="login"], [class*="signin"]');
      if (loginRequired) {
        result.status = 'login_required';
        result.error = 'Login required to apply';
        return result;
      }

      const captcha = await page.$('[class*="captcha"], [class*="recaptcha"], iframe[src*="captcha"]');
      if (captcha) {
        result.status = 'captcha';
        result.error = 'CAPTCHA detected';
        return result;
      }

      await handler.findApplyButton(page);

      const fillResult = await handler.fillForm(page, profile, aiAnswers);
      result.fillResult = fillResult;

      if (fillResult.success) {
        result.status = 'filled';

        if (this.config.autoSubmit) {
          await handler.submit(page);
          result.status = 'submitted';
        }

        result.success = true;
      }

      if (this.config.screenshotOnComplete) {
        await page.screenshot();
        result.screenshotPath = `screenshot_${Date.now()}.png`;
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.status = 'error';
    } finally {
      await page.close();
    }

    return result;
  }

  async applyToMultipleJobs(
    jobs: { url: string; aiAnswers?: Record<string, string> }[],
    profile: UserProfile,
    onProgress?: (completed: number, total: number, result: ApplyResult) => void
  ): Promise<ApplyResult[]> {
    const results: ApplyResult[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      if (i > 0) {
        const delay = Math.random() * 60000 + 30000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await this.applyToJob(job.url, profile, job.aiAnswers);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, jobs.length, result);
      }
    }

    return results;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}

let engineInstance: AutoApplyEngine | null = null;

export function getAutoApplyEngine(config?: Partial<AutoApplyConfig>): AutoApplyEngine {
  if (!engineInstance) {
    engineInstance = new AutoApplyEngine(config);
  }
  return engineInstance;
}
