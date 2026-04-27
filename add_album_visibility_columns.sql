-- Run in Supabase SQL Editor.
-- Stores Portfolio visibility toggles in profiles (used by public /@username page).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_album_badge BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_album_title BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_album_description BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.show_album_badge IS 'Show album badge/tag in portfolio grid';
COMMENT ON COLUMN profiles.show_album_title IS 'Show album title in portfolio grid';
COMMENT ON COLUMN profiles.show_album_description IS 'Show album description in portfolio grid';
