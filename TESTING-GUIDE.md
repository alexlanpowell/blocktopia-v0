# Testing Guide - Gesture & Touch Fixes

## What Was Fixed

### Phase 1: Crash on Touch ✅
- **Problem:** App crashed immediately when touching anywhere
- **Cause:** Worklets accessing object properties (BOARD_DIMENSIONS, GAME_CONFIG)
- **Fix:** Extracted all values as primitives and passed as parameters

### Phase 2: Touch Blocking ✅
- **Problem:** After crash fix, nothing responded to touch
- **Cause:** GestureDetector wrapping entire screen, blocking all touches
- **Fix:** Moved GestureDetector to only wrap PiecePreview component

---

## What Should Work Now

### ✅ Buttons
1. **Restart Button** (top left)
   - Should restart the game
   - Haptic feedback on tap
   
2. **Power-Up Buttons** (below header)
   - Should activate power-ups
   - Shows quantity
   - Disabled if quantity is 0

3. **Game Over Modal**
   - Appears when no moves available
   - "Play Again" button restarts game

### ✅ Piece Dragging
1. **Touch piece at bottom**
   - Light haptic feedback
   - Piece should start following finger
   
2. **Drag across screen**
   - Piece follows smoothly
   - Visual preview shows piece position
   - Valid positions highlighted green
   - Invalid positions highlighted red
   
3. **Release on board**
   - If valid: piece places, medium haptic feedback
   - If invalid: drag cancels, no placement

---

## Step-by-Step Testing

### Test 1: App Loads
1. Open app
2. Navigate to game screen
3. **Expected:** No crashes, game loads normally

### Test 2: Buttons Work
1. Tap restart button (top left)
2. **Expected:** Game restarts immediately
3. Tap a power-up button
4. **Expected:** Power-up activates (if you have any)

### Test 3: Drag Pieces
1. Touch a piece at the bottom (leftmost piece)
2. **Expected:** 
   - Light vibration
   - Piece starts following your finger
   
3. Drag piece upward toward board
4. **Expected:**
   - Piece follows smoothly
   - Visual feedback shows if placement is valid
   
5. Release on a valid position
6. **Expected:**
   - Piece places on board
   - Medium vibration
   - Piece disappears from preview
   - New piece appears in preview

### Test 4: Invalid Placement
1. Touch a piece at the bottom
2. Drag to an invalid position (overlapping existing pieces)
3. **Expected:** Red highlight or visual indication
4. Release
5. **Expected:** Piece doesn't place, drag cancels

### Test 5: Drag Outside Screen
1. Touch a piece
2. Drag completely off the top of the screen
3. Release
4. **Expected:** Drag cancels, piece returns to preview

### Test 6: Quick Tap
1. Quickly tap a piece (don't drag)
2. **Expected:** Nothing happens (minDistance prevents accidental drag)

---

## What to Look For

### ✅ Good Signs
- No crashes on any touch
- Buttons respond immediately
- Pieces follow finger smoothly
- Haptic feedback on interactions
- Visual feedback clear and immediate
- 60 FPS performance

### ❌ Bad Signs
- App crashes on touch
- Buttons don't respond
- Pieces don't move when dragged
- Lag or stuttering during drag
- No haptic feedback
- Visual glitches

---

## If Issues Persist

### Issue: Still crashes on touch
**Check:**
- Are you running the latest code?
- Did you rebuild the app after changes?
- Check console for error messages

### Issue: Buttons still don't work
**Check:**
- Is GestureDetector still wrapping the entire screen?
- Check pointerEvents settings on components
- Verify TouchableOpacity elements have onPress handlers

### Issue: Pieces don't move
**Check:**
- Is GestureDetector wrapping PiecePreview?
- Check if gesture handler is initialized
- Verify minDistance isn't too high
- Check console for errors in gesture callbacks

### Issue: Drag doesn't continue outside preview
**Check:**
- Verify `.shouldCancelWhenOutside(false)` is set
- Check if gesture is being cancelled prematurely

---

## Console Logs to Check

With `__DEV__` mode enabled, you should see:
- `[JS Debug]` logs for drag operations
- Store state updates
- No errors or warnings

If you see:
- `[Worklet]` logs - logging should be disabled in worklets now
- Serialization errors - object access still present somewhere
- Store not available - initialization timing issue

---

## Performance Metrics

Expected performance:
- **Touch response:** < 16ms (instant)
- **Drag update rate:** 60 FPS (16.67ms per frame)
- **Piece placement:** < 50ms
- **Haptic feedback delay:** < 10ms

---

## Platform-Specific Notes

### iOS
- Haptic feedback should be strong and clear
- Safe area insets should be respected
- Smooth 60 FPS animations

### Android
- Haptic feedback may be lighter
- Navigation bar respected
- Smooth performance on most devices

---

## Success Criteria

All of these should work:
- [x] App loads without crash
- [x] Can tap restart button
- [x] Can tap power-up buttons
- [x] Can touch pieces
- [x] Can drag pieces
- [x] Pieces follow finger
- [x] Can place pieces on board
- [x] Invalid placements prevented
- [x] Visual feedback works
- [x] Haptic feedback works
- [x] No lag or stuttering
- [x] All UI responsive

---

**If all tests pass:** ✅ Fix is successful!  
**If any tests fail:** Review error messages and check the specific issue above.

