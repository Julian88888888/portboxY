# Fix: Header Photo Not Uploading

## Problem
Header photo was not uploading/displaying even though profile photo works fine.

## Root Cause
The code was using `header_photo_path` but the database column might be named `profile_header_path`, causing a mismatch.

## Solution Applied

Updated `ProfileSettings.js` to support **both** column names (`header_photo_path` and `profile_header_path`) for compatibility:

1. **Reading header path**: Now checks both `profile.header_photo_path` and `profile.profile_header_path`
2. **Saving header path**: Updates both columns when saving to ensure compatibility
3. **Deleting header**: Removes from both columns
4. **Displaying header**: Checks both columns when showing the image

## Changes Made

### 1. Preview Loading
```javascript
// Support both column names
const headerPath = profile.header_photo_path || profile.profile_header_path;
if (headerPath) {
  setHeaderPhotoPreview(getHeaderUrl(headerPath));
}
```

### 2. Upload Handler
```javascript
// Update both columns for compatibility
await updateProfile.mutateAsync({ 
  header_photo_path: path,
  profile_header_path: path 
});
```

### 3. Delete Handler
```javascript
// Remove from both columns
await updateProfile.mutateAsync({ 
  header_photo_path: null,
  profile_header_path: null 
});
```

### 4. Display URL
```javascript
// Support both column names
const headerPath = profile?.header_photo_path || profile?.profile_header_path;
if (headerPath) return getHeaderUrl(headerPath);
```

## Important: Run SQL Script First

Before these code changes work properly, you **must** run the SQL script:

1. Go to **Supabase Dashboard → SQL Editor**
2. Run `add_header_photo_path_column.sql`
3. This ensures both columns exist and are synced

## Testing

After applying fixes:

1. **Refresh the page** (F5)
2. Try uploading a header photo
3. It should:
   - ✅ Upload successfully
   - ✅ Show preview immediately
   - ✅ Save to database
   - ✅ Display in the profile preview

## If Still Not Working

1. **Check database columns**:
   - Go to Table Editor → profiles
   - Verify both `header_photo_path` AND `profile_header_path` exist

2. **Check browser console** (F12):
   - Look for any errors during upload
   - Check Network tab for failed requests

3. **Verify storage bucket**:
   - Make sure `profile-headers` bucket exists
   - Check it's public and has correct policies

4. **Check file upload**:
   - File must be image (jpg/png/webp)
   - File size must be < 5MB







