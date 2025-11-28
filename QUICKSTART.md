# Quick Start Guide - Supabase Authentication

Get your Model Link Portfolio app running with Supabase authentication in 5 minutes!

## Prerequisites

- Node.js installed (v14 or higher)
- A Supabase account (free tier works great!)

## Step 1: Create a Supabase Project (2 minutes)

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `model-portfolio` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes

## Step 2: Get Your API Keys (30 seconds)

1. In your new project, click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 3: Configure Your App (1 minute)

1. In your project root, create a `.env` file:
   ```bash
   touch .env
   ```

2. Open `.env` and add your credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Replace with your actual values from Step 2!

## Step 4: Set Up Storage (1 minute)

1. In Supabase dashboard, click **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Set:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Enable this!
4. Click **"Create bucket"**

### Add Storage Policies

1. Click on your `profile-photos` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"** for each policy below

**⚠️ IMPORTANT:** In Supabase UI, paste ONLY the condition (inside parentheses), NOT the full CREATE POLICY command! The UI automatically adds `WITH CHECK` or `USING`.

**Policy 1: Allow photo uploads (INSERT)**
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

**Policy 2: Allow public viewing (SELECT)**
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

**Policy 3: Allow photo deletion (DELETE)**
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

## Step 5: Start Your App (30 seconds)

```bash
# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm start
```

Your app should open at `http://localhost:3000`

## Step 6: Test It Out! (1 minute)

1. **Sign Up**: 
   - Fill in the registration form
   - Check for a confirmation email (if enabled)
   - You should be automatically logged in

2. **View Your Profile**:
   - Click the hamburger menu
   - Go to "Model Page" or "Edit Profile"

3. **Upload Photos**:
   - Go to Edit Profile
   - Click "Upload Profile Photos"
   - Select and upload photos
   - Watch them appear in your gallery!

4. **Log Out & Log Back In**:
   - Log out from the menu
   - Sign in again with your credentials
   - Your data should persist!

## Troubleshooting

### ❌ "Missing Supabase environment variables"
- Check that your `.env` file exists in the project root
- Verify the variable names are exactly `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Restart your dev server after creating `.env`

### ❌ Photos won't upload
- Make sure the `profile-photos` bucket is set to **Public**
- Check that all 3 storage policies are added
- Look in browser console for specific error messages

### ❌ "Invalid API key"
- Double-check you copied the **anon public** key, not the service role key
- Make sure there are no extra spaces in your `.env` file
- Try regenerating the key in Supabase settings

### ❌ Can't log in after signing up
- Check if email confirmation is required:
  - Go to **Authentication** → **Providers** → **Email**
  - Look for "Confirm email" setting
  - For testing, you can disable this
- Check your email spam folder for confirmation

### ❌ App shows old backend errors
- Clear your browser's localStorage:
  - Open browser console (F12)
  - Type: `localStorage.clear()`
  - Refresh the page

## What's Next?

### Optional: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm signup** - Welcome email
   - **Reset password** - Password reset instructions
   - **Change email** - Email change confirmation

### Optional: Add Social Login

1. Go to **Authentication** → **Providers**
2. Enable providers like:
   - Google
   - Facebook
   - GitHub
3. Follow Supabase's setup guide for each provider

### Optional: Customize Authentication

1. Go to **Authentication** → **Policies**
2. Configure:
   - Password requirements
   - Session timeout
   - Email confirmation requirements
   - Rate limiting

## Need Help?

- 📖 Read the full setup guide: `SUPABASE_SETUP.md`
- 📖 Review implementation details: `SUPABASE_IMPLEMENTATION.md`
- 🌐 Supabase Docs: https://supabase.com/docs
- 💬 Supabase Discord: https://discord.supabase.com/

## Success! 🎉

You're now running a modern, secure authentication system with:
- ✅ User registration and login
- ✅ Secure password management
- ✅ Profile photo storage
- ✅ Session management
- ✅ Auto-logout on token expiration
- ✅ Password reset (via email)

Happy coding! 🚀

