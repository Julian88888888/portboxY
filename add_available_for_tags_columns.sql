-- Run in Supabase SQL Editor: tags shown above Book Me on public profile (@username)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS available_for_tags JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_available_for BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.available_for_tags IS 'Array of string ids: photoshoots, acting, runway, promo';
COMMENT ON COLUMN profiles.show_available_for IS 'When false, hide Available For pills on public profile';
