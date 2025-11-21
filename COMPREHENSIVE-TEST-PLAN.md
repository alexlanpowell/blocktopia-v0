# 🧪 Blocktopia Comprehensive Test Plan
## Post-MMKV & Database Fixes

**Version:** 1.0.1  
**Date:** November 20, 2025  
**Tester:** Manual QA on iOS Development Build  
**Focus:** MMKV persistence, database sync, no regressions

---

## 🎯 Test Objectives

1. **Verify MMKV native module works** (no more "Cannot read property 'prototype'" errors)
2. **Verify database schema fixed** (no more PGRST204 errors)
3. **Validate all persistence features** (game state, high scores, settings)
4. **Ensure no regressions** (gameplay, UI, monetization, audio)
5. **Test edge cases** (offline mode, rapid saves, concurrent sessions)

---

## 📋 Pre-Test Setup

### Environment
- [ ] iOS development build installed (latest from EAS)
- [ ] Database migration completed in Supabase
- [ ] Development server running (`npx expo start --dev-client`)
- [ ] Console logs visible (for debugging)
- [ ] Supabase dashboard open (for cloud verification)

### Test Device Info
- **Device:** iPhone [model]
- **iOS Version:** [version]
- **Build Version:** [from EAS]
- **Date/Time:** [current]

---

## 🟢 Critical Tests (MUST PASS)

### Test 1: MMKV Initialization

**Priority:** CRITICAL  
**Objective:** Verify MMKV native module loads without errors

**Steps:**
1. Open app fresh install
2. Watch console during initialization
3. Navigate to Settings
4. Go back to main menu

**Expected Results:**
- ✅ App launches successfully
- ✅ No "MMKV not available" warnings
- ✅ No "Cannot read property 'prototype'" errors
- ✅ Console shows: `[AudioSettingsStorage] MMKV initialized successfully` (or similar)

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 2: Game State Persistence

**Priority:** CRITICAL  
**Objective:** Game resumes exactly where left off

**Setup:**
1. Start fresh game
2. Play until score is 150 (place ~5 pieces)
3. Note current score, board state, pieces in hand
4. **Kill app completely** (double-tap home, swipe up)

**Steps:**
1. Reopen app
2. App should auto-resume game
3. Verify score matches
4. Verify board matches
5. Verify pieces in hand match

**Expected Results:**
- ✅ Game resumes automatically
- ✅ Score matches exactly (150)
- ✅ Board state identical
- ✅ Current pieces identical
- ✅ Console: `[GamePersistence] Game state saved locally`
- ✅ No MMKV errors

**Actual Results:**
- Score before: _____ | Score after: _____
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 3: Database Cloud Sync

**Priority:** CRITICAL  
**Objective:** Game sessions sync to Supabase without errors

**Steps:**
1. Play a complete game (until game over)
2. Watch console during game end
3. Wait 5 seconds for sync
4. Check Supabase dashboard

**Expected Results:**
- ✅ Console: `Successfully synced to cloud` or similar
- ❌ No PGRST204 errors
- ❌ No "Could not find the 'updated_at' column" errors
- ✅ Supabase `game_sessions` table has new row
- ✅ Row has `updated_at` timestamp
- ✅ Row has correct score, pieces_placed, etc.

**Actual Results:**
- Console output: _______________
- Supabase row created: [ ] YES [ ] NO
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 4: High Score Persistence

**Priority:** CRITICAL  
**Objective:** High scores save locally and sync to cloud

**Steps:**
1. Play game, get score of 100
2. Game over
3. Kill app
4. Reopen app
5. Check main menu for high score display
6. Play again, get score of 250
7. Game over
8. Kill app
9. Reopen app

**Expected Results:**
- ✅ After first game: High score shows 100
- ✅ After second game: High score shows 250
- ✅ High score persists across app restarts
- ✅ Console: `[HighScoreService] High score updated: 250`
- ✅ Supabase `user_high_scores` table updated

**Actual Results:**
- First high score: _____
- Second high score: _____
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 5: Audio Settings Persistence

**Priority:** CRITICAL  
**Objective:** Audio settings save and persist

