-- Add missing columns to profiles table if they don't exist
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

-- Verify columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;






