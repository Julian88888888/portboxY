# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Model Link Portfolio application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm/pnpm installed
- This React application

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Choose a name (e.g., "model-portfolio")
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL**: Found under "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key**: Found under "Project API keys" → "anon public"

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Never commit your `.env` file to version control. Make sure `.env` is in your `.gitignore` file.

## Step 4: Set Up Supabase Storage (Optional)

If you want to use profile photo uploads:

1. In your Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it `profile-photos`
4. Set the bucket to **Public** (so users can view profile photos)
5. Configure policies:
   - Click on the bucket
   - Go to "Policies" tab
   - Click "New Policy" for each policy below

**⚠️ IMPORTANT:** In Supabase UI, paste ONLY the condition (inside parentheses), NOT the full CREATE POLICY command! The UI automatically adds `WITH CHECK` or `USING`.

**Insert Policy** (Allow authenticated users to upload):
1. Click **"New Policy"**
2. **Policy name:** `Allow authenticated users to upload profile photos`
3. **Allowed operation:** `INSERT`
4. **Target roles:** `authenticated`
5. Click **"For full customization"**
6. In **"WITH CHECK expression"** field, paste ONLY this:
   ```
   bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
7. Click **"Review"** then **"Save policy"**

**Select Policy** (Allow everyone to view):
1. Click **"New Policy"**
2. **Policy name:** `Allow public access to profile photos`
3. **Allowed operation:** `SELECT`
4. **Target roles:** `public`
5. Click **"For full customization"**
6. In **"USING expression"** field, paste ONLY this:
   ```
   bucket_id = 'profile-photos'
   ```
7. Click **"Review"** then **"Save policy"**

**Delete Policy** (Allow users to delete their own photos):
1. Click **"New Policy"**
2. **Policy name:** `Allow users to delete their own profile photos`
3. **Allowed operation:** `DELETE`
4. **Target roles:** `authenticated`
5. Click **"For full customization"**
6. In **"USING expression"** field, paste ONLY this:
   ```
   bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
7. Click **"Review"** then **"Save policy"**

## Step 5: Configure Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup", "Magic Link", "Change Email Address", and "Reset Password" templates

### Email Settings

- **Site URL**: Set this to your production URL (e.g., `https://yourdomain.com`)
- **Redirect URLs**: Add both development and production URLs:
  - `http://localhost:3000/**`
  - `https://yourdomain.com/**`

## Step 6: Install Dependencies (Already Done)

The Supabase client is already installed in this project:
```bash
pnpm install @supabase/supabase-js
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   pnpm start
   ```

2. Try to register a new account:
   - Fill in the signup form
   - You should receive a confirmation email (if email confirmation is enabled)
   - Check the Supabase dashboard under **Authentication** → **Users** to see the new user

3. Try to log in with the created account

## Authentication Flow

### Sign Up
1. User fills in the signup form (email, password, first name, last name, phone, user type)
2. Supabase creates the user account
3. User metadata (firstName, lastName, phone, userType) is stored with the user
4. A confirmation email is sent (if enabled)
5. User is automatically logged in

### Sign In
1. User enters email and password
2. Supabase verifies credentials
3. Session is created and stored in localStorage
4. User data is loaded into the React context

### Sign Out
1. User clicks logout
2. Supabase session is cleared
3. User is redirected to the home page

## User Metadata Structure

User metadata is stored in Supabase and includes:
```javascript
{
  firstName: string,
  lastName: string,
  phone: string,
  userType: 'model' | 'photographer' | 'stylist' | 'makeup_artist' | 'hair_stylist',
  profilePhotos: [
    {
      id: string,
      url: string,
      uploadedAt: string,
      isMain: boolean
    }
  ]
}
```

## Profile Photo Storage

Photos are stored in Supabase Storage with the following structure:
```
profile-photos/
  ├── {user_id}/
      ├── {timestamp}.jpg
      ├── {timestamp}.png
      └── ...
```

## Security Considerations

1. **Row Level Security (RLS)**: Consider enabling RLS on any custom tables you create
2. **API Keys**: Never expose your service role key in the frontend
3. **Email Verification**: Enable email confirmation in production
4. **Password Requirements**: Configure strong password requirements in Supabase settings
5. **Rate Limiting**: Supabase has built-in rate limiting for authentication

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure your `.env` file exists and contains the correct variables
- Restart your development server after adding environment variables

### Issue: Users not receiving confirmation emails
- Check **Authentication** → **Email Templates** in Supabase dashboard
- Verify your SMTP settings (Supabase provides default SMTP in development)
- Check spam folder

### Issue: "Invalid API key"
- Double-check that you're using the **anon/public key**, not the service role key
- Make sure there are no extra spaces in your `.env` file

### Issue: Photos not uploading
- Verify the `profile-photos` bucket exists and is public
- Check that storage policies are correctly configured
- Make sure you're authenticated when uploading

## Migration from Custom Backend

If you were previously using the custom Node.js backend for authentication:

1. The old backend authentication is now **deprecated**
2. All authentication now goes through Supabase
3. The `apiService` methods will show deprecation warnings in the console
4. User sessions are now managed by Supabase
5. You may want to migrate existing users to Supabase (contact support for migration tools)

## API Reference

### AuthContext Methods

```javascript
const {
  user,              // Current user object
  session,           // Current Supabase session
  isAuthenticated,   // Boolean: is user logged in?
  loading,           // Boolean: is auth state loading?
  login,             // Function: login(credentials)
  register,          // Function: register(userData)
  logout,            // Function: logout()
  updateProfile,     // Function: updateProfile(profileData)
  uploadProfilePhotos, // Function: uploadProfilePhotos(files)
  deleteProfilePhoto,  // Function: deleteProfilePhoto(photoId)
  setMainPhoto,        // Function: setMainPhoto(photoId)
  resetPassword,       // Function: resetPassword(email)
  changePassword,      // Function: changePassword(newPassword)
} = useAuth();
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Check the Supabase dashboard logs
3. Review this setup guide
4. Consult the Supabase documentation

