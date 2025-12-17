-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  job_type TEXT CHECK (job_type IN ('Model', 'Photographer', 'WardrobeStylist', 'HairStylist', 'MakeupArtist', 'Brand', 'Agency')),
  description TEXT,
  profile_photo_path TEXT,
  profile_header_path TEXT,
  show_profile_photo BOOLEAN NOT NULL DEFAULT true,
  show_profile_header BOOLEAN NOT NULL DEFAULT true,
  show_description BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Policy: Users can select their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create storage buckets if they don't exist (run these in Supabase dashboard Storage section)
-- Note: These need to be created via Supabase dashboard or API, not SQL
-- Bucket names: profile-photos, profile-headers

-- Storage policies for profile-photos bucket
-- Note: Run these in Supabase dashboard under Storage > profile-photos > Policies

-- Policy: Users can upload to their own folder in profile-photos
-- Name: "Users can upload to own folder"
-- Type: INSERT
-- Policy definition: (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy: Users can read from their own folder in profile-photos
-- Name: "Users can read own photos"
-- Type: SELECT
-- Policy definition: (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy: Users can delete from their own folder in profile-photos
-- Name: "Users can delete own photos"
-- Type: DELETE
-- Policy definition: (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Storage policies for profile-headers bucket
-- Note: Run these in Supabase dashboard under Storage > profile-headers > Policies

-- Policy: Users can upload to their own folder in profile-headers
-- Name: "Users can upload to own folder"
-- Type: INSERT
-- Policy definition: (bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy: Users can read from their own folder in profile-headers
-- Name: "Users can read own headers"
-- Type: SELECT
-- Policy definition: (bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy: Users can delete from their own folder in profile-headers
-- Name: "Users can delete own headers"
-- Type: DELETE
-- Policy definition: (bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)

