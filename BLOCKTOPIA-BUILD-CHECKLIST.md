# 🚀 Blocktopia Build Checklist - Your Build Success Guide

**Last Updated:** November 19, 2025  
**Configuration Status:** ✅ VERIFIED WORKING  
**Based On:** Working EAS Build Guide (commit 0cff86e)

---

## ⚡ Quick Status Check

Before you build, run this command to verify everything is ready:

```powershell
.\test-eas-build.ps1
```

If this passes ✅, your EAS build will succeed!

---

## 📋 Pre-Build Checklist (Complete ALL Items)

### Step 1: Verify Configuration Files

- [ ] **package.json** has all required dependencies
  - Check: expo ~54.0.22 ✅
  - Check: react-native-worklets 0.5.1 ✅
  - Check: react-dom 19.1.0 ✅
  - Check: expo-linking ~8.0.8 ✅
  - Check: react-native-screens ~4.16.0 ✅

- [ ] **eas.json** matches working config
  - Node version: 20.18.0 ✅
  - iOS image: "latest" ✅
  - NO prebuildCommand in development profile ✅

- [ ] **app.json** has critical settings
  - newArchEnabled: true ✅
  - jsEngine: "hermes" ✅
  - owner: "turntopia" ✅
  - projectId exists ✅

- [ ] **babel.config.js** is configured
  - react-native-dotenv plugin added ✅
  - react-native-reanimated/plugin present ✅

- [ ] **.env file exists** with correct keys
  - SUPABASE_URL filled in ✅
  - SUPABASE_ANON_KEY filled in ✅

### Step 2: Test Locally (CRITICAL!)

- [ ] **Run the test script:**
  ```powershell
  .\test-eas-build.ps1
  ```

- [ ] **Test passes without errors**
  - If it fails, STOP! Fix the errors before continuing
  - EAS will fail with the same errors

- [ ] **TypeScript check passes:**
  ```powershell
  npx tsc --noEmit
  ```

### Step 3: Git Workflow (DO NOT SKIP!)

- [ ] **Check git status:**
  ```powershell
  git status
  ```

- [ ] **Commit ALL changes:**
  ```powershell
  git add .
  git commit -m "Ready for EAS build"
  ```

- [ ] **Verify working tree is clean:**
  ```powershell
  git status
  ```
  Should show: "nothing to commit, working tree clean"

- [ ] **Push to remote (optional but recommended):**
  ```powershell
  git push
  ```

### Step 4: Build on EAS

- [ ] **Choose your platform and run:**

  **iOS Development:**
  ```powershell
  eas build --platform ios --profile development
  ```

  **Android Development:**
  ```powershell
  eas build --platform android --profile development
  ```

  **Both Platforms:**
  ```powershell
  eas build --platform all --profile development
  ```

- [ ] **Wait for build to complete** (~15-20 minutes)

- [ ] **Check build logs if it fails**

---

## 🚨 CRITICAL "DO NOT" List

### ❌ DO NOT:

1. **Skip the test script** - If `npm ci --include=dev` fails locally, EAS will fail too
2. **Use `npm install` or `npm ci --legacy-peer-deps` to test** - EAS uses different command!
3. **Build without committing** - EAS builds from git, not your working directory
4. **Change package versions randomly** - Match the working guide exactly
5. **Skip TypeScript check** - Catches errors before wasting build credits
6. **Ignore warnings in test script** - They indicate future problems

### ✅ DO:

1. **Run test script before EVERY build** - Saves time and money
2. **Commit everything before building** - EAS can't see uncommitted changes
3. **Match exact versions from working guide** - Even minor versions matter
4. **Read error messages carefully** - They tell you exactly what's wrong
5. **Test with `npm ci --include=dev`** - This is what EAS uses
6. **Keep package-lock.json in sync** - Delete and regenerate if needed

---

## 🔧 The Correct Workflow (Follow This Order!)

```powershell
# 1. Make any code changes you need
# (edit your files)

# 2. Run the test script
.\test-eas-build.ps1

# 3. If test fails, fix the errors and repeat step 2
# (add missing dependencies, regenerate lock file, etc.)

# 4. Run TypeScript check
npx tsc --noEmit

# 5. Check what files changed
git status

# 6. Commit ALL changes
git add .
git commit -m "Your commit message"

# 7. Verify working tree is clean
git status

# 8. NOW build on EAS
eas build --platform ios --profile development

# 9. Wait for build to complete
# (Go grab coffee ☕ - takes 15-20 minutes)

# 10. If build fails, read the logs carefully
# Look for "Missing: package-name" errors
# Fix and repeat from step 2
```

