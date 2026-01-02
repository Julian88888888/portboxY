# Custom Links Feature - Setup Guide

## Overview

This feature allows users to create, edit, and manage custom links (with icon, title, and URL) that can be displayed on their profile page.

## Database Setup

### Step 1: Create the Database Table

1. Open Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy and paste the entire contents of `custom_links_schema.sql`
4. Click "Run" or press Cmd/Ctrl + Enter

This will create:
- `custom_links` table with proper structure
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### Step 2: Verify Table Creation

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'custom_links';
```

## Backend API

The backend API is already set up with the following endpoints:

- **GET** `/api/custom-links` - Get all custom links for current user
- **POST** `/api/custom-links` - Create a new custom link
- **PUT** `/api/custom-links/:id` - Update a custom link
- **DELETE** `/api/custom-links/:id` - Delete a custom link

All endpoints require authentication via Supabase token.

## Frontend

The Dashboard component (Tab 4: Custom Links) now includes:

1. **List of existing links** - Shows all user's custom links with:
   - Icon (if provided)
   - Title
   - URL (clickable)
   - Enabled/Disabled status
   - Edit and Delete buttons

2. **Add/Edit Link Modal** - Form with fields:
   - Title (required)
   - URL (required, validated)
   - Icon URL (optional)
   - Enable/Disable toggle

3. **Features**:
   - Create new links
   - Edit existing links
   - Delete links (with confirmation)
   - View all links
   - Enable/disable links

## Usage

1. Navigate to Dashboard → Tab 4: Custom Links
2. Click "Add Your First Link" or "+ Add New Link"
3. Fill in the form:
   - **Title**: Name of the link (e.g., "My Portfolio")
   - **URL**: Full URL (e.g., "https://example.com")
   - **Icon URL**: Optional image URL for the icon
   - **Enable**: Toggle to enable/disable the link
4. Click "Create Link"
5. The link will appear in the list below
6. Use "Edit" to modify or "Delete" to remove links

## Database Schema

```sql
custom_links
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── title (TEXT, NOT NULL)
├── url (TEXT, NOT NULL)
├── icon_url (TEXT, nullable)
├── display_order (INTEGER, default: 0)
├── enabled (BOOLEAN, default: true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security

- Row Level Security (RLS) is enabled
- Users can only view/edit/delete their own links
- All API endpoints require authentication
- URL format is validated before saving

## Troubleshooting

### "relation custom_links does not exist"
- Run the SQL schema file in Supabase SQL Editor

### "Failed to create custom link"
- Check that title and URL are provided
- Verify URL format is valid (must start with http:// or https://)
- Check browser console for detailed error messages

### Links not loading
- Verify authentication token is valid
- Check network tab in browser DevTools
- Verify backend server is running

