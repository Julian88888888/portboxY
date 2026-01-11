-- Image Albums Feature - Database Schema (FIXED VERSION)
-- This schema implements albums and images tables with proper relationships
-- FIXED: Resolves circular dependency by creating tables in correct order

-- Step 1: Create albums table WITHOUT foreign key to images (to avoid circular dependency)
-- Stores album metadata (title, description, cover image reference)
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_id UUID, -- Will add foreign key constraint after images table exists
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Create images table with foreign key to albums
-- Stores image metadata and URLs
-- Each image belongs to exactly one album
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Add foreign key constraint for cover_image_id after images table exists
-- This ensures the images table exists before we reference it
DO $$ 
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'albums_cover_image_id_fkey'
    AND table_name = 'albums'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE albums 
    ADD CONSTRAINT albums_cover_image_id_fkey 
    FOREIGN KEY (cover_image_id) 
    REFERENCES images(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_images_album_id ON images(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_cover_image_id ON albums(cover_image_id);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on albums
DROP TRIGGER IF EXISTS update_albums_updated_at ON albums;
CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set cover image when first image is added
-- If album has no cover, set the first uploaded image as cover
CREATE OR REPLACE FUNCTION set_cover_image_on_first_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if album has no cover image
    IF NOT EXISTS (
        SELECT 1 FROM albums WHERE id = NEW.album_id AND cover_image_id IS NOT NULL
    ) THEN
        -- Set this image as cover
        UPDATE albums 
        SET cover_image_id = NEW.id 
        WHERE id = NEW.album_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set cover image when first image is added
DROP TRIGGER IF EXISTS trigger_set_cover_on_first_image ON images;
CREATE TRIGGER trigger_set_cover_on_first_image
    AFTER INSERT ON images
    FOR EACH ROW
    EXECUTE FUNCTION set_cover_image_on_first_upload();

-- Function to handle cover image deletion
-- When cover image is deleted, choose next image as cover
CREATE OR REPLACE FUNCTION handle_cover_image_deletion()
RETURNS TRIGGER AS $$
DECLARE
    next_image_id UUID;
BEGIN
    -- Find the next image in the same album (by creation date)
    SELECT id INTO next_image_id
    FROM images
    WHERE album_id = OLD.album_id
      AND id != OLD.id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Update album cover to next image (or NULL if no more images)
    UPDATE albums
    SET cover_image_id = next_image_id
    WHERE id = OLD.album_id;
    
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Trigger to handle cover image deletion
DROP TRIGGER IF EXISTS trigger_handle_cover_deletion ON images;
CREATE TRIGGER trigger_handle_cover_deletion
    AFTER DELETE ON images
    FOR EACH ROW
    EXECUTE FUNCTION handle_cover_image_deletion();

-- Row Level Security (RLS) policies
-- Enable RLS on both tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to manage albums" ON albums;
DROP POLICY IF EXISTS "Allow authenticated users to manage images" ON images;

-- Policy: Allow all operations for authenticated users
-- (Adjust these policies based on your authentication requirements)
CREATE POLICY "Allow authenticated users to manage albums"
    ON albums FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage images"
    ON images FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Add user_id column if you want to associate albums with users
-- Uncomment if needed:
-- ALTER TABLE albums ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
-- 
-- Then update RLS policies:
-- DROP POLICY IF EXISTS "Allow authenticated users to manage albums" ON albums;
-- CREATE POLICY "Users can manage their own albums"
--     ON albums FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);




