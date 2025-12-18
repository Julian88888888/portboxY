# Fix: Avatar Upload Not Working

## Problems Fixed

### 1. Wrong Storage Buckets
**Before:**
- `uploadAvatar` used bucket `avatars` ❌
- `uploadHeader` used bucket `headers` ❌

**After:**
- `uploadAvatar` uses bucket `profile-photos` ✅
- `uploadHeader` uses bucket `profile-headers` ✅

### 2. Wrong File Path Format
**Before:**
- Path: `${user.id}/avatar-${Date.now()}.${fileExt}` ❌
- Path: `${user.id}/header-${Date.now()}.${fileExt}` ❌

**After:**
- Path: `${user.id}/profile_photo/${timestamp}-${sanitizedFileName}` ✅
- Path: `${user.id}/profile_header/${timestamp}-${sanitizedFileName}` ✅

### 3. Missing File Validation
**Added:**
- File type validation (jpg/png/webp only)
- File size validation (max 5MB)
- Better error messages

### 4. Missing Authentication Check
**Added:**
- Check `isAuthenticated` and `user` in ProfileSettings.js
- Show error message if not authenticated

## Changes Made

### `src/services/profileService.js`

1. **uploadAvatar()**:
   - Changed bucket from `avatars` → `profile-photos`
   - Changed path format to `${userId}/profile_photo/${timestamp}-${filename}`
   - Added file validation

2. **uploadHeader()**:
   - Changed bucket from `headers` → `profile-headers`
   - Changed path format to `${userId}/profile_header/${timestamp}-${filename}`
   - Added file validation

3. **getAvatarUrl()**:
   - Changed bucket from `avatars` → `profile-photos`

4. **getHeaderUrl()**:
   - Changed bucket from `headers` → `profile-headers`

5. **deleteAvatar()**:
   - Changed bucket from `avatars` → `profile-photos`

6. **deleteHeader()**:
   - Changed bucket from `headers` → `profile-headers`

### `src/components/ProfileSettings.js`

1. **Added useAuth import**:
   ```javascript
   import { useAuth } from '../contexts/AuthContext';
   ```

2. **Added authentication check**:
   ```javascript
   const { user, isAuthenticated } = useAuth();
   
   if (!isAuthenticated || !user) {
     return <div>Please log in to access profile settings</div>;
   }
   ```

## Storage Buckets Required

Make sure these buckets exist in Supabase:

1. **profile-photos** - for profile photos/logos
2. **profile-headers** - for header photos

## File Path Structure

Files are now stored as:
```
profile-photos/
  {userId}/
    profile_photo/
      {timestamp}-{filename}

profile-headers/
  {userId}/
    profile_header/
      {timestamp}-{filename}
```

## Testing

1. ✅ Upload profile photo - should work without errors
2. ✅ Upload header photo - should work without errors
3. ✅ Check that images appear in preview
4. ✅ Check that images are saved in correct buckets
5. ✅ Check that paths are saved in database correctly

## If Still Not Working

1. **Check Storage Buckets**:
   - Go to Supabase Dashboard → Storage
   - Verify `profile-photos` and `profile-headers` buckets exist
   - Check bucket policies allow uploads

2. **Check Console**:
   - Open browser DevTools → Console
   - Look for error messages
   - Check Network tab for failed requests

3. **Check Authentication**:
   - Verify user is logged in
   - Check that session token is valid
   - Verify `isAuthenticated` is `true`

4. **Check Database**:
   - Verify `profiles` table exists
   - Check that `profile_photo_path` and `profile_header_path` columns exist




