# Fix: Database error: column profiles.username does not exist

## Problem
Error: "Database error: column profiles.username does not exist"

This happens when the `profiles` table was created using `supabase_profiles_setup.sql` which doesn't include the `username` column, but the application code expects it.

## Solution

### Option 1: Run Migration Script (Recommended)

Execute the SQL script `add_username_column.sql` in Supabase SQL Editor:

```sql
-- This will add all missing columns safely
-- File: add_username_column.sql
```

This script will:
- ✅ Add `username` column (TEXT, UNIQUE)
- ✅ Add `display_name` column (TEXT)
- ✅ Add `job_type` column (TEXT with CHECK constraint)
- ✅ Add `description` column (TEXT)
- ✅ Add `show_description` column (BOOLEAN)
- ✅ Create unique index on username
- ✅ Check if columns exist before adding (idempotent)

### Option 2: Manual SQL

If you prefer to run SQL manually:

```sql
-- Add username column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add display_name column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add job_type column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS job_type TEXT 
CHECK (job_type IN ('Model', 'Photographer', 'WardrobeStylist', 'HairStylist', 'MakeupArtist', 'Brand', 'Agency'));

-- Add description column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add show_description column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;
```

### Option 3: Update Existing Table Script

The `supabase_profiles_setup.sql` has been updated to include all columns. If you're creating a new table, use the updated script.

## Verify

After running the migration, verify columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

You should see:
- `id` (UUID)
- `username` (TEXT) ✅
- `display_name` (TEXT) ✅
- `job_type` (TEXT) ✅
- `description` (TEXT) ✅
- `profile_photo_path` (TEXT)
- `profile_header_path` (TEXT)
- `show_profile_photo` (BOOLEAN)
- `show_profile_header` (BOOLEAN)
- `show_description` (BOOLEAN) ✅
- `updated_at` (TIMESTAMPTZ)

## Notes

- The `username` column is UNIQUE but nullable (users can create profile without username initially)
- The migration script is idempotent - safe to run multiple times
- Existing data won't be affected
- New columns will have NULL values for existing rows

## After Migration

1. Restart your application
2. Try creating/updating a profile
3. The error should be gone!







