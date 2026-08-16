-- Isolate personal/profile stats visibility per user (public /@username page).
-- Run in Supabase SQL Editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_model_stats BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_profile_stats BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.show_model_stats IS 'Show Personal Stats (height, weight, etc.) on public profile';
COMMENT ON COLUMN profiles.show_profile_stats IS 'Show Profile Stats (industry, status, markets, niche) on public profile';
