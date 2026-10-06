-- Run in Supabase SQL Editor.
-- Master toggle for the Portfolio albums block on public /@username.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_portfolio_section BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.show_portfolio_section IS 'Show the Portfolio albums section on the public profile';
