-- Run in Supabase SQL Editor.
-- Owner-only Portfolio album card size on the public profile (S / M / L).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS portfolio_display_size TEXT NOT NULL DEFAULT 'M';

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_portfolio_display_size_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_portfolio_display_size_check
  CHECK (portfolio_display_size IN ('S', 'M', 'L'));

COMMENT ON COLUMN profiles.portfolio_display_size IS
  'Portfolio album card size on public page (S/M/L). Only profile owner can change.';
