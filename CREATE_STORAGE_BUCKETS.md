# Fix: "Bucket not found" Error

## Problem
You're getting "Bucket not found" error when trying to upload profile photos.

## Solution
You need to create the storage buckets in Supabase Dashboard.

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar

### 2. Create `profile-photos` Bucket

1. Click **"New bucket"** button
2. Configure:
   - **Name**: `profile-photos` (exactly as shown, with hyphen)
   - **Public bucket**: ✅ **Enable this** (check the box)
   - **File size limit**: 5 MB (or leave default)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp` (optional, but recommended)
3. Click **"Create bucket"**

### 3. Create `profile-headers` Bucket

1. Click **"New bucket"** button again
2. Configure:
   - **Name**: `profile-headers` (exactly as shown, with hyphen)
   - **Public bucket**: ✅ **Enable this** (check the box)
   - **File size limit**: 5 MB (or leave default)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp` (optional, but recommended)
3. Click **"Create bucket"**

### 4. Set Up Storage Policies

After creating buckets, you need to set up policies so users can upload/delete their own files.

#### For `profile-photos` bucket:

1. Click on the `profile-photos` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"** or **"Custom policy"**

**Policy 1: Allow authenticated users to upload (INSERT)**
- **Policy name**: `Allow authenticated users to upload to own folder`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **WITH CHECK expression** (same):
  ```sql
  bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** then **"Save policy"**

**Policy 2: Allow public read access (SELECT)**
- Click **"New Policy"** again
- **Policy name**: `Allow public read access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
  ```sql
  bucket_id = 'profile-photos'
  ```
- Click **"Review"** then **"Save policy"**

**Policy 3: Allow users to delete own files (DELETE)**
- Click **"New Policy"** again
- **Policy name**: `Allow users to delete own files`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** then **"Save policy"**

#### For `profile-headers` bucket:

Repeat the same 3 policies for `profile-headers` bucket, but replace `'profile-photos'` with `'profile-headers'` in all SQL expressions.

**Policy 1 (INSERT)**:
```sql
bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 2 (SELECT)**:
```sql
bucket_id = 'profile-headers'
```

**Policy 3 (DELETE)**:
```sql
bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text
```

## Quick SQL Script (Alternative Method)

If you prefer SQL, you can run this in Supabase SQL Editor:

```sql
-- Create profile-photos bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880;

-- Create profile-headers bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-headers',
  'profile-headers',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880;
```

## Verify Buckets Are Created

1. Go to Storage in Supabase Dashboard
2. You should see both buckets:
   - `profile-photos`
   - `profile-headers`
3. Both should show as **Public** (green badge)

## Test Upload

After creating buckets and policies:

1. Refresh your application page
2. Go to Profile Settings
3. Try uploading a profile photo
4. The "Bucket not found" error should be gone

## If Still Getting Errors

1. **Double-check bucket names**: They must be exactly `profile-photos` and `profile-headers` (with hyphens, lowercase)

2. **Check bucket is public**: The buckets should be public if you want to use public URLs

3. **Verify policies**: Make sure all 3 policies are created for each bucket

4. **Check console errors**: Open browser DevTools (F12) and check for more detailed error messages

5. **Check Network tab**: Look for failed requests to see what error Supabase is returning

