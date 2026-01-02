-- Fix portfolio_albums table to ensure tag column exists and has default values
-- This script is idempotent - can be run multiple times safely

-- Add tag column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'portfolio_albums' 
    AND column_name = 'tag'
  ) THEN
    ALTER TABLE portfolio_albums 
    ADD COLUMN tag TEXT NOT NULL DEFAULT 'Portfolio';
    
    -- Update existing records that might have NULL tag
    UPDATE portfolio_albums 
    SET tag = 'Portfolio' 
    WHERE tag IS NULL;
    
    RAISE NOTICE 'Tag column added to portfolio_albums table';
  ELSE
    RAISE NOTICE 'Tag column already exists';
  END IF;
END $$;

-- Update any existing records with NULL tag to have default 'Portfolio'
UPDATE portfolio_albums 
SET tag = 'Portfolio' 
WHERE tag IS NULL;

-- Verify the column exists and has data
SELECT 
  COUNT(*) as total_albums,
  COUNT(tag) as albums_with_tag,
  COUNT(CASE WHEN tag IS NULL THEN 1 END) as albums_without_tag
FROM portfolio_albums;







