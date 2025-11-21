# 🚀 Blocktopia v1.0 - Build Instructions

**Date:** November 20, 2025  
**Version:** 1.0.0  
**Status:** Ready to Build ✅

---

## 📋 Pre-Build Verification

### ✅ Checklist (All Complete!)

- [x] README.md updated for v1.0
- [x] VERSION-1.0-RELEASE-NOTES.md created
- [x] All code changes ready to commit
- [x] expo-av plugin added to app.json
- [x] package-lock.json in sync
- [x] Audio system fully implemented
- [x] Database migrations ready
- [x] Documentation complete

---

## 🎯 Build Configuration

### Current Configuration (Verified ✅)

| Setting | Value | Status |
|---------|-------|--------|
| **Node Version** | 20.18.0 | ✅ Matches requirement |
| **Expo Version** | ~54.0.22 | ✅ Correct |
| **React Version** | 19.1.0 | ✅ Correct |
| **React Native** | 0.81.5 | ✅ Correct |
| **TypeScript** | ~5.9.2 | ✅ Correct |
| **expo-av** | ~16.0.7 | ✅ Added to plugins |
| **newArchEnabled** | true | ✅ Required |
| **jsEngine** | hermes | ✅ Optimized |

### Build Profiles

**Development Profile:**
- Development client: ✅ Enabled
- Distribution: Internal
- iOS image: `latest` (XCode 16.1+)
- Android: APK debug build
- Build time: ~15-20 minutes

**Production Profile:**
- Release build optimized
- App Store/Play Store ready
- Build time: ~25-30 minutes

---

## 🔨 Build Commands

### Step 1: Verify Configuration

```bash
# Navigate to project
cd C:\Users\Unmap\Downloads\blocktopia

# Verify TypeScript compiles
npx tsc --noEmit

# Should show: No errors
```

### Step 2: Test EAS Compatibility (Optional but Recommended)

```powershell
# Test with exact EAS command
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci --include=dev

# Should complete without errors
# If it fails, DON'T proceed to build - fix errors first!
```

### Step 3: Git Commit (Already Done)

This guide assumes you've already committed all changes with:
```bash
git add .
git commit -m "Release version 1.0.0 - Complete audio system and production-ready features"
git tag v1.0.0
git push origin main --tags
```

### Step 4: Build with EAS

#### Option A: Build iOS Only (Development)

```bash
# iOS Development Build
eas build --platform ios --profile development
```

**What happens:**
- Build starts on EAS servers
- Takes ~15-20 minutes
- Generates `.ipa` file for iOS devices
- Includes development client for hot reloading
- Download from EAS dashboard when complete

