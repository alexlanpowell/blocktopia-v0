# 🐛 Blocktopia MVP - Debugging & Testing Checklist

## Overview
This checklist will help you test and debug the Phase 1 MVP we just built. Follow each step in order and check off items as you complete them.

---

## 📋 Pre-Build Checklist

### 1. Verify File Structure
- [ ] Open `C:\Users\Unmap\Downloads\blocktopia` in Cursor
- [ ] Verify all folders exist:
  - [ ] `src/game/core/`
  - [ ] `src/game/scoring/`
  - [ ] `src/rendering/components/`
  - [ ] `src/rendering/hooks/`
  - [ ] `src/store/`
  - [ ] `src/utils/`
  - [ ] `app/`

### 2. Verify Dependencies Installed
```bash
cd C:\Users\Unmap\Downloads\blocktopia
npm list --depth=0
```

Expected packages:
- [ ] `@shopify/react-native-skia`
- [ ] `zustand`
- [ ] `react-native-gesture-handler`
- [ ] `react-native-reanimated`
- [ ] `expo-router`
- [ ] `expo-build-properties`

### 3. TypeScript Check
```bash
npx tsc --noEmit
```
- [ ] Should show: **0 errors** ✅

---

## 🔧 EAS Setup (One-Time)

### 1. Login to EAS
```bash
eas login
```
- [ ] Enter your Expo credentials
- [ ] Verify login successful

### 2. Configure EAS Project
```bash
eas build:configure
```
- [ ] Say **YES** when asked to create new project
- [ ] Verify `app.json` now has `extra.eas.projectId`

### 3. Verify EAS Config
Open `eas.json` and verify:
- [ ] Has `development` profile
- [ ] Has `developmentClient: true`
- [ ] iOS simulator is `false`
- [ ] Android buildType is `apk`

---

## 🏗️ Build Development Clients

### Option A: Build Both Platforms (Recommended)
```bash
eas build --platform all --profile development
```
- [ ] Build started for iOS
- [ ] Build started for Android
- [ ] Wait ~15-20 minutes

### Option B: Build iOS Only
```bash
eas build --platform ios --profile development
```

### Option C: Build Android Only
```bash
eas build --platform android --profile development
```

### Monitor Build Progress
```bash
eas build:list
```
- [ ] Check build status
- [ ] Note build IDs
- [ ] Wait for "Finished" status

---

## 📲 Install Development Clients

