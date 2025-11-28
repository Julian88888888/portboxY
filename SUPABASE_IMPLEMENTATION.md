# Supabase Authentication Implementation

This document describes the Supabase authentication implementation for the Model Link Portfolio application.

## Overview

The application has been successfully migrated from a custom backend authentication system to Supabase authentication. This provides a more robust, scalable, and secure authentication solution with built-in features like email verification, password reset, and session management.

## What Was Changed

### 1. New Files Created

#### `src/services/supabase.js`
- Main Supabase client configuration
- Helper functions for all authentication operations
- Exports `supabase` client and `supabaseAuth` helper object

#### `env.example`
- Template for environment variables
- Contains placeholders for Supabase URL and API key

#### `SUPABASE_SETUP.md`
- Comprehensive setup guide
- Step-by-step instructions for configuring Supabase
- Information about storage buckets and security policies

### 2. Modified Files

#### `src/contexts/AuthContext.js`
**Major Changes:**
- Replaced custom backend API calls with Supabase authentication
- Added session management
- Implemented photo upload/delete/set main functionality using Supabase Storage
- Added password reset and change password functionality
- All user metadata is now stored in Supabase user metadata
- Real-time authentication state listening

**New Methods:**
- `uploadProfilePhotos(files)` - Upload photos to Supabase Storage
- `deleteProfilePhoto(photoId)` - Delete photo from Supabase Storage
- `setMainPhoto(photoId)` - Set a photo as the main profile photo
- `resetPassword(email)` - Send password reset email
- `changePassword(newPassword)` - Change user password

**New State:**
- `session` - Current Supabase session object

#### `src/services/api.js`
**Major Changes:**
- All authentication methods now show deprecation warnings
- Methods redirect to use Supabase instead
- Maintained for backward compatibility
- `getAuthHeaders()` now uses Supabase session token

**Status:** Deprecated but functional for non-auth API calls

#### `src/components/EditProfile.js`
**Major Changes:**
- Removed dependency on `apiService` for photo operations
- Now uses `AuthContext` methods directly
- Updated photo rendering to use Supabase Storage URLs
- Photo IDs changed from MongoDB `_id` to Supabase filename

### 3. Unchanged Files (Already Compatible)

#### `src/components/SignUpModal.js`
- ✅ Already uses `AuthContext.register()`
- No changes needed

#### `src/components/LoginModal.js`
- ✅ Already uses `AuthContext.login()`
- No changes needed

## Architecture

### Authentication Flow

```
User Action → Component → AuthContext → Supabase → Backend (if needed)
```

### Data Storage

#### User Metadata (Stored in Supabase Auth)
```javascript
{
  firstName: string,
  lastName: string,
  phone: string,
  userType: string,
  profilePhotos: [
    {
      id: string,        // Supabase Storage filename
      url: string,       // Public URL
      uploadedAt: string,
      isMain: boolean
    }
  ],
  // ... any other profile data
}
```

#### Photos Storage
- **Bucket:** `profile-photos`
- **Structure:** `{user_id}/{timestamp}.{extension}`
- **Access:** Public read, authenticated write/delete

### Session Management

- Sessions are automatically managed by Supabase
- Stored in localStorage with key `supabase.auth.token`
- Auto-refresh enabled
- Persistent across page reloads

## API Reference

### AuthContext Hook

```javascript
const {
  user,                    // Current user object with metadata
  session,                 // Supabase session object
  isAuthenticated,         // Boolean: user logged in?
  loading,                 // Boolean: auth state loading?
  login,                   // (credentials) => Promise<{success, error}>
  register,                // (userData) => Promise<{success, error}>
  logout,                  // () => Promise<void>
  updateProfile,           // (profileData) => Promise<{success, error, data}>
  uploadProfilePhotos,     // (files) => Promise<{success, error, data}>
  deleteProfilePhoto,      // (photoId) => Promise<{success, error}>
  setMainPhoto,            // (photoId) => Promise<{success, error}>
  resetPassword,           // (email) => Promise<{success, error, message}>
  changePassword,          // (newPassword) => Promise<{success, error, message}>
} = useAuth();
```

