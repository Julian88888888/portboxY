-- Add show_header_photo column to profiles table
-- This column is used in the frontend code for header photo visibility toggle

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'show_header_photo'
    ) THEN
        ALTER TABLE profiles ADD COLUMN show_header_photo BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added show_header_photo column';
    ELSE
        RAISE NOTICE 'show_header_photo column already exists';
    END IF;
END
$$;

-- Sync data: if show_profile_header has data but show_header_photo is NULL, copy it
UPDATE profiles 
SET show_header_photo = show_profile_header 
WHERE show_profile_header IS NOT NULL 
  AND (show_header_photo IS NULL OR show_header_photo != show_profile_header);

-- Create a trigger to keep both columns in sync on updates
CREATE OR REPLACE FUNCTION sync_show_header_photo()
RETURNS TRIGGER AS $$
BEGIN
    -- If show_header_photo is updated, sync to show_profile_header
    IF TG_OP = 'UPDATE' AND (NEW.show_header_photo IS DISTINCT FROM OLD.show_header_photo) THEN
        NEW.show_profile_header = NEW.show_header_photo;
    END IF;
    
    -- If show_profile_header is updated, sync to show_header_photo
    IF TG_OP = 'UPDATE' AND (NEW.show_profile_header IS DISTINCT FROM OLD.show_profile_header) THEN
        NEW.show_header_photo = NEW.show_profile_header;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_show_header_photo_trigger ON profiles;
CREATE TRIGGER sync_show_header_photo_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_show_header_photo();


