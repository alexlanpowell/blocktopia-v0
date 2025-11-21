# 🧪 Testing Guide - UX Fixes

## Quick Test Procedure

### Test 1: Drag Centering ✨
**What was fixed:** Piece now centers on your finger (was offset ~2 blocks right)

**How to test:**
1. Open game screen
2. Touch any piece at the bottom (try left, center, right edge)
3. Drag upward

**Expected Result:**
- ✅ Piece should be **perfectly centered** under your finger
- ✅ No offset to left or right
- ✅ Works the same for all 3 pieces
- ✅ Works the same regardless of where you touch on the piece

---

### Test 2: Visual Refresh ✨
**What was fixed:** Piece dims when picked up (no more ghost piece)

**How to test:**
1. Open game screen
2. Look at the 3 pieces at bottom
3. Touch and hold one piece
4. Observe the preview at bottom

**Expected Result:**
- ✅ The piece you touched should **dim to 20% opacity**
- ✅ Other 2 pieces remain normal brightness
- ✅ When you release (place or cancel), piece returns to normal
- ✅ After placing, new pieces appear with no ghost images

---

## Detailed Test Cases

### Scenario 1: Simple Drag & Place
1. Touch green piece (left)
2. Drag to valid position on board
3. Release

**Expected:**
- ✅ Green piece centers on finger immediately
- ✅ Green piece dims in preview at bottom
- ✅ Drag preview follows finger smoothly
- ✅ Piece places on board
- ✅ New pieces generate at bottom
- ✅ No ghost pieces visible

---

### Scenario 2: Drag & Cancel
1. Touch pink piece (middle)
2. Drag upward but not to board
3. Release in empty space

**Expected:**
- ✅ Pink piece centers on finger
- ✅ Pink piece dims in preview
- ✅ When released, piece returns to preview
- ✅ Pink piece returns to full opacity
- ✅ Same 3 pieces still available

---

### Scenario 3: Rapid Interaction
1. Touch piece #1 → Cancel
2. Touch piece #2 → Cancel
3. Touch piece #3 → Cancel
4. Touch piece #1 → Place

**Expected:**
- ✅ No visual glitches
- ✅ No flickering
- ✅ Smooth dimming/brightening transitions
- ✅ All pieces respond correctly

---

### Scenario 4: All Piece Shapes
Test with different piece shapes that appear:
- **I-piece** (line): 1x4 or 4x1
- **L-piece**: L-shaped
- **T-piece**: T-shaped
- **Square**: 2x2 or 3x3
- **Z-piece**: Z-shaped

**Expected:**
- ✅ ALL shapes center perfectly on finger
- ✅ No shape-specific offset issues
- ✅ All shapes dim correctly when picked up

---

## Edge Cases

### Test: Touch Between Pieces
1. Touch exactly on the border between two pieces

**Expected:**
- ✅ One piece should be selected (the left one)
- ✅ That piece centers on finger
- ✅ No weird behavior

---

### Test: Fast Swipe
1. Quickly swipe a piece from bottom to board

**Expected:**
- ✅ Piece follows smoothly (no lag)
- ✅ Preview dims instantly
- ✅ 60 FPS maintained

---

### Test: Screen Edges
1. Drag piece to far left edge of screen
2. Drag piece to far right edge of screen

**Expected:**
- ✅ No clipping or visual glitches
- ✅ Piece remains centered on finger
- ✅ Piece still visible and renders correctly

---

## Performance Checks

### Frame Rate
- Use React DevTools Profiler
- Drag piece continuously
- **Expected:** 60 FPS maintained

### Haptics
- Touch piece → Should feel **light** haptic
- Place piece → Should feel **medium** haptic
- **Expected:** Consistent haptic feedback

### Visual Smoothness
- No stuttering
- No frame drops
- Smooth opacity transitions

---

## Known Good State

If everything works correctly, you should feel:
- **Natural:** Piece follows finger like it's "stuck" to it
- **Responsive:** Instant feedback when touching
- **Polished:** Like a AAA mobile game
- **Clear:** Always know which piece you're holding

---

## Troubleshooting

### If piece is still offset:
1. Clear Metro cache: `npm start -- --reset-cache`
2. Rebuild app completely
3. Check console for errors

### If visual doesn't update:
1. Check React DevTools for component re-renders
2. Verify no JavaScript errors in console
3. Try force-closing and reopening app

### If performance is slow:
1. Test on physical device (not simulator)
2. Check for background processes
3. Verify 60 FPS in production build

---

## Success Criteria

Both fixes should feel **invisible** - the interaction should just work naturally:

✅ **Drag Centering:** You shouldn't even notice the piece position - it should just "feel right"

✅ **Visual Feedback:** You should instantly see which piece you're dragging without thinking about it

If you have to think "is this working?", it's working! The best UX is invisible UX.

---

**Ready to test! 🚀**