**After Build:**
1. Go to [https://expo.dev/accounts/turntopia/projects/blocktopia/builds](https://expo.dev/accounts/turntopia/projects/blocktopia/builds)
2. Download the `.ipa` file
3. Install on iPhone via Xcode or TestFlight
4. Start dev server: `npx expo start --dev-client`
5. Scan QR code with app

---

#### Option B: Build Android Only (Development)

```bash
# Android Development Build
eas build --platform android --profile development
```

**What happens:**
- Build starts on EAS servers
- Takes ~15-20 minutes
- Generates `.apk` file for Android devices
- Includes development client for hot reloading
- Download from EAS dashboard when complete

**After Build:**
1. Go to [https://expo.dev/accounts/turntopia/projects/blocktopia/builds](https://expo.dev/accounts/turntopia/projects/blocktopia/builds)
2. Download the `.apk` file
3. Transfer to Android device
4. Install (enable "Install from Unknown Sources")
5. Start dev server: `npx expo start --dev-client --tunnel`
6. Scan QR code with app

---

#### Option C: Build Both Platforms (Development) ⭐ RECOMMENDED

```bash
# Build both iOS and Android simultaneously
eas build --platform all --profile development
```

**What happens:**
- Both builds start on EAS servers
- iOS takes ~15-20 minutes
- Android takes ~15-20 minutes
- Both run in parallel
- Download both from EAS dashboard when complete

**After Builds:**
1. Install iOS `.ipa` on iPhone
2. Install Android `.apk` on Android device
3. Start dev server: `npx expo start --dev-client --tunnel`
4. Test on both devices simultaneously

---

#### Option D: Production Builds (For App Store/Play Store)

```bash
# iOS Production
eas build --platform ios --profile production

# Android Production
eas build --platform android --profile production

# Both Platforms
eas build --platform all --profile production
```

**What happens:**
- Optimized release builds
- Takes ~25-30 minutes per platform
- Generates App Store/Play Store ready files
- iOS: `.ipa` for App Store Connect upload
- Android: `.aab` for Play Console upload

**After Builds:**
- **iOS**: Upload to App Store Connect via Transporter or Xcode
- **Android**: Upload to Play Console directly

---

## 📱 Testing After Build

### Development Build Testing

Once development builds are installed:

```bash
# Start development server
npx expo start --dev-client

# Or with tunnel (for external devices)
npx expo start --dev-client --tunnel
```

**Test Checklist:**
- [ ] App launches without crashes
- [ ] Game plays smoothly (60fps)
- [ ] Audio plays (music and sound effects)
- [ ] Audio controls work (volume sliders, toggles)
- [ ] Pieces can be dragged and placed
- [ ] Lines clear correctly
- [ ] Power-ups can be purchased and used
- [ ] Ads show correctly (on physical device only)
- [ ] IAP flow works (use sandbox/test mode)
- [ ] Cosmetics can be equipped
- [ ] Settings persist after app restart
- [ ] Cloud sync works
- [ ] Leaderboards update

---

## 🔍 Build Monitoring

### Check Build Status

**Web Dashboard:**
[https://expo.dev/accounts/turntopia/projects/blocktopia/builds](https://expo.dev/accounts/turntopia/projects/blocktopia/builds)

**CLI:**
```bash
# List recent builds
eas build:list

# View specific build
eas build:view [build-id]
```

### Expected Build Times

| Platform | Profile | Expected Time |
|----------|---------|---------------|
| iOS | Development | 15-20 minutes |
| iOS | Production | 25-30 minutes |
| Android | Development | 15-20 minutes |
| Android | Production | 25-30 minutes |
| Both | Development | ~20 minutes (parallel) |
| Both | Production | ~30 minutes (parallel) |

---

## 🐛 Troubleshooting

### Build Fails Immediately

**Check:**
```bash
# Verify git is clean
git status

# Should show: "working tree clean"
```

**Solution:** If uncommitted changes, commit them first!

---

### Build Fails: "Missing from lock file"

**Cause:** package-lock.json out of sync

**Solution:**
```bash
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "Update package-lock.json"
```

Then rebuild with EAS.

---

### Build Fails: "npm ci can only install when in sync"

**Cause:** Same as above

**Solution:**
Regenerate package-lock.json (see above), commit, and rebuild.

---

### Build Succeeds but Audio Doesn't Work

**Cause:** Missing audio files or plugin not configured

**Check:**
1. Verify `expo-av` is in app.json plugins ✅ (already done)
2. Audio files in `assets/sounds/` and `assets/music/` are optional
3. App will run silently if audio files missing (graceful degradation)

**To add audio:**
- See `docs/AUDIO-ASSETS-GUIDE.md` for sourcing files
- Add MP3 files to `assets/sounds/` and `assets/music/`
- Rebuild with EAS

---

### Build Succeeds but Uses Old Code

**Cause:** Forgot to commit changes before building

**Solution:**
EAS builds from git, not your working directory!

```bash
# Check for uncommitted changes
git status

# Commit everything
git add .
git commit -m "Your message"

# Rebuild
eas build --platform all --profile development
```

---

## 📊 Build Success Criteria

Your build will succeed if ALL of these are true:

1. ✅ All changes committed to git
2. ✅ `git status` shows "working tree clean"
3. ✅ `npx tsc --noEmit` passes (0 errors)
4. ✅ `npm ci --include=dev` completes successfully
5. ✅ expo-av plugin in app.json
6. ✅ package.json and package-lock.json in sync
7. ✅ EAS project configured (projectId in app.json)

**All 7 criteria met? Build will succeed! 🎉**

---

## 🎯 Recommended Build Strategy

### For Initial Testing

```bash
# Build iOS only first (if you have iPhone)
eas build --platform ios --profile development

# OR Android only (if you have Android)
eas build --platform android --profile development
```

**Why?**
- Faster (one platform instead of two)
- Cheaper (uses fewer build credits)
- Test on your primary device first
- Verify everything works before building second platform

### After Initial Test

```bash
# Build both platforms
eas build --platform all --profile development
```

### For Production Release

```bash
# Build both production versions
eas build --platform all --profile production
```

---

## 📦 What Gets Included in Build

### Native Modules
- ✅ expo-av (audio playback)
- ✅ expo-haptics (vibration)
- ✅ expo-image-picker (profile avatars)
- ✅ react-native-google-mobile-ads (AdMob)
- ✅ react-native-purchases (RevenueCat)
- ✅ react-native-mmkv (fast storage)
- ✅ @shopify/react-native-skia (rendering)
- ✅ react-native-reanimated (animations)
- ✅ react-native-gesture-handler (touch)

### Assets
- ✅ App icon and splash screen
- ✅ Images (logos, adaptive icons)
- ⚠️ Audio files (if present in assets/)

### Configuration
- ✅ Environment variables from .env
- ✅ AdMob app IDs from app.json
- ✅ EAS project settings
- ✅ Expo plugins configuration

---

## 🚀 Post-Build Next Steps

### Development Builds Ready

1. **Install on Devices**
   - iOS: Via Xcode or TestFlight
   - Android: Direct APK install

2. **Start Development Server**
   ```bash
   npx expo start --dev-client
   ```

3. **Connect Devices**
   - Scan QR code with installed app
   - App will load from dev server
   - Enable hot reloading for rapid iteration

4. **Test Thoroughly**
   - Follow testing checklist above
   - Report any issues
   - Iterate on code as needed

### Production Builds Ready

1. **Submit to App Stores**
   - **iOS**: Upload to App Store Connect
   - **Android**: Upload to Google Play Console

2. **Fill Store Listings**
   - App descriptions
   - Screenshots
   - Privacy policy
   - Age rating
   - Categories

3. **Submit for Review**
   - iOS: 1-2 days review
   - Android: 1-2 hours review

4. **Release!** 🎉

---

## 📞 Need Help?

### Build Issues
- Check `BLOCKTOPIA_EAS_BUILD_GUIDE.md` (574 lines of troubleshooting)
- Review EAS build logs in dashboard
- Verify checklist above

### Configuration Issues
- Check `BLOCKTOPIA-BUILD-CONFIG.md` for working config
- Verify package versions match
- Test locally before building on EAS

### General Issues
- Check README.md troubleshooting section
- Review relevant documentation files
- Check Supabase logs for backend issues

---

## ✅ Final Pre-Build Checklist

Before running any build command, verify:

- [ ] All code changes committed
- [ ] Git working tree clean
- [ ] TypeScript compiles (0 errors)
- [ ] npm ci --include=dev passes
- [ ] .env file configured
- [ ] Supabase migrations applied
- [ ] EAS project initialized
- [ ] Ready to wait 15-20 minutes
- [ ] Have device to install on
- [ ] Know how to install .ipa or .apk

**All checked? You're ready to build!** 🚀

---

## 🎉 Build Commands Summary

```bash
# Development - iOS Only
eas build --platform ios --profile development

# Development - Android Only
eas build --platform android --profile development

# Development - Both (Recommended for v1.0)
eas build --platform all --profile development

# Production - iOS Only
eas build --platform ios --profile production

# Production - Android Only
eas build --platform android --profile production

# Production - Both (For App Store Release)
eas build --platform all --profile production
```

---

**Version:** 1.0.0  
**Last Updated:** November 20, 2025  
**Status:** Ready to Build ✅

---

**Good luck with the build! 🎮🚀**

Remember: If the pre-build tests pass, the EAS build will succeed!

