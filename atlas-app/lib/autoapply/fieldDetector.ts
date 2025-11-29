// Detects and maps form fields on any job application page

export interface DetectedField {
  element: string; // CSS selector
  fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'file' | 'radio' | 'checkbox';
  mappedTo: string | null; // Which user profile field this maps to
  label: string;
  required: boolean;
}

// Common field patterns across job sites
export const FIELD_PATTERNS: Record<string, string[]> = {
  firstName: [
    'first_name', 'firstname', 'fname', 'first-name', 'given_name', 'givenname',
    'name_first', 'applicant_first_name', 'candidate_first_name'
  ],
  lastName: [
    'last_name', 'lastname', 'lname', 'last-name', 'surname', 'family_name',
    'familyname', 'name_last', 'applicant_last_name', 'candidate_last_name'
  ],
  fullName: [
    'full_name', 'fullname', 'name', 'candidate_name', 'applicant_name', 'your_name'
  ],
  email: [
    'email', 'e-mail', 'emailaddress', 'email_address', 'candidate_email',
    'applicant_email', 'contact_email', 'your_email'
  ],
  phone: [
    'phone', 'telephone', 'tel', 'mobile', 'phone_number', 'phonenumber',
    'cell', 'cellphone', 'contact_phone', 'your_phone'
  ],
  linkedin: [
    'linkedin', 'linkedin_url', 'linkedinurl', 'linkedin_profile',
    'social_linkedin', 'profile_linkedin'
  ],
  github: [
    'github', 'github_url', 'githuburl', 'github_profile'
  ],
  portfolio: [
    'portfolio', 'portfolio_url', 'website', 'personal_website', 'your_website'
  ],
  university: [
    'university', 'school', 'college', 'institution', 'education_school',
    'alma_mater', 'school_name', 'university_name'
  ],
  major: [
    'major', 'field_of_study', 'degree', 'concentration', 'study_field',
    'area_of_study', 'specialization'
  ],
  graduationYear: [
    'graduation', 'grad_year', 'graduation_year', 'expected_graduation',
    'graduation_date', 'year_of_graduation'
  ],
  gpa: [
    'gpa', 'grade_point', 'cumulative_gpa', 'academic_gpa'
  ],
  location: [
    'location', 'city', 'address', 'current_location', 'your_location'
  ],
  resume: [
    'resume', 'cv', 'resume_upload', 'upload_resume', 'attach_resume',
    'resume_file', 'cv_upload'
  ],
  coverLetter: [
    'cover_letter', 'coverletter', 'cover', 'letter', 'motivation_letter'
  ],
  workAuthorization: [
    'work_auth', 'authorization', 'work_authorization', 'legally_authorized',
    'sponsorship', 'visa', 'right_to_work'
  ],
  startDate: [
    'start_date', 'availability', 'available_date', 'earliest_start',
    'when_can_you_start'
  ],
  salary: [
    'salary', 'compensation', 'salary_expectation', 'expected_salary',
    'desired_salary', 'pay_expectation'
  ],
  whyInterested: [
    'why_interested', 'interest', 'motivation', 'why_apply', 'why_company',
    'why_role', 'cover_letter_text', 'about_yourself', 'tell_us'
  ],
  experience: [
    'experience', 'relevant_experience', 'work_experience', 'background',
    'qualifications', 'skills_experience'
  ]
};

// Label text patterns (for when field names aren't helpful)
export const LABEL_PATTERNS: Record<string, RegExp> = {
  firstName: /first\s*name|given\s*name|nombre/i,
  lastName: /last\s*name|family\s*name|surname|apellido/i,
  fullName: /full\s*name|your\s*name|name\s*$/i,
  email: /e-?mail|correo/i,
  phone: /phone|telephone|mobile|cell|tel[eé]fono/i,
  linkedin: /linkedin/i,
  github: /github/i,
  portfolio: /portfolio|website|personal\s*site/i,
  university: /university|school|college|institution|education/i,
  major: /major|field\s*of\s*study|degree|concentration/i,
  graduationYear: /graduat|expected.*year|year.*graduat/i,
  gpa: /gpa|grade\s*point/i,
  location: /location|city|where.*located|address/i,
  resume: /resume|cv|upload.*resume/i,
  coverLetter: /cover\s*letter|motivation/i,
  workAuthorization: /authorized.*work|work.*authorization|sponsorship|visa|legally.*authorized/i,
  startDate: /start\s*date|when.*start|availab|earliest/i,
  salary: /salary|compensation|pay.*expect/i,
  whyInterested: /why.*interest|why.*apply|why.*company|why.*role|tell.*about|motivation/i,
  experience: /experience|background|qualif/i
};

export function matchFieldToProfile(
  fieldName: string,
  fieldId: string,
  labelText: string,
  placeholder: string
): string | null {
  const searchTexts = [
    fieldName.toLowerCase(),
    fieldId.toLowerCase(),
    labelText.toLowerCase(),
    placeholder.toLowerCase()
  ].join(' ');

  // Check against field patterns
  for (const [profileField, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (searchTexts.includes(pattern.toLowerCase())) {
        return profileField;
      }
    }
  }

  // Check against label patterns
  for (const [profileField, regex] of Object.entries(LABEL_PATTERNS)) {
    if (regex.test(searchTexts)) {
      return profileField;
    }
  }

  return null;
}
