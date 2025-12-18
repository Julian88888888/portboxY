# Fixing "Failed to fetch" Error with Supabase

## Problem
You're seeing this error when trying to sign in:
```
AuthRetryableFetchError: Failed to fetch
status: 0
```

This typically indicates a network/CORS issue or missing environment variables.

## Common Causes

### 1. Missing Environment Variables in Vercel

**Solution:**
1. Go to https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Ensure these are set for **Production**, **Preview**, and **Development**:
   - `REACT_APP_SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anon/public key
5. **Redeploy** your application after adding/updating variables

### 2. CORS Configuration in Supabase

**Solution:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **CORS Configuration**
5. Add your Vercel domain to the allowed origins:
   - `https://portbox-y.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
   - `http://localhost:3000` (for local development)
6. Click **Save**

### 3. Site URL Configuration in Supabase

**Solution:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `https://portbox-y.vercel.app`
5. Add to **Redirect URLs**:
   - `https://portbox-y.vercel.app/**`
   - `https://*.vercel.app/**` (for preview deployments)
   - `http://localhost:3000/**` (for local development)
6. Click **Save**

### 4. Network/Firewall Issues

If you're behind a corporate firewall or VPN:
- Try accessing from a different network
- Check if your firewall is blocking requests to `*.supabase.co`
- Contact your network administrator

### 5. Invalid Supabase URL

**Check:**
- Your Supabase URL should be in format: `https://xxxxx.supabase.co`
- It should NOT have a trailing slash
- It should start with `https://`

**To verify:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** exactly as shown

## Debugging Steps

### Check Environment Variables in Browser Console

After deploying, open your browser console and check:
1. Look for any error messages about missing environment variables
2. The improved error handling will now show diagnostic information

### Test Supabase Connection

You can test if Supabase is reachable by running this in your browser console on your deployed site:

```javascript
fetch('YOUR_SUPABASE_URL/rest/v1/', {
  method: 'GET',
  headers: {
    'apikey': 'YOUR_ANON_KEY'
  }
})
.then(r => console.log('Connection OK:', r))
.catch(e => console.error('Connection failed:', e));
```

Replace `YOUR_SUPABASE_URL` and `YOUR_ANON_KEY` with your actual values.

## Verification

After fixing the issues:
1. **Redeploy** your Vercel application
2. Clear your browser cache
3. Try signing in again
4. Check the browser console for any remaining errors

## Still Having Issues?

If the problem persists:
1. Check the browser's Network tab to see the exact request that's failing
2. Look for CORS errors in the console
3. Verify your Supabase project is active and not paused
4. Check Supabase status page: https://status.supabase.com


