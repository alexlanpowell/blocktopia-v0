# 🚀 Blocktopia EAS Rebuild & Testing Commands

**Purpose:** Complete command reference for rebuilding and testing Blocktopia after MMKV and database fixes  
**Date:** November 20, 2025

---

## 📱 Phase 1: Database Migration (COMPLETE FIRST)

### Step 1: Copy Migration SQL

Open file: `supabase-game-sessions-add-updated-at.sql`

### Step 2: Run in Supabase

1. Go to: https://supabase.com
2. Select Blocktopia project
3. SQL Editor → New Query
4. Paste entire SQL file
5. Click **Run** (or Cmd/Ctrl + Enter)

### Step 3: Verify Success

Run this verification query:

```sql
-- Verify updated_at column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'game_sessions' 
  AND column_name = 'updated_at';
```

**Expected Output:**
```
column_name | data_type              | is_nullable
updated_at  | timestamp with time zone | NO
```

---

## 🔨 Phase 2: iOS Development Build (EAS)

### Trigger iOS Build

```bash
# Navigate to project
cd C:\Users\Unmap\Downloads\blocktopia

# Trigger iOS development build
eas build --platform ios --profile development

# Alternative: Force clean cache if needed
# eas build --platform ios --profile development --clear-cache
```

### Monitor Build Progress

**Option 1: Web Dashboard**
```
https://expo.dev/accounts/turntopia/projects/blocktopia/builds
```

**Option 2: CLI**
```bash
# List builds
eas build:list

# Watch specific build (replace with build ID from output)
eas build:view BUILD_ID
```

### Build Timeline

- ⏱️ **Queue time:** 0-5 minutes
- ⏱️ **Build time:** 15-20 minutes
- ⏱️ **Total:** ~20-25 minutes

### What Happens During Build

1. **Upload code** - Your TypeScript, assets, config
2. **Install dependencies** - npm packages from package.json
3. **Run expo prebuild** - Generates native iOS project
4. **Link native modules** - MMKV, expo-av, react-native-mmkv, etc.
5. **Compile iOS app** - XCode builds native code
6. **Sign & package** - Creates .ipa development client
7. **Upload artifact** - Available for download

---

## 📲 Phase 3: Install & Test

### Download Build

When build completes:

**Option 1: Direct Download**
1. Go to EAS dashboard
2. Click on completed build
3. Download .ipa file

**Option 2: CLI Download**
```bash
# Download latest iOS development build
eas build:download --platform ios --profile development
```

### Install on iPhone

**Using Xcode:**
1. Connect iPhone via USB
2. Open Xcode
3. Window → Devices and Simulators
4. Drag .ipa file onto your device

**Using Simulator:**
```bash
# Install on iOS Simulator (if you have it)
xcrun simctl install booted path/to/blocktopia.ipa
```

### Start Development Server

```bash
# In project directory
cd C:\Users\Unmap\Downloads\blocktopia

# Start Expo dev server
npx expo start --dev-client

# Alternative: Clear cache if needed
# npx expo start --dev-client --clear
```

### Open App on iPhone

1. Open **Blocktopia** app on your iPhone
2. Scan QR code from terminal
3. App loads with hot reload enabled

---

## 🧪 Phase 4: Comprehensive Testing

### Test 1: MMKV Local Persistence

```bash
# While app is running, watch console logs
```

**Test Scenario:**
1. Open app
2. Start a new game
3. Play 3-4 moves (place pieces)
4. **Kill app completely** (double-tap home, swipe up)
5. Reopen app
6. **Expected:** Game resumes exactly where you left off

**Console Verification:**
```
✅ Should see: [GamePersistence] Game state saved locally
❌ Should NOT see: MMKV not available
❌ Should NOT see: Cannot read property 'prototype' of undefined
```

### Test 2: Database Cloud Sync

**Test Scenario:**
1. Play a game to completion
2. Watch console logs

**Console Verification:**
```
✅ Should see: Successfully synced to cloud
❌ Should NOT see: PGRST204
❌ Should NOT see: Could not find the 'updated_at' column
```

**Supabase Verification:**
1. Go to Supabase dashboard
2. Table Editor → `game_sessions`
3. **Expected:** See your game session with `updated_at` timestamp

### Test 3: High Scores

**Test Scenario:**
1. Play a game, get score of 100
2. Kill app
3. Reopen app
4. Play again, get score of 200
5. Kill app
6. Reopen app

**Expected:**
- High score shows 200
- Persists across app restarts
- Syncs to Supabase

### Test 4: Audio Settings Persistence

**Test Scenario:**
1. Go to Settings
2. Change music volume to 30%
3. Change SFX volume to 50%
4. Disable music
5. Kill app
6. Reopen app
7. Go back to Settings

**Expected:**
- Music volume still at 30%
- SFX volume still at 50%
- Music still disabled

### Test 5: No Regressions

