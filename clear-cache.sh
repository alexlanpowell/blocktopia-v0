#!/bin/bash
# ============================================================
# 🧹 Blocktopia - Clear All Caches Script (macOS/Linux)
# ============================================================

echo "🧹 Starting comprehensive cache clearing..."
echo ""

# Step 1: Clear Watchman
echo "Step 1/4: Clearing Watchman cache..."
if command -v watchman &> /dev/null; then
    npx watchman watch-del-all
    echo "✅ Watchman cache cleared!"
else
    echo "⚠️  Watchman not found. Install with: brew install watchman"
fi
echo ""

# Step 2: Clear node_modules/.cache
echo "Step 2/4: Clearing node_modules cache..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ node_modules/.cache deleted!"
else
    echo "ℹ️  node_modules/.cache doesn't exist (already clean)"
fi
echo ""

# Step 3: Clear .expo cache
echo "Step 3/4: Clearing .expo cache..."
if [ -d ".expo" ]; then
    rm -rf .expo
    echo "✅ .expo cache deleted!"
else
    echo "ℹ️  .expo doesn't exist (already clean)"
fi
echo ""

# Step 4: Clear Metro bundler cache
echo "Step 4/4: Clearing Metro bundler cache..."
npx expo start --clear

echo ""
echo "🎉 All caches cleared! Metro is starting with --clear flag..."
echo ""
echo "👀 Look for the debug output in the console:"
echo "   === 🔍 ENV DEBUG: Checking @env imports ==="
echo ""
echo "📸 Take a screenshot of the debug section and share it!"

