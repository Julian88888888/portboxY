-- Add all missing columns to profiles table
-- This script is idempotent - can be run multiple times safely

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN username TEXT UNIQUE;
    
    RAISE NOTICE 'Username column added to profiles table';
  ELSE
    RAISE NOTICE 'Username column already exists';
  END IF;
END $$;

-- Add display_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN display_name TEXT;
    
    RAISE NOTICE 'Display name column added to profiles table';
  ELSE
    RAISE NOTICE 'Display name column already exists';
  END IF;
END $$;

-- Add job_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'job_type'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN job_type TEXT CHECK (job_type IN ('Model', 'Photographer', 'WardrobeStylist', 'HairStylist', 'MakeupArtist', 'Brand', 'Agency'));
    
    RAISE NOTICE 'Job type column added to profiles table';
  ELSE
    RAISE NOTICE 'Job type column already exists';
  END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN description TEXT;
    
    RAISE NOTICE 'Description column added to profiles table';
  ELSE
    RAISE NOTICE 'Description column already exists';
  END IF;
END $$;

-- Add show_description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'show_description'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN show_description BOOLEAN DEFAULT true;
    
    RAISE NOTICE 'Show description column added to profiles table';
  ELSE
    RAISE NOTICE 'Show description column already exists';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    
    RAISE NOTICE 'Updated_at column added to profiles table';
  ELSE
    RAISE NOTICE 'Updated_at column already exists';
  END IF;
END $$;

-- Create unique index on username if it doesn't exist and username column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'profiles' 
    AND indexname = 'profiles_username_key'
  ) THEN
    CREATE UNIQUE INDEX profiles_username_key ON profiles(username) WHERE username IS NOT NULL;
    
    RAISE NOTICE 'Unique index on username created';
  ELSE
    RAISE NOTICE 'Unique index on username already exists or username column missing';
  END IF;
END $$;

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (if it doesn't exist)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify all columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
