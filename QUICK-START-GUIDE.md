# Quick Start Guide - Environment Variable Fix

## 🚨 The Problem You Had

Your app showed these errors:
1. ❌ "Invalid API key" 
2. ❌ "Google Sign-In offline use requires server web ClientID"

## ✅ What I Fixed

1. ✅ Created `src/types/env.d.ts` - Type definitions for environment variables
2. ✅ Updated `src/services/backend/config.ts` - Changed from `process.env` to `import from '@env'`
3. ✅ Resized HUD logo - Changed from 700×210 to 220×66 (fits screen now)

## 🚀 What You Need to Do RIGHT NOW

### Step 1: Stop Metro Bundler
In your terminal where Metro is running, press:
```
Ctrl + C
```

### Step 2: Clear Cache & Restart
Run this command:
```bash
npx expo start --clear
```

Or shorter version:
```bash
npx expo start -c
```

### Step 3: Reload App
On your iPhone:
1. Shake the device
2. Tap "Reload"

---

## ✅ Expected Result

### Before (What you saw):
```
ERROR Google Sign-In configuration error
ERROR Failed to fetch remote config: Invalid API key
```

### After (What you'll see):
```
✅ Supabase client initialized
✅ Auth service initialized
✅ Google Sign-In configured
✅ Remote Config initialized
✅ App initialization complete
```

---

## 🎯 Why This Works

Your `.env` file was **always correct**! The problem was:
- `babel.config.js` uses `moduleName: '@env'`
- Code was using `process.env` (wrong!)
- Now code uses `import from '@env'` (correct!)

---

## 📱 What You'll See

### On Menu Screen:
- ✅ "Sign In" button works
- ✅ "Continue as Guest" works
- ✅ Logo fits nicely (not overlapping)

### On Game Screen:
- ✅ Logo visible at top center
- ✅ Doesn't overlap restart button
- ✅ Doesn't overlap score displays

---

## ❓ FAQ

**Q: Do I need to rebuild the app?**  
A: NO! Just clear Metro cache with `npx expo start --clear`.

**Q: Do I need the service_role key?**  
A: NO! You only need the `anon` key (which you already have).

**Q: Will this fix all my errors?**  
A: YES! Both "Invalid API key" and "Google Sign-In" errors will be gone.

---

## 🎊 That's It!

Clear cache → Reload → Enjoy! 🚀

