# 🔍 Environment Variables Deep Dive Debug Guide

## Current Status
You're still getting errors even after the code fix. This means **Metro cache was not fully cleared** and is still using the old bundled code.

---

## What I Just Added

### Debug Logs in `src/services/backend/config.ts`
The app will now show detailed debug information when it loads, telling us EXACTLY what values are being imported from `@env`.

### What You'll See in Console:

**Scenario 1: Cache Not Cleared (OLD CODE STILL RUNNING)**
```
=== 🔍 ENV DEBUG: Checking @env imports ===
SUPABASE_URL: { type: 'undefined', hasValue: false, length: 0, preview: 'EMPTY/UNDEFINED' }
```
**Solution:** Clear all caches properly (see below)

---

**Scenario 2: .env File Has Issues**
```
=== 🔍 ENV DEBUG: Checking @env imports ===
SUPABASE_URL: { type: 'string', hasValue: false, length: 0, preview: 'EMPTY/UNDEFINED' }
```
**Solution:** Check your `.env` file format (see below)

---

**Scenario 3: Everything Works! ✅**
```
=== 🔍 ENV DEBUG: Checking @env imports ===
SUPABASE_URL: { type: 'string', hasValue: true, length: 42, preview: 'https://ueicvwpgkoexm1pqx...' }
SUPABASE_ANON_KEY: { type: 'string', hasValue: true, length: 185, preview: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' }
GOOGLE_WEB_CLIENT_ID: { type: 'string', hasValue: true, length: 72, preview: '1234567890-abcdefghijklmnop...' }
```
**Solution:** If you still get errors after this, the keys in your `.env` are incorrect/invalid

---

## 🧹 COMPREHENSIVE CACHE CLEARING GUIDE

### Why Standard `--clear` Isn't Enough
React Native has MULTIPLE cache layers:
1. **Metro Bundler Cache** - Cached JavaScript bundles
2. **Babel Transform Cache** - Cached transformations (in `node_modules/.cache/babel-loader`)
3. **Watchman Cache** - File watcher cache
4. **Haste Map Cache** - Module resolution cache

### Step-by-Step Instructions:

#### Step 1: Stop Metro
Press `Ctrl+C` in your terminal to stop the current Metro process.

#### Step 2: Clear Watchman Cache (CRITICAL)
```bash
npx watchman watch-del-all
```

If you get an error, install Watchman:
- **Windows:** Download from https://facebook.github.io/watchman/docs/install#windows
- **macOS:** `brew install watchman`

#### Step 3: Clear Node Modules Cache
```bash
# macOS/Linux:
rm -rf node_modules/.cache

# Windows (PowerShell):
Remove-Item -Recurse -Force node_modules\.cache

# Windows (CMD):
rmdir /s /q node_modules\.cache
```

#### Step 4: Clear Expo/Metro Cache
```bash
npx expo start --clear
```

#### Step 5: Force Reload on Device
Once Metro starts:
- **iOS:** Shake device → "Reload"
- **Android:** Shake device → "Reload" or press `r` in terminal

---

## 🚨 NUCLEAR OPTION (If Above Doesn't Work)

If the above steps don't work, do a complete rebuild:

```bash
# Step 1: Stop Metro (Ctrl+C)

# Step 2: Delete all caches and node_modules
rm -rf node_modules
rm -rf .expo

# Windows:
# rmdir /s /q node_modules
# rmdir /s /q .expo

# Step 3: Reinstall
npm install

# Step 4: Clear and restart
npx expo start --clear
```

---

## ✅ Verify Your .env File Format

### ❌ WRONG FORMAT (Will Fail):

```env
# Spaces around equals sign
SUPABASE_URL = https://your-project.supabase.co

# Quotes (sometimes causes issues with react-native-dotenv)
SUPABASE_URL="https://your-project.supabase.co"

# Inline comments
SUPABASE_URL=https://your-project.supabase.co # my url

# Trailing spaces
SUPABASE_URL=https://your-project.supabase.co   
```

### ✅ CORRECT FORMAT:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWN2d3Bna29leG0xcHF4a2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNTIzNDgsImV4cCI6MjA0NzYyODM0OH0.abc123def456
GOOGLE_WEB_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=1234567890-iosspecificid.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=1234567890-androidspecificid.apps.googleusercontent.com
REVENUECAT_API_KEY_IOS=rcb_your_ios_api_key_here
REVENUECAT_API_KEY_ANDROID=rcb_your_android_api_key_here
ADMOB_APP_ID_IOS=ca-app-pub-1234567890123456~1234567890
ADMOB_APP_ID_ANDROID=ca-app-pub-1234567890123456~9876543210
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-1234567890123456/1234567890
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-1234567890123456/9876543210
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-1234567890123456/1111111111
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-1234567890123456/2222222222
```

**Rules:**
- NO spaces around `=`
- NO quotes (unless value contains spaces)
- NO inline comments
- NO trailing spaces or newlines
- File MUST be in root directory (`C:\Users\Unmap\Downloads\blocktopia\.env`)

---

## 📋 Quick Checklist

Before testing:
- [ ] Stop Metro (Ctrl+C)
- [ ] Run `npx watchman watch-del-all`
- [ ] Delete `node_modules/.cache` folder
- [ ] Run `npx expo start --clear`
- [ ] Force reload on device
- [ ] Check console for `=== 🔍 ENV DEBUG ===` output
- [ ] Take screenshot of debug output and share with me

---

## 🎯 What to Do Next

1. **Follow the cache clearing steps above**
2. **Restart Metro with `--clear` flag**
3. **Look for the debug output in console** (it will appear right at startup)
4. **Take a screenshot** of the `=== 🔍 ENV DEBUG ===` section
5. **Share it with me** so I can see exactly what's being loaded

The debug logs will definitively tell us if:
- Cache wasn't cleared (values undefined)
- .env file is wrong (values empty strings)
- Everything is loading but keys are invalid (values present but API rejects them)

---

## 🔑 Where to Get Your Supabase Keys

If you need to find your Supabase keys:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

**DO NOT use the `service_role` key** - that's for server-side only and should NEVER be in your app!

---

## ❓ Still Having Issues?

If after following ALL the steps above you still get errors, share with me:
1. Screenshot of the `=== 🔍 ENV DEBUG ===` console output
2. Screenshot of the error messages
3. Confirm you completed all cache clearing steps

I'll be able to diagnose the exact issue from the debug output!

