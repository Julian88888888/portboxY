# Supabase Storage Setup for Profile Settings

## Step 1: Create Storage Buckets

In your Supabase dashboard, go to **Storage** and create two buckets:

### Bucket 1: `profile-photos`
- **Name**: `profile-photos`
- **Public**: Yes (if you want public access) or No (if using signed URLs)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

### Bucket 2: `profile-headers`
- **Name**: `profile-headers`
- **Public**: Yes (if you want public access) or No (if using signed URLs)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

## Step 2: Create Storage Policies

For each bucket, create the following policies:

### For `profile-photos` bucket:

#### Policy 1: Allow authenticated users to upload to their own folder
- **Policy name**: `Users can upload to own folder`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
(bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 2: Allow users to read their own photos
- **Policy name**: `Users can read own photos`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
(bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 3: Allow users to delete their own photos
- **Policy name**: `Users can delete own photos`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
(bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### For `profile-headers` bucket:

#### Policy 1: Allow authenticated users to upload to their own folder
- **Policy name**: `Users can upload to own folder`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
(bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 2: Allow users to read their own headers
- **Policy name**: `Users can read own headers`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
(bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 3: Allow users to delete their own headers
- **Policy name**: `Users can delete own headers`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
(bucket_id = 'profile-headers' AND (storage.foldername(name))[1] = auth.uid()::text)
```

## Step 3: Optional - Public Read Access

If you want public profiles to be viewable without authentication, you can add an additional SELECT policy that allows reading from any user's folder:

```sql
(bucket_id = 'profile-photos')
```

And similarly for headers:

```sql
(bucket_id = 'profile-headers')
```

**Note**: Only add public read policies if you want profile images to be publicly accessible. Otherwise, use signed URLs for reading.



