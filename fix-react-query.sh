#!/bin/bash

# Fix React Query module resolution issue
echo "Clearing caches and reinstalling..."

# Stop any running dev server (if possible)
pkill -f "react-scripts" 2>/dev/null || true

# Clear all caches
rm -rf node_modules/.cache
rm -rf .cache
rm -rf build
rm -rf .eslintcache

# Clear webpack cache
rm -rf node_modules/.cache/webpack 2>/dev/null || true

# Reinstall dependencies
echo "Reinstalling dependencies..."
pnpm install

echo ""
echo "✅ Done! Please restart your dev server with: pnpm start"
echo ""
echo "If the issue persists, try:"
echo "  1. Stop the dev server (Ctrl+C)"
echo "  2. Run: rm -rf node_modules && pnpm install"
echo "  3. Restart: pnpm start"









