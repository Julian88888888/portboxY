# Fix: React Query Module Not Found Error

## Problem
```
ERROR in ./src/hooks/useProfile.js
Module not found: Error: Can't resolve '@tanstack/react-query'
```

## Solution

The package is installed correctly, but webpack needs to be restarted. Follow these steps:

### Step 1: Stop the Dev Server
If your dev server is running, stop it with `Ctrl+C` or `Cmd+C`

### Step 2: Clear All Caches
Run these commands:

```bash
# Clear webpack cache
rm -rf node_modules/.cache
rm -rf .cache
rm -rf build
rm -rf .eslintcache

# Clear webpack-specific cache
rm -rf node_modules/.cache/webpack 2>/dev/null || true
```

### Step 3: Verify Package Installation
```bash
pnpm list @tanstack/react-query
```

Should show: `@tanstack/react-query 5.90.12`

### Step 4: Restart Dev Server
```bash
pnpm start
```

## Alternative: Full Reinstall

If the above doesn't work, try a full reinstall:

```bash
# Stop dev server first (Ctrl+C)

# Remove node_modules and reinstall
rm -rf node_modules
pnpm install

# Restart dev server
pnpm start
```

## Quick Fix Script

You can also run the provided script:

```bash
./fix-react-query.sh
```

Then restart your dev server.

## Why This Happens

This error typically occurs when:
1. The package was installed while the dev server was running
2. Webpack cache is stale
3. The dev server needs to pick up the new module

**Solution**: Always restart the dev server after installing new packages.

## Verification

After restarting, the error should be gone. The app should compile successfully and you should see:
- ✅ No module resolution errors
- ✅ React Query hooks working
- ✅ Profile settings loading correctly