**Steps:**
1. Open Settings → Audio
2. Set music volume to 25%
3. Set SFX volume to 75%
4. Toggle music OFF
5. Leave SFX ON
6. Go back to main menu
7. Kill app
8. Reopen app
9. Go back to Settings → Audio

**Expected Results:**
- ✅ Music volume slider at 25%
- ✅ SFX volume slider at 75%
- ✅ Music toggle OFF
- ✅ SFX toggle ON
- ✅ Settings persist across restart
- ✅ Console: `[AudioSettingsStorage] Settings saved`

**Actual Results:**
- Music volume after restart: _____%
- SFX volume after restart: _____%
- Music enabled: [ ] YES [ ] NO
- SFX enabled: [ ] YES [ ] NO
- [ ] PASS
- [ ] FAIL - Details: _______________

---

## 🟡 Important Tests (HIGH PRIORITY)

### Test 6: Rapid Game Saves

**Priority:** HIGH  
**Objective:** MMKV handles rapid saves without crashes

**Steps:**
1. Start game
2. Rapidly place 10 pieces (fast tapping)
3. Each piece triggers a save
4. Watch console for errors
5. Kill app mid-game
6. Reopen

**Expected Results:**
- ✅ No crashes during rapid saves
- ✅ Game resumes at last saved state
- ✅ No race conditions or corruption

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 7: Offline Mode

**Priority:** HIGH  
**Objective:** App works without internet (local-first)

**Steps:**
1. Enable Airplane Mode on iPhone
2. Open app
3. Play a game
4. Check console
5. Kill app
6. Reopen app
7. Disable Airplane Mode

**Expected Results:**
- ✅ App works offline
- ✅ Game saves locally
- ✅ High score saves locally
- ✅ Settings save locally
- ⚠️ Cloud sync fails gracefully (expected)
- ✅ When online again, syncs successfully

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 8: Settings Sync After Cloud Change

**Priority:** HIGH  
**Objective:** Settings load from cloud if cloud is newer

**Steps:**
1. Play on device A
2. Change audio settings
3. Log into Supabase, manually update `user_settings` table
4. Kill app
5. Reopen app

**Expected Results:**
- ✅ App loads settings from Supabase
- ✅ Cloud settings override local if newer

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 9: Multiple Game Sessions

**Priority:** HIGH  
**Objective:** Only one active game at a time per user

