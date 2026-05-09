-- Book Me: master + per-section visibility on public model page (profiles table)
-- Run in Supabase SQL Editor if these columns are missing.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_book_me_button BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_book_me_profile_section BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_book_me_portfolio BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_book_me_links_section BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_book_me_custom_links_section BOOLEAN NOT NULL DEFAULT true;
