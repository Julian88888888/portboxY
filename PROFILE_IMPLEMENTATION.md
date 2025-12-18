# Profile Settings Implementation Guide

This document describes the implementation of the editable Profile Settings feature with Supabase integration and real-time updates.

## Overview

The profile system allows users to:
- Edit profile information (username, display name, job type, description)
- Upload profile photos (avatars) and header photos
- Toggle visibility of profile elements
- See changes instantly on the Dashboard without page refresh

## Architecture

### Data Layer (React Query)
- **Single source of truth**: All profile data is managed through React Query
- **Query key**: `['profile']` - used for caching and invalidation
- **Automatic refetching**: After mutations, queries are invalidated to ensure fresh data

### Database Schema

**Table: `profiles`**
- `id` (UUID, PK) - matches `auth.uid()`
- `username` (TEXT, UNIQUE, NOT NULL)
- `display_name` (TEXT, NOT NULL)
- `job_type` (TEXT, CHECK constraint for valid values)
- `description` (TEXT, nullable)
- `profile_photo_path` (TEXT, nullable) - storage path, not URL
- `header_photo_path` (TEXT, nullable) - storage path, not URL
- `show_profile_photo` (BOOLEAN, default true)
- `show_header_photo` (BOOLEAN, default true)
- `show_description` (BOOLEAN, default true)
- `updated_at` (TIMESTAMPTZ, auto-updated via trigger)

**RLS Policies:**
- Users can only SELECT, INSERT, UPDATE, DELETE their own profile row
- Policy condition: `auth.uid() = id`

### Storage Buckets

**`avatars` bucket:**
- Public bucket for profile photos
- File structure: `{user_id}/avatar-{timestamp}.{ext}`
- Policies: INSERT (own folder), SELECT (public), DELETE (own files)

**`headers` bucket:**
- Public bucket for header photos
- File structure: `{user_id}/header-{timestamp}.{ext}`
- Policies: INSERT (own folder), SELECT (public), DELETE (own files)

## File Structure

```
src/
├── hooks/
│   └── useProfile.js          # React Query hooks for profile operations
├── services/
│   └── profileService.js       # Service functions for API calls
└── components/
    ├── ProfileSettings.js     # Profile Settings form component
    ├── Dashboard.js           # Updated to use ProfileSettings
    └── ModelPage.js            # Updated to display profile data
```

## Key Features

### 1. Profile Settings Component (`ProfileSettings.js`)

**Features:**
- Form with all profile fields
- Real-time username validation (format + uniqueness check)
- Image upload with preview
- Remove image functionality
- Save status indicators ("Saving...", "Saved ✓", "Error")
- Inline error messages

**Validation:**
- Username: `^[a-zA-Z0-9._]{3,30}$` (no spaces)
- Username uniqueness checked against database
- Image file type validation
- Image size limit (5MB)

### 2. React Query Hooks (`useProfile.js`)

**Hooks:**
- `useProfile()` - Get current user's profile
- `useUpdateProfile()` - Update profile (with auto-invalidation)
- `useCheckUsername()` - Check username availability
- `useUploadAvatar()` - Upload avatar image
- `useUploadHeader()` - Upload header image
- `useDeleteAvatar()` - Delete avatar
- `useDeleteHeader()` - Delete header
- `useProfileImageUrl()` - Get profile image URL
- `useHeaderImageUrl()` - Get header image URL

### 3. Service Functions (`profileService.js`)

**Functions:**
- `getProfile()` - Fetch profile from database
- `upsertProfile(payload)` - Insert or update profile
- `checkUsernameAvailability(username, userId)` - Check if username is available
- `uploadAvatar(file)` - Upload to `avatars` bucket
- `uploadHeader(file)` - Upload to `headers` bucket
- `deleteAvatar(path)` - Delete from `avatars` bucket
- `deleteHeader(path)` - Delete from `headers` bucket
- `getAvatarUrl(path)` - Get public URL for avatar
- `getHeaderUrl(path)` - Get public URL for header

## Setup Instructions

### 1. Run Database Migration

Execute the SQL in `profiles_migration.sql` in your Supabase SQL Editor:

```sql
-- Creates profiles table with RLS policies
-- See profiles_migration.sql for full SQL
```

### 2. Set Up Storage Buckets

Follow the instructions in `STORAGE_SETUP.md` to:
- Create `avatars` and `headers` buckets
- Set up storage policies for each bucket

### 3. Install Dependencies

Already installed:
- `@tanstack/react-query` - For data fetching and caching

### 4. React Query Provider

Already configured in `src/index.js`:
```javascript
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Usage

### In Dashboard (Profile Settings Tab)

The `ProfileSettings` component is automatically used in Dashboard Tab 1:

```javascript
import ProfileSettings from './ProfileSettings';

// In Dashboard component:
{activeTab === 'Tab 1' && (
  <ProfileSettings />
)}
```

### In ModelPage (Display Profile)

```javascript
import { useProfile, getAvatarUrl, getHeaderUrl } from '../hooks/useProfile';

const { data: profile } = useProfile();
const displayName = profile?.display_name || 'Default Name';
const username = profile?.username || 'username';
```

## Data Flow

### Saving Profile Changes

1. User fills form in `ProfileSettings`
2. On submit, `handleSubmit` validates username
3. Calls `updateProfile.mutateAsync(formData)`
4. `upsertProfile` service function updates database
5. React Query invalidates `['profile']` query
6. All components using `useProfile()` automatically refetch
7. Dashboard and ModelPage update instantly

### Uploading Images

1. User selects image file
2. `handleProfilePhotoUpload` validates file
3. Deletes old image if exists
4. Uploads new image via `uploadAvatar.mutateAsync(file)`
5. Updates profile with new `profile_photo_path`
6. React Query invalidates `['profile']` query
7. UI updates with new image

## Real-time Updates

The system uses React Query's cache invalidation to ensure:
- Changes in Profile Settings immediately reflect in Dashboard
- No page refresh needed
- Data stays in sync across components

**How it works:**
- All components use `useProfile()` hook
- When profile is updated, `queryClient.invalidateQueries(['profile'])` is called
- React Query automatically refetches data for all active queries with key `['profile']`
- Components re-render with fresh data

## Optional: Realtime Sync (Future Enhancement)

To enable real-time sync between tabs/devices:

```javascript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

function useProfileRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
```

## Troubleshooting

### Profile not loading
- Check if user is authenticated
- Verify RLS policies are set correctly
- Check browser console for errors

### Image upload fails
- Verify storage buckets exist (`avatars`, `headers`)
- Check storage policies are configured
- Ensure buckets are set to "Public"
- Check file size (max 5MB)

### Username validation fails
- Check username format: 3-30 chars, alphanumeric + dots/underscores
- Verify username uniqueness check is working
- Check database connection

### Changes not reflecting
- Verify React Query provider is set up
- Check that `invalidateQueries` is called after mutations
- Ensure components are using `useProfile()` hook

## Next Steps

1. Run the SQL migration in Supabase
2. Set up storage buckets (see `STORAGE_SETUP.md`)
3. Test profile creation and editing
4. Verify real-time updates work
5. (Optional) Add realtime sync for multi-tab support



