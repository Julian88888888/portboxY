# Albums Feature - Setup Guide

## Problem: "relation images does not exist" (Error 42P01)

This error occurs because the database tables haven't been created yet. Follow these steps to set up the albums feature.

## Quick Fix

### Step 1: Check if tables exist

Run this query in Supabase SQL Editor to check:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name IN ('albums', 'images')
ORDER BY table_name;
```

If this returns no rows, the tables don't exist and you need to create them.

### Step 2: Create the tables

**Option A: Use the fixed schema file (Recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy and paste the entire contents of `albums_schema_fixed.sql`
4. Click "Run" or press Cmd/Ctrl + Enter

**Option B: Run the corrected schema directly**

Copy and paste this into Supabase SQL Editor:

```sql
-- Step 1: Create albums table (without foreign key to images first)
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Add foreign key constraint for cover_image_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'albums_cover_image_id_fkey'
    AND table_name = 'albums'
  ) THEN
    ALTER TABLE albums 
    ADD CONSTRAINT albums_cover_image_id_fkey 
    FOREIGN KEY (cover_image_id) 
    REFERENCES images(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_images_album_id ON images(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_cover_image_id ON albums(cover_image_id);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at DESC);

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_albums_updated_at ON albums;
CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to set cover image on first upload
CREATE OR REPLACE FUNCTION set_cover_image_on_first_upload()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM albums WHERE id = NEW.album_id AND cover_image_id IS NOT NULL
    ) THEN
        UPDATE albums 
        SET cover_image_id = NEW.id 
        WHERE id = NEW.album_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set cover on first image
DROP TRIGGER IF EXISTS trigger_set_cover_on_first_image ON images;
CREATE TRIGGER trigger_set_cover_on_first_image
    AFTER INSERT ON images
    FOR EACH ROW
    EXECUTE FUNCTION set_cover_image_on_first_upload();

-- Function to handle cover deletion
CREATE OR REPLACE FUNCTION handle_cover_image_deletion()
RETURNS TRIGGER AS $$
DECLARE
    next_image_id UUID;
BEGIN
    SELECT id INTO next_image_id
    FROM images
    WHERE album_id = OLD.album_id
      AND id != OLD.id
    ORDER BY created_at ASC
    LIMIT 1;
    
    UPDATE albums
    SET cover_image_id = next_image_id
    WHERE id = OLD.album_id;
    
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Trigger for cover deletion
DROP TRIGGER IF EXISTS trigger_handle_cover_deletion ON images;
CREATE TRIGGER trigger_handle_cover_deletion
    AFTER DELETE ON images
    FOR EACH ROW
    EXECUTE FUNCTION handle_cover_image_deletion();

-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage albums" ON albums;
DROP POLICY IF EXISTS "Allow authenticated users to manage images" ON images;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to manage albums"
    ON albums FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage images"
    ON images FOR ALL
    USING (true)
    WITH CHECK (true);
```

### Step 3: Verify tables were created

Run this query to confirm:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('albums', 'images')
ORDER BY table_name, ordinal_position;
```

You should see:
- `albums` table with columns: id, title, description, cover_image_id, created_at, updated_at
- `images` table with columns: id, album_id, url, created_at

### Step 4: Test the API

Once tables are created, test the API:

```bash
# Get all albums (should return empty array)
curl http://localhost:5002/api/albums

# Create an album
curl -X POST http://localhost:5002/api/albums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"title": "Test Album", "description": "Test"}'
```

## Why the error occurred

The original schema had a **circular dependency**:
- `albums` table tried to reference `images(id)` in the `cover_image_id` column
- `images` table references `albums(id)` in the `album_id` column

PostgreSQL can't create a table that references another table that doesn't exist yet.

## Solution

The fixed schema creates tables in the correct order:
1. Create `albums` table first (without the foreign key to images)
2. Create `images` table (with foreign key to albums)
3. Add the foreign key constraint to `albums.cover_image_id` using `ALTER TABLE`

## Troubleshooting

### If you still get errors:

1. **Check you're in the right database/branch**
   ```sql
   SELECT current_database();
   ```

2. **Check table schema**
   ```sql
   SELECT table_schema, table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('albums', 'images');
   ```
   
   If tables exist in a different schema (not `public`), qualify them:
   ```sql
   SELECT * FROM schema_name.albums;
   ```

3. **Drop and recreate (if needed)**
   ```sql
   -- WARNING: This deletes all data!
   DROP TABLE IF EXISTS images CASCADE;
   DROP TABLE IF EXISTS albums CASCADE;
   -- Then run the fixed schema again
   ```

4. **Check RLS policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('albums', 'images');
   ```

## Next Steps

After tables are created:
1. ✅ Backend API will work
2. ✅ Frontend can fetch and display albums
3. ✅ You can create albums and upload images

The albums will automatically appear in `ModelPage.js` once you create some albums via the API.

