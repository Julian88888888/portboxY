-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Model', 'Photographer', 'WardrobeStylist', 'HairStylist', 'MakeupArtist', 'Brand', 'Agency')),
  description TEXT,
  profile_photo_path TEXT,
  header_photo_path TEXT,
  show_profile_photo BOOLEAN DEFAULT true,
  show_header_photo BOOLEAN DEFAULT true,
  show_description BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trigger to update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- SELECT: user can select only own row
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: user can insert only own row
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: user can update only own row
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: user can delete only own row (optional, if needed)
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