**Basic Gameplay:**
- [ ] App launches without crashes
- [ ] Main menu loads
- [ ] New game starts
- [ ] Pieces can be dragged
- [ ] Pieces snap to grid
- [ ] Lines clear correctly
- [ ] Score increments
- [ ] Game over detection works
- [ ] Restart button works

**Monetization:**
- [ ] Gem count displays
- [ ] Shop opens
- [ ] Power-ups selectable
- [ ] Banner ads load (if enabled)

**UI/UX:**
- [ ] All buttons respond
- [ ] Animations smooth (60fps)
- [ ] No visual glitches
- [ ] Settings panel works

---

## 🐛 Debugging Commands

### Check MMKV Installation

```bash
# Verify MMKV is in package.json
grep "react-native-mmkv" package.json

# Expected output:
# "react-native-mmkv": "^4.0.1"
```

### Check Build Configuration

```bash
# View current EAS configuration
cat eas.json

# Verify development profile
npx expo config --type public
```

### Clean Rebuild (If Issues Persist)

```bash
# Clear all caches and rebuild
eas build --platform ios --profile development --clear-cache

# Clean local cache too
rm -rf node_modules
rm -rf .expo
npm install
```

### View Native Module Linking

After EAS build completes, check build logs for:

```
✓ Linking native modules
  - react-native-mmkv
  - expo-av
  - expo-haptics
  - @react-native-community/netinfo
  ...
```

---

## 📊 Success Criteria Checklist

### Database (Must Pass)
- [ ] Migration runs without errors
- [ ] `updated_at` column exists in `game_sessions`
- [ ] No PGRST204 errors in console
- [ ] Game sessions sync to Supabase

### MMKV (Must Pass)
- [ ] iOS build completes successfully
- [ ] No "MMKV not available" warnings
- [ ] No "Cannot read property 'prototype'" errors
- [ ] Game state persists across app restarts

### Persistence (Must Pass)
- [ ] Game save/load works
- [ ] High scores persist
- [ ] Audio settings persist
- [ ] Cloud sync works

### No Regressions (Must Pass)
- [ ] All existing features work
- [ ] No new crashes
- [ ] Performance unchanged
- [ ] UI/UX intact

---

## 🆘 Troubleshooting

### Build Fails with "Module not found"

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
eas build --platform ios --profile development
```

### MMKV Still Not Working After Rebuild

1. **Check build logs** on EAS dashboard
2. Look for "Linking native modules" step
3. Verify MMKV is listed
4. If not listed, check `package.json`

### Database Errors Persist

1. **Verify migration ran:**
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'game_sessions' 
     AND column_name = 'updated_at';
   ```

2. **Check user authentication:**
   ```bash
   # In app console, verify:
   console.log('User ID:', useMonetizationStore.getState().userId);
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'game_sessions';
   ```

### App Crashes on Launch

1. **Check native logs** (Xcode Console)
2. **Try clean build:**
   ```bash
   eas build --platform ios --profile development --clear-cache
   ```
3. **Verify all dependencies installed:**
   ```bash
   npm install
   ```

---

## 🎉 When Everything Works

### Commit All Changes

```bash
cd C:\Users\Unmap\Downloads\blocktopia

# Check what changed
git status

# Add all fixes
git add .

# Commit with descriptive message
git commit -m "Fix MMKV native module and database schema issues

- Add updated_at column to game_sessions table (Supabase migration)
- Implement lazy MMKV initialization in AudioSettingsStorage
- Implement lazy MMKV initialization in GamePersistenceService  
- Implement lazy MMKV initialization in HighScoreService
- EAS rebuild to properly link MMKV native module
- All persistence features now working correctly

Fixes:
- PGRST204 database error
- 'Cannot read property prototype of undefined' error
- Game state persistence
- High score persistence
- Audio settings persistence"

# Push to GitHub
git push origin main
```

### Optional: Build Android

Same fixes apply to Android:

```bash
eas build --platform android --profile development
```

### Optional: Production Builds

When ready for App Store/Play Store:

```bash
# iOS production
eas build --platform ios --profile production

# Android production
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| **Build iOS** | `eas build --platform ios --profile development` |
| **Build Android** | `eas build --platform android --profile development` |
| **Start Dev Server** | `npx expo start --dev-client` |
| **Clear Cache Build** | `eas build --platform ios --profile development --clear-cache` |
| **List Builds** | `eas build:list` |
| **Download Build** | `eas build:download --platform ios --profile development` |

| URL | Purpose |
|-----|---------|
| **EAS Dashboard** | https://expo.dev/accounts/turntopia/projects/blocktopia |
| **Supabase Dashboard** | https://supabase.com |
| **GitHub Repo** | https://github.com/turntopia/blocktopia |

---

**Status:** Ready to Execute  
**Next Action:** Run database migration  
**Then:** Trigger EAS build  
**Finally:** Test on device

🚀 **Let's get Blocktopia fully functional!**