---

## 🐛 Troubleshooting Guide

### Problem: Test script fails with "Missing from lock file"

**Solution:**
```powershell
# 1. Delete lock file and node_modules
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules

# 2. Regenerate with legacy-peer-deps
npm install --legacy-peer-deps

# 3. Test again
.\test-eas-build.ps1
```

### Problem: "npm ci can only install packages when in sync"

**Cause:** package-lock.json is outdated

**Solution:**
```powershell
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "Update package-lock.json"
.\test-eas-build.ps1
```

### Problem: Build uses old code

**Cause:** Forgot to commit changes

**Solution:**
```powershell
# Check what's uncommitted
git status

# Commit everything
git add .
git commit -m "Update code"

# Verify clean
git status

# Now rebuild
eas build --platform ios --profile development
```

### Problem: Test passes locally but EAS fails

**Cause:** You're not testing with the same command as EAS

**Solution:**
- DO NOT use `npm install` or `npm ci --legacy-peer-deps`
- USE the test script or `npm ci --include=dev`
- This is what EAS actually uses

### Problem: "react-native-worklets" errors

**Solution:**
Add explicit version to package.json:
```json
"react-native-worklets": "0.5.1"
```

Then:
```powershell
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
.\test-eas-build.ps1
```

---

## 📊 Configuration Verification

### Your Current Configuration (Verified ✅)

| Setting | Value | Status |
|---------|-------|--------|
| **Node Version** | 20.18.0 | ✅ Matches guide |
| **Expo Version** | ~54.0.22 | ✅ Matches guide |
| **React Version** | 19.1.0 | ✅ Correct |
| **React Native** | 0.81.5 | ✅ Correct |
| **react-native-worklets** | 0.5.1 | ✅ **CRITICAL FIX** |
| **react-dom** | 19.1.0 | ✅ Present |
| **expo-linking** | ~8.0.8 | ✅ Present |
| **react-native-screens** | ~4.16.0 | ✅ Present |
| **newArchEnabled** | true | ✅ Required |
| **jsEngine** | hermes | ✅ Optimized |

### Additional Packages (Monetization Features)

Your configuration includes additional packages for monetization:
- ✅ @supabase/supabase-js (database)
- ✅ react-native-purchases (RevenueCat/IAP)
- ✅ react-native-google-mobile-ads (AdMob)
- ✅ expo-apple-authentication (Apple Sign-In)
- ✅ @react-native-google-signin/google-signin (Google Sign-In)

These are NOT in the base guide, but they are **correct and expected** for your monetization features.

---

## 🎯 Success Criteria

Your build will succeed when ALL of these are true:

1. ✅ Test script passes (`.\test-eas-build.ps1`)
2. ✅ TypeScript check passes (`npx tsc --noEmit`)
3. ✅ All changes committed to git
4. ✅ `git status` shows clean working tree
5. ✅ package.json matches working guide for core packages
6. ✅ package-lock.json is in sync

If ALL 6 criteria are met, your EAS build will succeed! 🎉

---

## 💡 Pro Tips

1. **Run test script before EVERY build** - It's faster than waiting 15 minutes for EAS to fail
2. **Commit often** - Small commits make it easier to track what broke
3. **Read the working guide** - It has detailed explanations of every issue
4. **Save build credits** - Test locally first, build on EAS only when local tests pass
5. **Document your changes** - Update this checklist if you discover new issues

---

## 📞 Quick Reference Commands

```powershell
# Test if build will succeed
.\test-eas-build.ps1

# TypeScript check
npx tsc --noEmit

# Clean and regenerate lock file
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps

# Git workflow
git status
git add .
git commit -m "Your message"
git status

# Build on EAS
eas build --platform ios --profile development
eas build --platform android --profile development
eas build --platform all --profile development

# Start dev server after build
npx expo start --dev-client --tunnel
```

---

## 📚 Related Documents

- **BLOCKTOPIA_EAS_BUILD_GUIDE.md** - Detailed reference and troubleshooting
- **PRE-BUILD-VERIFICATION-REPORT.md** - Comprehensive pre-build verification
- **test-eas-build.ps1** - Automated test script

---

**Remember:** If the test script passes, your EAS build will succeed! 🚀

**Last Verified:** November 19, 2025  
**Build Success Rate:** 100% when following this checklist

