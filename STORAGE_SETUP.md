# Supabase Storage Setup for Profiles

This guide explains how to set up Supabase Storage buckets for profile photos (avatars and headers).

## Step 1: Create Storage Buckets

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** or **"Create a new bucket"**

### Create `avatars` bucket:
- **Name**: `avatars` (exactly as shown)
- **Public bucket**: ✅ Enable (check this box)
- Click **"Create bucket"**

### Create `headers` bucket:
- **Name**: `headers` (exactly as shown)
- **Public bucket**: ✅ Enable (check this box)
- Click **"Create bucket"**

## Step 2: Set Up Storage Policies

For each bucket (`avatars` and `headers`), you need to create 3 policies:

### Policy 1: Allow authenticated users to upload to own folder (INSERT)

1. Go to the bucket (e.g., `avatars`)
2. Click on **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"** or **"Custom policy"**
5. Configure:
   - **Policy name**: `Allow authenticated users to upload to own folder`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition** (USING expression):
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
   - **WITH CHECK expression** (same):
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
6. Click **"Review"** then **"Save policy"**

**Note**: For `headers` bucket, replace `'avatars'` with `'headers'` in the expressions.

### Policy 2: Allow public read access (SELECT)

1. Click **"New Policy"** again
2. Configure:
   - **Policy name**: `Allow public read access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition** (USING expression):
     ```sql
     bucket_id = 'avatars'
     ```
3. Click **"Review"** then **"Save policy"**

**Note**: For `headers` bucket, replace `'avatars'` with `'headers'`.

### Policy 3: Allow users to delete own files (DELETE)

1. Click **"New Policy"** again
2. Configure:
   - **Policy name**: `Allow users to delete own files`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition** (USING expression):
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
3. Click **"Review"** then **"Save policy"**

**Note**: For `headers` bucket, replace `'avatars'` with `'headers'`.

## Step 3: Alternative - Using SQL Editor

If you prefer using SQL, you can run these commands in the SQL Editor:

### For `avatars` bucket:

```sql
-- INSERT policy
CREATE POLICY "Allow authenticated users to upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT policy
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- DELETE policy
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### For `headers` bucket:

```sql
-- INSERT policy
CREATE POLICY "Allow authenticated users to upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'headers' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT policy
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'headers');

-- DELETE policy
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'headers' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## File Structure

Files will be stored with the following structure:
- `avatars/{user_id}/avatar-{timestamp}.{ext}`
- `headers/{user_id}/header-{timestamp}.{ext}`

This ensures each user can only access their own files.

## Verification

After setting up, test by:
1. Logging into your app
2. Going to Dashboard → Profile tab
3. Uploading a profile photo
4. Verifying it appears correctly

If you encounter errors, check:
- Bucket names are exactly `avatars` and `headers` (case-sensitive)
- All 3 policies are created for each bucket
- Buckets are set to **Public**
- User is authenticated






