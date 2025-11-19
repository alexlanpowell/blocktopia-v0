# 🎯 Blocktopia EAS Build Guide - COMPLETE REFERENCE

**Status:** ✅ VERIFIED WORKING  
**Last Updated:** November 19, 2025  
**Build Status:** Successfully built and deployed  
**Final Working Commit:** `0cff86e`

---

## 📋 Table of Contents

1. [The Working Configuration](#the-working-configuration)
2. [Critical Issues We Fixed](#critical-issues-we-fixed)
3. [The Correct Build Workflow](#the-correct-build-workflow)
4. [Common Gotchas & Lessons Learned](#common-gotchas--lessons-learned)
5. [Quick Reference](#quick-reference)
6. [Troubleshooting Checklist](#troubleshooting-checklist)

---

## 🎯 The Working Configuration

### ✅ Final package.json Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@shopify/react-native-skia": "^2.3.13",
    "expo": "~54.0.22",                           // ← MUST match Unmap (not 54.0.25!)
    "expo-build-properties": "^1.0.9",
    "expo-dev-client": "~6.0.17",
    "expo-linking": "~8.0.8",                     // ← REQUIRED (was missing)
    "expo-router": "~6.0.13",
    "expo-status-bar": "~3.0.8",
    "immer": "^10.2.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",                        // ← REQUIRED (was missing)
    "react-native": "0.81.5",
    "react-native-gesture-handler": "^2.29.1",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "^5.6.2",
    "react-native-screens": "~4.16.0",            // ← REQUIRED (was missing)
    "react-native-worklets": "0.5.1",             // ← THE KEY FIX! Must be explicit
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  }
}
```

### ✅ eas.json Configuration

```json
{
  "cli": {
    "version": ">= 13.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "node": "20.18.0",                    // ← Must match Unmap
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "image": "latest",                  // ← CRITICAL: Ensures XCode 16.1+
        "resourceClass": "m-medium",
        "simulator": false
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "prebuildCommand": "npx expo prebuild --clean"
    },
    "production": {
      "prebuildCommand": "npx expo prebuild --clean"
    }
  },
  "submit": {
    "production": {}
  }
}
```

**IMPORTANT:** No `prebuildCommand` in development profile!

### ✅ app.json Critical Settings

```json
{
  "expo": {
    "name": "blocktopia",
    "slug": "blocktopia",
    "owner": "turntopia",                   // ← Your EAS organization
    "newArchEnabled": true,                 // ← Required by Reanimated 4.x
    "jsEngine": "hermes",                   // ← Performance optimization
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"      // ← Set by eas init
      }
    }
  }
}
```

---

## 🚨 Critical Issues We Fixed

### Issue #1: Missing Peer Dependencies

**Problem:** Initial `package.json` was missing required peer dependencies for expo-router.

**Symptoms:**
```
npm error Missing: react-dom@19.2.0 from lock file
npm error Missing: react-native-screens@4.18.0 from lock file
npm error Missing: expo-linking@8.0.9 from lock file
```

**Solution:** Added to package.json:
- `react-dom`: Required by React 19 and expo-router
- `expo-linking`: Required by expo-router for deep linking
- `react-native-screens`: Required by expo-router for navigation

**Lesson:** expo-router has peer dependencies that must be explicitly listed.

---

### Issue #2: Missing react-native-worklets ⚠️ THE KEY FIX

**Problem:** `react-native-worklets` was not explicitly in package.json, causing npm to try resolving version 0.6.1 (wrong) instead of 0.5.1 (correct).

**Symptoms:**
```
npm error Missing: react-native-worklets@0.6.1 from lock file
npm error Missing: @babel/plugin-transform-template-literals@7.27.1 from lock file
npm error Missing: semver@7.7.2 from lock file
```

**Why This Happened:**
- react-native-reanimated depends on react-native-worklets
- Without explicit version, npm ci tries to resolve latest (0.6.1)
- With `--legacy-peer-deps`, npm ignores this, but EAS doesn't use that flag
- EAS uses `npm ci --include=dev` which requires exact versions

**Solution:** Added `"react-native-worklets": "0.5.1"` to package.json (matching Unmap).

**Lesson:** 
- **Always test with `npm ci --include=dev`** (not `--legacy-peer-deps`)
- Peer dependencies of dependencies should be explicit

---

### Issue #3: Expo Version Mismatch

**Problem:** Blocktopia had `expo: "~54.0.25"` while Unmap working config uses `"~54.0.22"`.

**Impact:** Different sub-dependency versions can cause build failures.

**Solution:** Aligned to `"~54.0.22"` to match proven working config.

**Lesson:** Match EXACT versions from working config, even minor versions.

---

### Issue #4: package-lock.json Out of Sync

**Problem:** After changing package.json, package-lock.json wasn't properly regenerated.

**Symptoms:**
```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

**Solution:**
```bash
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

**Lesson:** Always regenerate lock file after dependency changes.

---

### Issue #5: Forgot to Commit to Git

**Problem:** Made changes to package.json and package-lock.json but didn't commit before running EAS build.

**Impact:** EAS builds from the **committed** state, not working directory. Build used old files!

**Solution:**
```bash
git add package.json package-lock.json
git commit -m "Fix dependencies"
eas build --platform ios --profile development
```

**Lesson:** 
- **ALWAYS commit before building**
- EAS doesn't see uncommitted changes
- Check `git status` before `eas build`

---

### Issue #6: Testing with Wrong npm Command

**Problem:** We tested locally with `npm ci --legacy-peer-deps` but EAS uses `npm ci --include=dev`.

**Impact:** Tests passed locally but failed on EAS!

**The Difference:**
- `npm ci --legacy-peer-deps`: Ignores peer dependency conflicts
- `npm ci --include=dev`: Strict mode, requires all dependencies in lock file

**Solution:** Always test with the **exact** command EAS uses:
```bash
Remove-Item -Recurse -Force node_modules
npm ci --include=dev
```

**Lesson:** 
- **Test with the exact EAS command**
- Local passing ≠ EAS passing unless you use same command
- This was the breakthrough moment!

---

## ✅ The Correct Build Workflow

### Step-by-Step Process

```bash
# 1. Make dependency changes to package.json
# (edit package.json)

# 2. Clean everything
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules

# 3. Install with legacy-peer-deps (for initial generation)
npm install --legacy-peer-deps

# 4. ⚠️ CRITICAL TEST: Use exact EAS command
Remove-Item -Recurse -Force node_modules
npm ci --include=dev

# 5. If step 4 passes, verify TypeScript
npx tsc --noEmit

# 6. Check git status
git status

# 7. Commit EVERYTHING
git add package.json package-lock.json
git commit -m "Your commit message"

# 8. Verify working tree is clean
git status

# 9. NOW build on EAS
eas build --platform ios --profile development

# 10. Wait for build to complete (~15-20 minutes)
```

### Why This Order Matters

1. **npm install --legacy-peer-deps**: Generates initial lock file
2. **npm ci --include=dev**: Tests if EAS will succeed (critical!)
3. **npx tsc --noEmit**: Catches TypeScript errors before building
4. **git commit**: EAS needs committed files
5. **eas build**: Only after all local tests pass

---

## ⚠️ Common Gotchas & Lessons Learned

### 1. EAS Uses Different npm Command Than You Might Think

**What You Might Use:**
```bash
npm install --legacy-peer-deps
npm ci --legacy-peer-deps
```

**What EAS Actually Uses:**
```bash
npm ci --include=dev
```

**Impact:** Your local tests can pass while EAS fails!

**Solution:** Always test with `npm ci --include=dev` before building.

---

### 2. EAS Builds from Git, Not Working Directory

**Common Mistake:**
```bash
# Make changes to package.json
npm install
eas build  # ❌ WRONG - uses old committed files!
```

**Correct:**
```bash
# Make changes to package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
eas build  # ✅ CORRECT - uses new committed files
```

---

### 3. package-lock.json Must Be in Sync

**Signs of Out-of-Sync:**
- "Missing: package-name@version from lock file"
- npm ci fails but npm install works

**Fix:**
```bash
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

---

### 4. Peer Dependencies Must Be Explicit

**Don't Assume:**
- "expo-router will install react-dom for me" ❌
- "react-native-reanimated will handle worklets" ❌

**Do Explicitly Add:**
- All peer dependencies to package.json ✅
- Even transitive dependencies if npm ci complains ✅

---

### 5. Match Working Config Exactly

**Don't:**
- Use latest versions "because newer is better" ❌
- Change minor versions "it's just 54.0.25 vs 54.0.22" ❌

**Do:**
- Match EXACT versions from working config ✅
- Use tilde (~) or caret (^) same as working config ✅

---

## 🚀 Quick Reference

### Pre-Build Checklist

- [ ] All dependencies added to package.json
- [ ] `npm install --legacy-peer-deps` completed
- [ ] `npm ci --include=dev` passes ✅ (CRITICAL!)
- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] All changes committed to git
- [ ] `git status` shows "working tree clean"
- [ ] EAS project configured (projectId in app.json)

