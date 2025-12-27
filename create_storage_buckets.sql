-- Create Storage Buckets for Profile Settings
-- Run this script in Supabase SQL Editor

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true, 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create profile-headers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-headers',
  'profile-headers',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true, 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload to own folder profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own photos profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access profile-photos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload to own folder profile-headers" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own headers profile-headers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own headers profile-headers" ON storage.objects;
DROP POLICY IF EXISTS "Public read access profile-headers" ON storage.objects;

-- Create policies for profile-photos bucket

-- Policy 1: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder profile-photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read their own photos
CREATE POLICY "Users can read own photos profile-photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public read access (so profile photos can be viewed)
CREATE POLICY "Public read access profile-photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Policy 4: Allow users to delete their own photos
CREATE POLICY "Users can delete own photos profile-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policies for profile-headers bucket

-- Policy 1: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder profile-headers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-headers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read their own headers
CREATE POLICY "Users can read own headers profile-headers"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-headers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public read access (so header photos can be viewed)
CREATE POLICY "Public read access profile-headers"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-headers');

-- Policy 4: Allow users to delete their own headers
CREATE POLICY "Users can delete own headers profile-headers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-headers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);






