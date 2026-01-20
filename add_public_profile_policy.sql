-- Add public read access policy for profiles by username
-- This allows anyone to read profiles by username for public profile pages

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view profiles by username" ON profiles;

-- Create policy: Allow public (anonymous) users to read profiles where username is not null
-- This enables public profile pages at /model/:username
CREATE POLICY "Public can view profiles by username"
  ON profiles
  FOR SELECT
  TO public
  USING (username IS NOT NULL);

-- Create index on username for faster lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;