### Essential Commands

```bash
# Clean and install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps

# Test (use EAS command!)
Remove-Item -Recurse -Force node_modules
npm ci --include=dev

# TypeScript check
npx tsc --noEmit

# Git workflow
git status
git add package.json package-lock.json
git commit -m "Update dependencies"
git push

# EAS build
eas build --platform ios --profile development

# Start dev server
npm run dev:client:tunnel
# or
npx expo start --dev-client --tunnel
```

### When Build Fails

1. **Read the error carefully** - look for "Missing: package-name" lines
2. **Check if it's a git issue** - did you commit?
3. **Test locally first:**
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm ci --include=dev
   ```
4. **If local test fails** - that's why EAS failed!
5. **Fix the package.json** - add missing dependencies
6. **Regenerate lock file** - delete and npm install
7. **Test again** - npm ci --include=dev must pass
8. **Commit** - then rebuild

---

## 🔍 Troubleshooting Checklist

### Build Fails with "Missing from lock file"

```
✓ Check package.json has all peer dependencies
✓ Delete package-lock.json and node_modules
✓ Run npm install --legacy-peer-deps
✓ Test with npm ci --include=dev (not --legacy-peer-deps!)
✓ Commit package.json and package-lock.json
✓ Rebuild
```

### Build Uses Old Code

```
✓ Check git status - anything uncommitted?
✓ Commit all changes
✓ Verify with git log
✓ Rebuild - EAS will use latest commit
```

### "npm ci can only install packages when in sync"

```
✓ This means package-lock.json is outdated
✓ Delete both package-lock.json and node_modules
✓ Run npm install --legacy-peer-deps
✓ Commit the new package-lock.json
✓ Rebuild
```

### Build Passes Locally But Fails on EAS

```
✓ Are you testing with npm ci --include=dev?
✓ Or are you using npm install / npm ci --legacy-peer-deps?
✓ EAS uses npm ci --include=dev (strict mode)
✓ Test with that exact command
```

### "react-native-worklets" Version Errors

```
✓ Add explicit version to package.json: "react-native-worklets": "0.5.1"
✓ This package MUST be explicit, not implicit
✓ Version 0.5.1 (not 0.6.1) for React Native 0.81.5
```

---

## 📊 What Changed from Initial Config

| Setting | Before (Failed) | After (Works) | Why |
|---------|-----------------|---------------|-----|
| expo | ~54.0.25 | ~54.0.22 | Match Unmap exact version |
| react-dom | ❌ Missing | 19.1.0 | Required by expo-router |
| expo-linking | ❌ Missing | ~8.0.8 | Required by expo-router |
| react-native-screens | ❌ Missing | ~4.16.0 | Required by expo-router |
| react-native-worklets | ❌ Missing | 0.5.1 | **THE KEY FIX** - must be explicit |
| Test command | npm ci --legacy-peer-deps | npm ci --include=dev | Match EAS exact command |
| Git workflow | ❌ Sometimes forgot | ✅ Always commit first | EAS builds from git |

---

## 🎉 Success Criteria

Your build will succeed when:

1. ✅ `npm ci --include=dev` passes locally
2. ✅ `npx tsc --noEmit` shows 0 errors
3. ✅ All changes committed to git
4. ✅ `git status` shows clean working tree
5. ✅ package.json matches working Unmap config
6. ✅ package-lock.json is in sync with package.json

---

## 📚 Related Files

- `package.json` - Dependencies (must match this guide)
- `package-lock.json` - Generated lock file (commit this!)
- `eas.json` - Build configuration
- `app.json` - App configuration
- `BLOCKTOPIA-BUILD-CONFIG.md` - Quick reference
- `WORKING_BUILD_CONFIGURATION.md` - Unmap reference config

---

## 🔄 When to Use This Guide

### Before Making Dependency Changes
- Read this guide first
- Check what versions Unmap uses
- Follow the correct workflow

### When Build Fails
- Read error message carefully
- Use troubleshooting checklist
- Test locally with correct command

### When Onboarding New Developers
- Share this guide
- Emphasize: test with `npm ci --include=dev`
- Emphasize: always commit before building

---

## ⚡ Pro Tips

1. **Bookmark the Unmap working config** - it's your source of truth
2. **Always test locally before EAS** - saves build credits and time
3. **Use the exact EAS command** - `npm ci --include=dev`
4. **Commit often** - EAS can't see uncommitted changes
5. **Version match exactly** - even minor versions matter
6. **Document your changes** - update this guide if needed

---

## 📞 Emergency Recovery

If everything is broken and you need to start fresh:

```bash
# 1. Go back to working commit
git log --oneline
git checkout 0cff86e  # The last working commit

# 2. Clean everything
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -Force

# 3. Fresh install
npm install --legacy-peer-deps

# 4. Test
npm ci --include=dev

# 5. If test passes, build
eas build --platform ios --profile development
```

---

**Last Verified:** November 19, 2025  
**Build Count to Success:** 6 failed builds → 1 successful build  
**Key Learning:** Test with `npm ci --include=dev` before EAS build  
**Critical Fix:** Adding `react-native-worklets: "0.5.1"` explicitly

**Status:** ✅ PRODUCTION READY

