-- Custom Links Feature - Database Schema
-- This schema implements custom_links table for storing user's custom links

-- Create custom_links table
CREATE TABLE IF NOT EXISTS custom_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_custom_links_user_id ON custom_links(user_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_custom_links_display_order ON custom_links(user_id, display_order);

-- Drop trigger first (it depends on the function)
DROP TRIGGER IF EXISTS update_custom_links_updated_at ON custom_links;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_links_updated_at
    BEFORE UPDATE ON custom_links
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_links_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Users can view their own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can insert their own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can update their own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can delete their own custom links" ON custom_links;

-- Policy: Users can view their own links
CREATE POLICY "Users can view their own custom links"
    ON custom_links
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own links
CREATE POLICY "Users can insert their own custom links"
    ON custom_links
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update their own custom links"
    ON custom_links
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete their own custom links"
    ON custom_links
    FOR DELETE
    USING (auth.uid() = user_id);

