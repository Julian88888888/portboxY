-- Display size (S / M / L) for portfolio album cards and album images.
-- Run in Supabase SQL Editor.

ALTER TABLE images
  ADD COLUMN IF NOT EXISTS display_size TEXT DEFAULT 'M';

ALTER TABLE albums
  ADD COLUMN IF NOT EXISTS card_size TEXT DEFAULT 'M';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'images_display_size_check'
  ) THEN
    ALTER TABLE images
      ADD CONSTRAINT images_display_size_check
      CHECK (display_size IS NULL OR display_size IN ('S', 'M', 'L'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'albums_card_size_check'
  ) THEN
    ALTER TABLE albums
      ADD CONSTRAINT albums_card_size_check
      CHECK (card_size IS NULL OR card_size IN ('S', 'M', 'L'));
  END IF;
END $$;

UPDATE images SET display_size = 'M' WHERE display_size IS NULL;
UPDATE albums SET card_size = 'M' WHERE card_size IS NULL;
