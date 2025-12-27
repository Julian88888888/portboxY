-- Add header_photo_path column to profiles table
-- This column is used in the frontend code for header photos

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'header_photo_path'
    ) THEN
        ALTER TABLE profiles ADD COLUMN header_photo_path TEXT;
        RAISE NOTICE 'Added header_photo_path column';
    ELSE
        RAISE NOTICE 'header_photo_path column already exists';
    END IF;
END
$$;

-- Also ensure profile_header_path exists (for compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_header_path'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_header_path TEXT;
        RAISE NOTICE 'Added profile_header_path column';
    ELSE
        RAISE NOTICE 'profile_header_path column already exists';
    END IF;
END
$$;

-- Sync data: if profile_header_path has data but header_photo_path is NULL, copy it
UPDATE profiles 
SET header_photo_path = profile_header_path 
WHERE profile_header_path IS NOT NULL 
  AND header_photo_path IS NULL;

-- Also sync in reverse: if header_photo_path has data but profile_header_path is NULL, copy it
UPDATE profiles 
SET profile_header_path = header_photo_path 
WHERE header_photo_path IS NOT NULL 
  AND profile_header_path IS NULL;

-- Create a trigger to keep both columns in sync on updates
CREATE OR REPLACE FUNCTION sync_header_photo_paths()
RETURNS TRIGGER AS $$
BEGIN
    -- If header_photo_path is updated, sync to profile_header_path
    IF TG_OP = 'UPDATE' AND (NEW.header_photo_path IS DISTINCT FROM OLD.header_photo_path) THEN
        NEW.profile_header_path = NEW.header_photo_path;
    END IF;
    
    -- If profile_header_path is updated, sync to header_photo_path
    IF TG_OP = 'UPDATE' AND (NEW.profile_header_path IS DISTINCT FROM OLD.profile_header_path) THEN
        NEW.header_photo_path = NEW.profile_header_path;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_header_photo_paths_trigger ON profiles;
CREATE TRIGGER sync_header_photo_paths_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_header_photo_paths();






