# Fix: "Bucket not found" Error

## Problem
You're seeing "Bucket not found" error when trying to upload profile photos or headers.

## Cause
The storage buckets `profile-photos` and `profile-headers` don't exist in your Supabase project.

## Quick Fix (Recommended)

### Option 1: Use SQL Script (Fastest)

1. Go to Supabase Dashboard → SQL Editor
2. Open the file `create_storage_buckets.sql`
3. Copy and paste the entire SQL script
4. Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
5. You should see "Success. No rows returned" message

The script will:
- ✅ Create `profile-photos` bucket (public, 5MB limit)
- ✅ Create `profile-headers` bucket (public, 5MB limit)
- ✅ Create all necessary storage policies for upload/read/delete

### Option 2: Manual Setup via Dashboard

Follow the instructions in `CREATE_STORAGE_BUCKETS.md` for step-by-step manual setup.

## Verify Buckets Are Created

1. Go to Supabase Dashboard → Storage
2. You should see both buckets:
   - `profile-photos` ✅
   - `profile-headers` ✅
3. Both should be marked as **Public** (green badge)

## Test Upload

After running the SQL script:

1. **Refresh your application page** (F5)
2. Go to Profile Settings
3. Try uploading a profile photo
4. The "Bucket not found" error should be gone ✅

## What the Buckets Do

- **`profile-photos`**: Stores profile photos/logos (path: `{userId}/profile_photo/{filename}`)
- **`profile-headers`**: Stores header/banner photos (path: `{userId}/profile_header/{filename}`)

Both buckets:
- Are public (anyone can view images)
- Have 5MB file size limit
- Accept only image files (jpeg, jpg, png, webp)
- Only allow authenticated users to upload/delete their own files

## If Still Getting Errors

1. **Check bucket names**: They must be exactly `profile-photos` and `profile-headers` (lowercase, with hyphens)

2. **Verify in Dashboard**: 
   - Go to Storage
   - Confirm both buckets exist
   - Check they are marked as Public

3. **Check policies**:
   - Click on each bucket
   - Go to Policies tab
   - You should see 4 policies per bucket

4. **Check console errors**: Open browser DevTools (F12) for more details

5. **Try refreshing the page**: Sometimes cache issues can cause problems

## Troubleshooting

### Error: "permission denied for table storage.buckets"
- You need to run the SQL as a database admin or use the Supabase Dashboard UI to create buckets

### Error: "bucket already exists"
- The buckets already exist, which is fine
- Check that they are public and have correct policies

### Still getting "Bucket not found" after creating buckets
- Make sure bucket names are exactly `profile-photos` and `profile-headers` (case-sensitive)
- Check that you're connected to the correct Supabase project
- Verify your environment variables (`REACT_APP_SUPABASE_URL`) point to the correct project






