# Profile Settings Feature Setup Guide

This guide will help you set up the Profile Settings feature with image uploads and visibility toggles.

## Overview

The Profile Settings feature allows users to:
- Upload profile photos/logos
- Upload profile header photos
- Toggle visibility of profile photos
- Toggle visibility of header photos

## Prerequisites

1. Supabase project set up
2. Node.js backend running
3. React frontend with TypeScript support

## Step 1: Database Setup

Run the SQL script to create the profiles table and RLS policies:

```bash
# In Supabase SQL Editor, run:
supabase_profiles_setup.sql
```

This will:
- Create the `profiles` table
- Set up RLS policies
- Create triggers for `updated_at` timestamp

## Step 2: Storage Buckets Setup

Follow the instructions in `supabase_storage_setup.md` to:
1. Create `profile-photos` bucket
2. Create `profile-headers` bucket
3. Set up storage policies for both buckets

## Step 3: Backend Setup

### Install Dependencies

```bash
cd backend
npm install @supabase/supabase-js
```

### Environment Variables

Add to your backend `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Use the service role key (not the anon key) for backend operations. Keep it secure!

### Verify Routes

The backend should now have these routes:
- `GET /api/me/profile` - Get profile settings
- `PUT /api/me/profile` - Update profile settings
- `POST /api/me/profile/upload-url` - Get signed upload URL

## Step 4: Frontend Setup

### Install Dependencies

```bash
npm install @tanstack/react-query typescript @types/react @types/react-dom
```

### TypeScript Configuration

The `tsconfig.json` file is already created. TypeScript support is enabled.

### React Query Setup

React Query is already configured in `src/index.js`.

## Step 5: Usage

### Using ProfileSettings Component

```tsx
import ProfileSettings from './components/ProfileSettings';

function App() {
  return (
    <div>
      <ProfileSettings />
    </div>
  );
}
```

### Using PublicProfile Component (Example)

```tsx
import PublicProfile from './components/PublicProfile';

function PublicProfilePage({ userId }) {
  return <PublicProfile userId={userId} />;
}
```

## API Endpoints

### GET /api/me/profile

Get current user's profile settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "profile_photo_path": "user-id/profile_photo/timestamp-filename.jpg",
    "profile_header_path": "user-id/profile_header/timestamp-filename.jpg",
    "show_profile_photo": true,
    "show_profile_header": true,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/me/profile

Update profile settings.

**Request Body:**
```json
{
  "show_profile_photo": false,
  "show_profile_header": true,
  "profile_photo_path": "user-id/profile_photo/timestamp-filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated profile object
  }
}
```

### POST /api/me/profile/upload-url

Get signed upload URL for file upload.

**Request Body:**
```json
{
  "type": "profile_photo", // or "profile_header"
  "fileName": "my-photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...signed-url...",
    "path": "user-id/profile_photo/timestamp-my-photo.jpg"
  }
}
```

## Upload Flow

1. User selects an image file
2. Frontend validates file (type: jpg/png/webp, size: max 5MB)
3. Frontend calls `POST /api/me/profile/upload-url` with file name
4. Backend generates signed URL and returns it
5. Frontend uploads file directly to signed URL using PUT
6. Frontend calls `PUT /api/me/profile` to save the path in database

## File Naming Convention

Files are stored with the following path structure:
```
{userId}/{type}/{timestamp}-{originalFileName}
```

Example:
```
abc123/profile_photo/1704067200000-my-photo.jpg
abc123/profile_header/1704067200000-header.jpg
```

## Security

### Row Level Security (RLS)

- Users can only view/update their own profile
- RLS policies enforce `auth.uid() = id` check

### Storage Policies

- Users can only upload to their own folder (`{auth.uid()}/...`)
- Users can only read/delete from their own folder
- File paths are validated to prevent directory traversal

### JWT Verification

- All backend endpoints verify Supabase JWT tokens
- Tokens are validated on every request

## Troubleshooting

### Upload fails with 403

- Check storage bucket policies
- Verify user is authenticated
- Check file path matches user ID

### Images not showing

- Check if `show_profile_photo` or `show_profile_header` is `true`
- Verify storage bucket is public or use signed URLs
- Check file path in database matches storage path

### TypeScript errors

- Ensure `tsconfig.json` is in project root
- Install TypeScript: `npm install typescript @types/react @types/react-dom`
- Restart your development server

## Testing

1. Upload a profile photo - should see preview immediately
2. Toggle "Show Profile Photo" OFF - image should not appear in public profile
3. Toggle "Show Profile Photo" ON - image should appear again
4. Upload a header photo - should see preview
5. Remove an image - should clear from UI and database

## Next Steps

- Add image cropping/resizing before upload
- Add multiple image uploads
- Add image optimization
- Add public profile page with username lookup








