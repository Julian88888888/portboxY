# Fix: "Could not find the 'show_header_photo' column" Error

## Problem
Error: `Could not find the 'show_header_photo' column of 'profiles' in the schema cache`

## Root Cause
The database table uses `show_profile_header` but the code was trying to update `show_header_photo` which doesn't exist.

## Solution

### Option 1: Use Existing Column (Recommended)
The code has been updated to use `show_profile_header` which already exists in the database.

### Option 2: Add Missing Column
If you want to use `show_header_photo` instead, run the SQL script:

1. Go to **Supabase Dashboard → SQL Editor**
2. Run `add_show_header_photo_column.sql`
3. This will:
   - Add `show_header_photo` column
   - Sync data from `show_profile_header`
   - Create a trigger to keep both columns in sync

## Code Changes Made

Updated `ProfileSettings.js` to use `show_profile_header` instead of `show_header_photo`:

```javascript
// Before (causing error):
await updateProfile.mutateAsync({ 
  show_header_photo: newValue,
  show_profile_header: newValue 
});

// After (fixed):
await updateProfile.mutateAsync({ 
  show_profile_header: newValue 
});
```

## Testing

After the fix:

1. **Refresh the page** (F5)
2. Try toggling "Show Profile Header Photo"
3. It should work without errors ✅
4. Check that the toggle state persists after page reload

## Database Schema

The `profiles` table has:
- ✅ `show_profile_photo` (BOOLEAN)
- ✅ `show_profile_header` (BOOLEAN) - **This is the correct column name**
- ❌ `show_header_photo` (doesn't exist, unless you run the SQL script)

## If You Want Both Columns

If you prefer to have both `show_header_photo` and `show_profile_header` for compatibility:

1. Run `add_show_header_photo_column.sql` in Supabase SQL Editor
2. Both columns will be kept in sync automatically via trigger
3. Code can use either column name



