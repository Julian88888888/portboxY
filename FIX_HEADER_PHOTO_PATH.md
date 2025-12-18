# Fix: "Could not find the 'header_photo_path' column" Error

## Problem
You're getting error: "Could not find the 'header_photo_path' column of 'profiles' in the schema cache"

This means the `header_photo_path` column doesn't exist in your `profiles` table.

## Root Cause
The code uses `header_photo_path` but the database table might have `profile_header_path` instead, or the column is missing entirely.

## Solution

### Quick Fix: Run SQL Script

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file `add_header_photo_path_column.sql`
3. Copy and paste the entire SQL script
4. Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
5. You should see success messages

The script will:
- ✅ Add `header_photo_path` column if it doesn't exist
- ✅ Add `profile_header_path` column if it doesn't exist (for compatibility)
- ✅ Sync data between both columns if needed
- ✅ Create a trigger to keep both columns in sync on future updates

### What the Script Does

1. **Adds missing columns**: Both `header_photo_path` and `profile_header_path` (for compatibility)
2. **Syncs existing data**: If one column has data and the other is NULL, it copies the data
3. **Creates sync trigger**: Keeps both columns synchronized automatically on updates

## Verify Column Exists

After running the script, verify:

1. Go to **Supabase Dashboard → Table Editor**
2. Select **`profiles`** table
3. Check columns - you should see:
   - `header_photo_path` ✅
   - `profile_header_path` ✅ (for compatibility)

## Test Upload

After running the SQL script:

1. **Refresh your application page** (F5)
2. Go to Profile Settings
3. Try uploading a header photo
4. The "Could not find the 'header_photo_path' column" error should be gone ✅

## Column Names Used in Code

The codebase uses:
- **`header_photo_path`** - used in `ProfileSettings.js` (main component)
- **`profile_header_path`** - used in TypeScript files and backend

Both columns are now supported and kept in sync automatically.

## If Still Getting Errors

1. **Check column exists**: 
   - Go to Table Editor → profiles
   - Verify `header_photo_path` column is there

2. **Clear cache**: 
   - Refresh the page (F5)
   - Or restart your development server

3. **Check console errors**: 
   - Open browser DevTools (F12)
   - Look for more detailed error messages

4. **Verify RLS policies**: 
   - Make sure RLS policies allow SELECT/UPDATE on profiles table

## Alternative: Use Single Column Name

If you want to use only one column name, you can:

**Option A**: Use `header_photo_path` everywhere (recommended for new projects)
- Update `ProfileSettings.tsx` and `profileApi.ts` to use `header_photo_path`
- Update backend to use `header_photo_path`

**Option B**: Use `profile_header_path` everywhere
- Update `ProfileSettings.js` to use `profile_header_path`

The current solution (keeping both columns in sync) is the safest for existing projects.


