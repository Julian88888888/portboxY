-- Isolate My Links / social links visibility per user (public /@username page).
-- Required for logged-out visitors — auth metadata alone is not enough.
-- Run in Supabase SQL Editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_custom_links_title BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_social_links BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.show_custom_links_title IS 'Show My Links (custom links) section on public profile (incl. logged-out)';
COMMENT ON COLUMN profiles.show_social_links IS 'Show social icon row on public profile (incl. logged-out)';