### User Object Structure

```javascript
{
  id: string,              // Supabase user ID
  email: string,           // User email
  firstName: string,       // From metadata
  lastName: string,        // From metadata
  phone: string,           // From metadata
  userType: string,        // From metadata
  profilePhotos: Array,    // From metadata
  user_metadata: Object,   // Raw Supabase metadata
  created_at: string,      // Supabase timestamp
  // ... other Supabase user fields
}
```

## Environment Variables

Required environment variables:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Optional:

```env
REACT_APP_API_URL=http://localhost:5002/api  # For other backend services
```

## Security Features

### Built-in Supabase Security
- ✅ Secure password hashing
- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Rate limiting
- ✅ Email verification (configurable)
- ✅ Row Level Security (RLS) ready

### Storage Security
- Photos are organized by user ID
- Storage policies prevent unauthorized access
- Users can only delete their own photos
- Public read access for viewing portfolios

## Migration from Old System

### For Existing Users
The old authentication system is **deprecated**. Existing users will need to:
1. Re-register with Supabase
2. Upload their profile photos again (photos from old system are not migrated)

### For Developers
If you need to maintain backward compatibility:
1. Keep the backend API running
2. Use `apiService` methods for non-auth operations
3. Gradually migrate data to Supabase

## Testing Checklist

- [x] User registration with all fields
- [x] User login with email/password
- [x] User logout
- [x] Session persistence across page reloads
- [x] Profile updates
- [x] Photo uploads to Supabase Storage
- [x] Photo deletion from Supabase Storage
- [x] Set main photo functionality
- [ ] Password reset email (requires Supabase configuration)
- [ ] Email verification (requires Supabase configuration)

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Create a `.env` file with your Supabase credentials

### Issue: Photos not uploading
**Solution:** 
1. Check that `profile-photos` bucket exists
2. Verify storage policies are configured
3. Check browser console for errors

### Issue: Authentication not persisting
**Solution:** 
1. Check browser localStorage is enabled
2. Verify Supabase URL and key are correct
3. Check browser console for session errors

### Issue: "User already registered" but can't login
**Solution:** 
1. Check email verification settings in Supabase
2. Verify email was confirmed
3. Check Supabase dashboard for user status

## Performance Considerations

### Optimizations Implemented
- Session caching in localStorage
- Automatic token refresh
- Lazy loading of user data
- Efficient photo uploads (individual file processing)

### Best Practices
- Don't call `getSession()` on every render
- Use `AuthContext` hook instead of direct Supabase calls
- Batch profile updates when possible
- Optimize image sizes before upload

## Future Enhancements

### Potential Improvements
- [ ] Social login (Google, Facebook, etc.)
- [ ] Two-factor authentication
- [ ] Image optimization on upload
- [ ] Photo albums/collections
- [ ] Profile photo cropping tool
- [ ] Batch photo operations
- [ ] Photo tags and search
- [ ] CDN integration for faster photo delivery

### Database Schema (Future)
If you need to store additional user data beyond metadata:
- Create tables in Supabase with RLS policies
- Link to users via `user_id`
- Use Supabase realtime for live updates

## Support & Resources

### Documentation
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

### Community
- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

## Troubleshooting Commands

```bash
# Check if Supabase client is installed
npm list @supabase/supabase-js

# Clear browser storage (in browser console)
localStorage.clear()

# Check current session (in browser console)
await supabase.auth.getSession()

# Get current user (in browser console)
await supabase.auth.getUser()
```

## Rollback Plan

If you need to rollback to the old system:

1. Revert `src/contexts/AuthContext.js` to use old API
2. Revert `src/services/api.js` to remove deprecation warnings
3. Revert `src/components/EditProfile.js` to use `apiService`
4. Remove Supabase environment variables
5. Restart backend authentication service

**Note:** Keep backups of the old files before making changes.

## Conclusion

The Supabase authentication implementation provides a robust, scalable, and secure foundation for the Model Link Portfolio application. All authentication operations are now handled by Supabase, with proper session management, secure storage, and built-in security features.

For questions or issues, refer to the `SUPABASE_SETUP.md` guide or the Supabase documentation.

