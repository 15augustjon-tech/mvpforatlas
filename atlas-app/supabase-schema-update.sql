-- ATLAS Resume Schema Update
-- Run this in Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minor TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_month TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relevant_coursework TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS frameworks TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tools TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_locations TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spoken_languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_authorization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Done!
SELECT 'Schema updated successfully!' as status;
