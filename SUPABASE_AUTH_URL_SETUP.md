# Supabase auth email links (production URL)

If confirmation emails open `http://localhost:3000` instead of the live app, fix **both** the app env and Supabase dashboard.

## 1. Vercel environment variable

In [Vercel](https://vercel.com) → Project **portbox-y** → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|--------|--------------|
| `REACT_APP_SITE_URL` | `https://portbox-y.vercel.app` | Production, Preview |

Then **Redeploy** (env vars are baked in at build time).

## 2. Supabase URL configuration

In [Supabase Dashboard](https://app.supabase.com) → your project → **Authentication** → **URL Configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://portbox-y.vercel.app` |
| **Redirect URLs** | Add each line (one per row): |

```
https://portbox-y.vercel.app/**
https://portbox-y.vercel.app/
http://localhost:3000/**
http://localhost:3000/
```

Keep localhost entries only if you still test sign-up locally.

## 3. How the app uses this

- Sign-up emails use `emailRedirectTo: https://portbox-y.vercel.app/` (from `REACT_APP_SITE_URL`).
- Password reset uses `https://portbox-y.vercel.app/reset-password`.

Defined in `src/services/supabase.js` (`getAuthSiteUrl()`).

## 4. Test tomorrow morning

1. Redeploy Vercel after setting `REACT_APP_SITE_URL`.
2. Update Supabase Site URL + Redirect URLs (step 2).
3. Register a **new** test email (old links stay expired / wrong host).
4. Open the new email on phone/desktop — URL should start with `https://portbox-y.vercel.app`.
5. After click, you should land on the app logged in (or see a clear error if the link expired).

### `otp_expired` / link invalid

That error means the token expired or the link was already used. Request a new confirmation email after steps 1–2 are done.
