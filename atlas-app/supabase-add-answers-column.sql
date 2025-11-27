-- Add application_answers column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS application_answers JSONB DEFAULT '{}';

-- Comment for clarity
COMMENT ON COLUMN profiles.application_answers IS 'Pre-filled answers for common application questions';
