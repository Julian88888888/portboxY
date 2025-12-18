# Fix: "Your session has expired" Error

## Problem
Users were getting "Your session has expired. Please refresh the page and try again." when trying to upload profile photos.

## Root Cause
The code was using `supabaseAuth.getUser()` which doesn't guarantee an active session with a valid token. For storage operations, we need an active session with a valid access token.

## Solution
Changed `uploadAvatar()` and `uploadHeader()` to use `supabaseAuth.getSession()` instead of `getUser()` to ensure we have an active session with a valid token.

### Before:
```javascript
const { user, error: getUserError } = await supabaseAuth.getUser();
```

### After:
```javascript
const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();

if (sessionError || !sessionData?.session?.user) {
  throw new Error('User not authenticated');
}

const user = sessionData.session.user;
```

## Why This Works
- `getSession()` returns the current active session with access token
- Storage operations require an active session with a valid token
- `getUser()` may return user info but doesn't guarantee an active session

## Files Changed
- `src/services/profileService.js`:
  - `uploadAvatar()` - now uses `getSession()`
  - `uploadHeader()` - now uses `getSession()`

## Testing
1. Log in to your account
2. Go to Profile Settings
3. Try uploading a profile photo
4. Should work without "session expired" error

## If Still Getting Errors

1. **Check browser console** (F12) for detailed error messages
2. **Verify session is active**:
   - Check that you're logged in
   - Try refreshing the page
   - Check Network tab for 401/403 errors
3. **Check Supabase Storage**:
   - Verify buckets `profile-photos` and `profile-headers` exist
   - Verify storage policies allow authenticated uploads
4. **Check environment variables**:
   - `REACT_APP_SUPABASE_URL` is set
   - `REACT_APP_SUPABASE_ANON_KEY` is set



