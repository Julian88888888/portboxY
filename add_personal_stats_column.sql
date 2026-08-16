-- Store personal/body stats on each profile (public /@username page).
-- Run in Supabase SQL Editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_model_stats BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_stats JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.show_model_stats IS 'Show Personal Stats (height, weight, bust, etc.) on this user public profile only';
COMMENT ON COLUMN profiles.personal_stats IS 'Owner body/personal measurement fields for public profile';