**Steps:**
1. Start game on device
2. Play a few moves
3. Leave game active (don't end it)
4. Go to Supabase `game_sessions` table
5. Check `is_active` column

**Expected Results:**
- ✅ Only 1 row with `is_active = true` for this user
- ✅ Previous active sessions marked `is_active = false`

**Actual Results:**
- Active sessions count: _____
- [ ] PASS
- [ ] FAIL - Details: _______________

---

## 🔵 Regression Tests (MUST PASS)

### Test 10: Core Gameplay

**Priority:** CRITICAL  
**Objective:** All gameplay features still work

**Steps:**
1. Start new game
2. Test drag and drop (all 3 pieces)
3. Clear a line
4. Clear multiple lines at once
5. Use a power-up (if available)
6. Continue until game over
7. Restart game

**Expected Results:**
- ✅ Pieces drag smoothly
- ✅ Pieces snap to grid
- ✅ Valid placement works
- ✅ Invalid placement rejected (piece returns)
- ✅ Lines clear with animation
- ✅ Score increments correctly
- ✅ Game over detected
- ✅ Restart button works

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 11: UI/UX Performance

**Priority:** HIGH  
**Objective:** No performance degradation

**Steps:**
1. Navigate through all screens
2. Play a game
3. Monitor frame rate (should be 60fps)
4. Check for animation stutters
5. Test all buttons and gestures

**Expected Results:**
- ✅ 60fps during gameplay
- ✅ Smooth animations
- ✅ No visual glitches
- ✅ All buttons respond immediately
- ✅ No memory leaks (play 5+ games)

**Actual Results:**
- Frame rate: _____ fps
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 12: Audio System

**Priority:** MEDIUM  
**Objective:** Audio plays correctly (or gracefully fails if files missing)

**Steps:**
1. Enable music in Settings
2. Start game
3. Place piece (triggers SFX)
4. Clear line (triggers SFX)
5. Game over (triggers SFX)
6. Adjust volume sliders
7. Toggle music/SFX on/off

**Expected Results:**
- ✅ Background music plays (if files present)
- ✅ Sound effects play (if files present)
- ⚠️ If files missing: Graceful warnings, no crashes
- ✅ Volume controls work in real-time
- ✅ Toggle immediately mutes/unmutes

**Actual Results:**
- Music playing: [ ] YES [ ] NO
- SFX playing: [ ] YES [ ] NO
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 13: Monetization Features

**Priority:** MEDIUM  
**Objective:** Gems, shop, ads still work

**Steps:**
1. Check gem count on main menu
2. Open shop
3. View cosmetics
4. Purchase item (if gems available)
5. Check banner ad loads

**Expected Results:**
- ✅ Gem count displays correctly
- ✅ Shop opens without errors
- ✅ Cosmetics render
- ✅ Purchase flow works
- ✅ Banner ad loads (if enabled)

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 14: Navigation & Routing

**Priority:** HIGH  
**Objective:** All navigation works (no "unmatched root" errors)

**Steps:**
1. Main menu → Settings
2. Settings → Audio
3. Back to Settings
4. Back to Main menu
5. Main menu → Game
6. Game → Pause
7. Pause → Resume
8. Game over → Main menu
9. Main menu → Shop
10. Shop → Main menu

**Expected Results:**
- ✅ All navigation works
- ❌ No "unmatched root" errors
- ✅ Back buttons work correctly
- ✅ Deep linking works (if implemented)

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

## 🟣 Edge Case Tests (GOOD TO PASS)

### Test 15: Corrupted MMKV Data

**Priority:** LOW  
**Objective:** App recovers from corrupted local storage

**Setup:**
1. With app closed, manually delete MMKV files (if accessible)
2. Or manually corrupt data in Supabase

**Steps:**
1. Reopen app
2. App should detect corruption
3. Fall back to defaults

**Expected Results:**
- ✅ App doesn't crash
- ✅ Falls back to default settings
- ⚠️ Console warns about corruption
- ✅ User can play normally

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________
- [ ] SKIP (cannot test)

---

### Test 16: Supabase Connection Failure

**Priority:** MEDIUM  
**Objective:** App handles backend failures gracefully

**Steps:**
1. Pause Supabase project (or block network to Supabase)
2. Open app
3. Play game
4. Try to sync

**Expected Results:**
- ✅ App works (local-first)
- ⚠️ Cloud sync fails with warning
- ✅ Game still saves locally
- ✅ When Supabase restored, syncs catch up

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________

---

### Test 17: Concurrent Session Conflict

**Priority:** LOW  
**Objective:** Handle same user on multiple devices

**Setup:** (if you have 2 devices)
1. Log in on Device A
2. Log in on Device B (same account)

**Steps:**
1. Play game on Device A
2. Simultaneously play game on Device B
3. Check Supabase for session conflicts

**Expected Results:**
- ✅ Only 1 active session per user
- ✅ Newer session deactivates older one
- ⚠️ Possible sync conflicts (handled gracefully)

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________
- [ ] SKIP (only 1 device)

---

### Test 18: App Update Migration

**Priority:** MEDIUM  
**Objective:** Existing users' data migrates correctly

**Setup:**
1. Install "old" version (pre-fix)
2. Create game data
3. Update to "new" version (post-fix)

**Steps:**
1. Install new build over old build
2. Open app
3. Check if old data loads

**Expected Results:**
- ✅ Old high scores preserved
- ✅ Old settings preserved
- ✅ No data loss
- ⚠️ Old game state may be incompatible (acceptable)

**Actual Results:**
- [ ] PASS
- [ ] FAIL - Details: _______________
- [ ] SKIP (fresh install)

---

## 📊 Test Results Summary

### Critical Tests (Must Pass: 5/5)
- Test 1 (MMKV Init): [ ] PASS [ ] FAIL
- Test 2 (Game Persistence): [ ] PASS [ ] FAIL
- Test 3 (Cloud Sync): [ ] PASS [ ] FAIL
- Test 4 (High Scores): [ ] PASS [ ] FAIL
- Test 5 (Audio Settings): [ ] PASS [ ] FAIL

### High Priority Tests (Should Pass: 8/9)
- Test 6 (Rapid Saves): [ ] PASS [ ] FAIL
- Test 7 (Offline Mode): [ ] PASS [ ] FAIL
- Test 8 (Settings Sync): [ ] PASS [ ] FAIL
- Test 9 (Multiple Sessions): [ ] PASS [ ] FAIL
- Test 10 (Core Gameplay): [ ] PASS [ ] FAIL
- Test 11 (UI Performance): [ ] PASS [ ] FAIL
- Test 14 (Navigation): [ ] PASS [ ] FAIL

### Medium Priority Tests (Nice to Pass: 3/3)
- Test 12 (Audio System): [ ] PASS [ ] FAIL
- Test 13 (Monetization): [ ] PASS [ ] FAIL
- Test 16 (Backend Failure): [ ] PASS [ ] FAIL

### Edge Cases (Optional: 0-3)
- Test 15 (Corrupted Data): [ ] PASS [ ] FAIL [ ] SKIP
- Test 17 (Concurrent Sessions): [ ] PASS [ ] FAIL [ ] SKIP
- Test 18 (Migration): [ ] PASS [ ] FAIL [ ] SKIP

---

## ✅ Sign-Off Criteria

**Ready for Production:** ALL of the following must be true:

- [ ] All 5 Critical tests PASS
- [ ] At least 7/9 High Priority tests PASS
- [ ] No crashes or errors during testing
- [ ] Console shows no MMKV errors
- [ ] Console shows no PGRST204 errors
- [ ] Supabase data syncs correctly
- [ ] Performance is acceptable (60fps gameplay)

**If ANY Critical test fails:**
- 🚨 DO NOT RELEASE
- 🔧 Debug and fix issue
- 🔄 Rebuild and retest

---

## 📝 Bug Report Template

If any test fails, use this format:

```
Bug ID: BUG-[DATE]-[NUMBER]
Severity: [CRITICAL / HIGH / MEDIUM / LOW]
Test: [Test number and name]
Platform: iOS [version]
Build: [EAS build ID]

Steps to Reproduce:
1. 
2. 
3. 

Expected:
- 

Actual:
- 

Console Output:
```
[paste relevant logs]
```

Screenshots:
[attach if applicable]

Workaround:
[if any]
```

---

## 🎉 Post-Test Actions

### If All Tests Pass:

1. **Update Status:**
   ```bash
   # Create passing test report
   echo "All tests passed on $(date)" > TEST-RESULTS-PASSED.md
   ```

2. **Commit Build:**
   ```bash
   git add .
   git commit -m "v1.0.1: MMKV and database fixes verified
   
   - All critical tests passed
   - MMKV persistence working
   - Cloud sync working
   - No regressions detected"
   
   git push origin main
   git tag v1.0.1
   git push --tags
   ```

3. **Build Production:**
   ```bash
   eas build --platform ios --profile production
   ```

### If Tests Fail:

1. **Document failures** in bug report format
2. **Check console logs** for errors
3. **Review EAS build logs** for issues
4. **Fix issues** based on findings
5. **Rebuild and retest**

---

## 📞 Testing Checklist

**Before Testing:**
- [ ] Database migration completed
- [ ] iOS build installed
- [ ] Dev server running
- [ ] Console visible
- [ ] Supabase dashboard open

**During Testing:**
- [ ] Record all test results
- [ ] Take screenshots of failures
- [ ] Copy console errors
- [ ] Note performance issues

**After Testing:**
- [ ] Fill out results summary
- [ ] Create bug reports for failures
- [ ] Sign off if passed
- [ ] Commit passing build

---

**Tester:** _________________  
**Date:** _________________  
**Build ID:** _________________  
**Overall Status:** [ ] PASS [ ] FAIL  

🧪 **Happy Testing!**