### iPhone Installation
1. [ ] Go to [App Store Connect](https://appstoreconnect.apple.com)
2. [ ] Navigate to TestFlight
3. [ ] Find "Blocktopia" build
4. [ ] Wait for processing (~10-30 min)
5. [ ] Add yourself as internal tester
6. [ ] Install TestFlight app on iPhone
7. [ ] Accept invitation email
8. [ ] Install Blocktopia from TestFlight

### Android Installation
1. [ ] Download APK from EAS build link
2. [ ] Transfer to Android phone (or download directly)
3. [ ] Enable "Install from unknown sources"
4. [ ] Install APK
5. [ ] Open Blocktopia app to verify it launches

---

## 🔥 Start Development Server

### Start Dev Server with Tunnel
```bash
npm run dev:client:tunnel
```

Or without tunnel (same WiFi required):
```bash
npm run dev:client
```

### Verify Dev Server
- [ ] QR code appears in terminal
- [ ] Metro bundler starts
- [ ] No errors in console

---

## 📱 Connect Device & Test

### 1. Connect Your iPhone
1. [ ] Open Blocktopia app (NOT Expo Go)
2. [ ] Shake device to open dev menu
3. [ ] Tap "Enter URL manually"
4. [ ] Scan QR code or enter URL from terminal
5. [ ] Wait for app to connect and reload

### 2. Connect Your Android
1. [ ] Open Blocktopia app
2. [ ] Shake device to open dev menu
3. [ ] Scan QR code or enter URL
4. [ ] Wait for connection

---

## 🧪 Core Functionality Tests

### Test 1: Main Menu
- [ ] App loads to main menu
- [ ] "Blocktopia" title displays
- [ ] "Play" button is visible
- [ ] Instructions text is readable
- [ ] Tap "Play" navigates to game screen

### Test 2: Game Screen Loads
- [ ] 10x10 grid displays
- [ ] 3 pieces show at bottom
- [ ] Score displays at top (should be 0)
- [ ] Best score displays at top
- [ ] Restart button (↻) is visible

### Test 3: Piece Visibility
- [ ] All 3 pieces are colored (not gray)
- [ ] Pieces are different shapes
- [ ] Pieces are centered in their containers

### Test 4: Drag & Drop Basic
1. [ ] Touch and hold a piece at bottom
2. [ ] Piece should follow your finger
3. [ ] Drag piece over grid
4. [ ] Grid cells should highlight
5. [ ] Release finger

**Expected Result:**
- Piece should place on grid (if valid position)
- OR return to bottom (if invalid position)

### Test 5: Place Piece Successfully
1. [ ] Drag first piece to top-left corner (0,0)
2. [ ] Release

**Expected Results:**
- [ ] Piece stays on grid
- [ ] Piece becomes part of board (solid color)
- [ ] New piece generates at bottom
- [ ] Still have 3 pieces at bottom

### Test 6: Invalid Placement
1. [ ] Place a piece on grid
2. [ ] Try to place another piece overlapping it
3. [ ] Release

**Expected Result:**
- [ ] Piece returns to bottom (bounces back)
- [ ] Board doesn't change
- [ ] Score doesn't change

### Test 7: Line Clearing - Row
1. [ ] Place pieces to fill an entire row (10 blocks)
2. [ ] Complete the row

**Expected Results:**
- [ ] Row clears (blocks disappear)
- [ ] Score increases
- [ ] Empty cells count increases

### Test 8: Line Clearing - Column
1. [ ] Place pieces to fill an entire column
2. [ ] Complete the column

**Expected Results:**
- [ ] Column clears
- [ ] Score increases

### Test 9: Multiple Line Clear (Combo)
1. [ ] Place a piece that completes both a row AND column
2. [ ] Watch the result

**Expected Results:**
- [ ] Both row and column clear
- [ ] Score increases significantly (combo bonus)

### Test 10: Game Over
1. [ ] Fill board with random pieces
2. [ ] Continue until no pieces can be placed

**Expected Results:**
- [ ] Pieces at bottom dim out (50% opacity)
- [ ] Game over modal appears
- [ ] Shows "Game Over!" text
- [ ] Shows your score
- [ ] Shows "Play Again" button

### Test 11: Restart Game
1. [ ] Tap restart button (↻) at top
2. [ ] OR tap "Play Again" from game over

**Expected Results:**
- [ ] Board clears completely
- [ ] Score resets to 0
- [ ] 3 new pieces generate
- [ ] Best score persists (doesn't reset)

### Test 12: Best Score Tracking
1. [ ] Play game and get a score (e.g., 50 points)
2. [ ] Note the best score
3. [ ] Restart game
4. [ ] Play again and beat previous score

**Expected Results:**
- [ ] Best score updates when you beat it
- [ ] Best score shows "🎉 New Best Score!" in game over

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module" errors
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Fix:**
```bash
npx tsc --noEmit
```
Read errors and fix them in code.

### Issue: Metro bundler cache issues
**Fix:**
```bash
npx expo start --dev-client --clear
```

### Issue: Touch not responding
**Checks:**
- [ ] Are you using the Blocktopia app (not Expo Go)?
- [ ] Is gesture handler working? (shake device for menu)
- [ ] Try restarting dev server

### Issue: Pieces not dragging
**Debug Steps:**
1. [ ] Check console for errors
2. [ ] Verify `useGestures` hook is being called
3. [ ] Check if `panGesture` is attached to GestureDetector
4. [ ] Verify piece preview Y coordinate calculation

### Issue: Pieces not placing on grid
**Debug Steps:**
1. [ ] Check `Board.canPlacePiece()` logic
2. [ ] Verify grid coordinates conversion
3. [ ] Console.log the board position in gesture handler
4. [ ] Check if piece structure is valid

### Issue: Lines not clearing
**Debug Steps:**
1. [ ] Check `Board.checkFullLines()` output
2. [ ] Verify row/column detection logic
3. [ ] Test with manually filled row (use restart + place pieces)
4. [ ] Check `clearLines()` function

### Issue: Score not updating
**Debug Steps:**
1. [ ] Check `calculateScore()` function
2. [ ] Verify Zustand store updates
3. [ ] Check if score selector re-renders
4. [ ] Console.log score value in HUD component

### Issue: App crashes on load
**Debug Steps:**
1. [ ] Check Metro bundler for errors
2. [ ] Verify all imports are correct
3. [ ] Check for undefined variables
4. [ ] Look for TypeScript errors

---

## 📊 Performance Tests

### Test 1: Frame Rate
- [ ] Play game for 2 minutes
- [ ] Drag pieces quickly
- [ ] Place many pieces rapidly

**Expected:** Game should stay at 60 FPS, no lag

### Test 2: Memory Usage
- [ ] Play 10 full games
- [ ] Restart between games

**Expected:** No crashes, no slowdown

### Test 3: Touch Response
- [ ] Drag piece slowly
- [ ] Drag piece quickly
- [ ] Test with multiple fingers (shouldn't crash)

**Expected:** Instant response, smooth dragging

---

## 🎨 Visual Checks

### Colors
- [ ] Board background: Dark (#1a1a2e)
- [ ] Empty cells: Dark gray (#2a2a3e)
- [ ] Pieces: Various vibrant colors (see PIECE_COLORS)
- [ ] Score display: Teal (#4ECDC4)
- [ ] Best score: Yellow (#F7B731)

### Layout
- [ ] Board is centered horizontally
- [ ] Pieces at bottom don't overlap
- [ ] Score visible at top (not cut off by notch)
- [ ] Game over modal is centered

### Typography
- [ ] All text is readable
- [ ] No overlapping text
- [ ] Proper font sizes

---

## 📝 Code Review Checklist

### TypeScript
- [ ] No `any` types used
- [ ] All functions have return types
- [ ] All parameters are typed
- [ ] Interfaces are properly defined

### Performance
- [ ] No unnecessary re-renders (check with React DevTools)
- [ ] Zustand selectors used correctly
- [ ] Memoization applied where needed
- [ ] No memory leaks (event listeners cleaned up)

### Code Quality
- [ ] Functions are small and focused
- [ ] Comments explain complex logic
- [ ] Consistent code style
- [ ] No console.log in production code

---

## 🚀 Next Steps After MVP Verification

Once all tests pass:

### Phase 2: Polish & Feel
1. [ ] Add piece pickup animation (scale up)
2. [ ] Add piece placement animation (snap to grid)
3. [ ] Add line clear animation (fade out)
4. [ ] Add sound effects (pickup, place, clear)
5. [ ] Add particle effects for line clears
6. [ ] Add haptic feedback

### Phase 3: Persistence & Monetization
1. [ ] Add AsyncStorage for save/load
2. [ ] Add AdMob rewarded video
3. [ ] Add interstitial ads
4. [ ] Persist high score across sessions

---

## 📞 Getting Help

### If You're Stuck:
1. **Check Console**: Look for error messages in Metro bundler
2. **Check Device**: Shake device for dev menu → show element inspector
3. **TypeScript Errors**: Run `npx tsc --noEmit` to see all errors
4. **Build Errors**: Check EAS build logs at expo.dev

### Debug Commands:
```bash
# Clear all caches
npx expo start --dev-client --clear --reset-cache

# Rebuild app
eas build --platform all --profile development --clear-cache

# Check TypeScript
npx tsc --noEmit

# Check package installation
npm list --depth=0
```

---

## ✅ MVP Complete Checklist

**Before moving to Phase 2, verify:**
- [ ] All core tests pass (Tests 1-12)
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Performance is smooth (60 FPS)
- [ ] Touch input is responsive
- [ ] Game logic works correctly
- [ ] Both iOS and Android work
- [ ] Can play full games start to finish

---

## 🎉 Success Criteria

**Phase 1 MVP is complete when:**
✅ You can play a full game from start to game over
✅ All pieces can be placed correctly
✅ Lines clear properly (rows and columns)
✅ Score calculates correctly
✅ Game over detects correctly
✅ Restart works properly
✅ Best score tracks correctly
✅ No crashes or major bugs
✅ Runs at 60 FPS on both devices

**Once all these are ✅, you're ready for Phase 2!** 🚀

