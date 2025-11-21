# 🧪 Testing Guide - Smart Snapping System

## Quick Test Procedure

### Test 1: Drag Position Fix ✨
**What to test:** Verify piece follows finger exactly (no offset)

1. Touch any piece at bottom
2. Drag slowly upward
3. Observe piece position relative to finger

**Expected:**
- ✅ Piece centered perfectly under finger
- ✅ No offset to any direction
- ✅ Smooth tracking (no lag)

---

### Test 2: Smart Snapping - Easy Placement 🧲
**What to test:** Verify piece snaps when "close enough"

1. Drag piece toward empty cell
2. Release finger ~0.3 cells away from center
3. Observe if piece snaps into place

**Expected:**
- ✅ Piece snaps to nearest valid cell
- ✅ **Green glow** appears when snap activates
- ✅ Piece places successfully
- ✅ Feels natural, not jarring

---

### Test 3: Smart Snapping - Invalid Position 🚫
**What to test:** Verify no snap to occupied cells

1. Place a few pieces on board
2. Drag piece over occupied cells
3. Try to release

**Expected:**
- ✅ **No snap** occurs
- ✅ Piece stays **dimmed** (50% opacity)
- ✅ **No green glow**
- ✅ Piece returns to preview on release

---

### Test 4: Visual Feedback 🎨
**What to test:** Verify color changes based on validity

1. Drag piece over empty cells
2. Drag over occupied cells
3. Drag over board edges
4. Observe color/opacity changes

**Expected:**
- ✅ **Empty cells:** Bright **green glow** (#00FF88)
- ✅ **Occupied cells:** Dimmed original colors (50% opacity)
- ✅ **Off board:** Dimmed original colors
- ✅ Transitions are smooth (no flicker)

---

## Detailed Test Scenarios

### Scenario 1: Precision Placement
**Goal:** Test snap works when finger is close but not exact

**Steps:**
1. Drag I-piece (1x4 line) to top row
2. Release finger 0.2 cells left of center
3. Try again 0.2 cells right of center
4. Try again 0.4 cells away (edge of tolerance)

**Expected Results:**
| Distance from Center | Snap? | Green Glow? | Placement? |
|---------------------|-------|-------------|------------|
| 0.2 cells | ✅ Yes | ✅ Yes | ✅ Success |
| 0.4 cells | ✅ Yes | ✅ Yes | ✅ Success |
| 0.5 cells | ❌ No | ❌ No | ❌ Returns |

---

### Scenario 2: Tight Spaces
**Goal:** Test snap chooses closest valid position

**Steps:**
1. Fill board with pieces, leave 2 adjacent empty cells
2. Drag piece over middle of both cells
3. Release slightly closer to left cell
4. Try again closer to right cell

**Expected:**
- ✅ Snaps to **closest** valid cell
- ✅ Green glow shows which cell will be chosen
- ✅ Places in expected cell

---

### Scenario 3: Complex Pieces
**Goal:** Test snap works with all piece shapes

**Test each shape:**
- ✅ I-piece (1x4 or 4x1)
- ✅ L-piece
- ✅ T-piece
- ✅ Square (2x2, 3x3)
- ✅ Z-piece
- ✅ Single block

**For each:**
1. Drag near valid position
2. Release within 0.4 cells
3. Verify snap and placement

---

### Scenario 4: Board Edges
**Goal:** Test snap works near board boundaries

**Steps:**
1. Drag piece to top-left corner
2. Release just outside board (0.3 cells)
3. Should snap to corner if valid
4. Repeat for all 4 corners
5. Repeat for all 4 edges

**Expected:**
- ✅ Snaps to edge cell if within tolerance
- ✅ Green glow shows it's valid
- ✅ Doesn't snap if too far outside

---

### Scenario 5: Rapid Placement
**Goal:** Test performance under rapid interaction

**Steps:**
1. Quickly drag and place 10 pieces
2. Monitor frame rate
3. Check for visual glitches
4. Verify no snap calculation lag

**Expected:**
- ✅ Maintains 60 FPS
- ✅ No frame drops
- ✅ Snap always correct
- ✅ No visual artifacts

---

## Visual Feedback Checklist

### Green Glow (Valid Snap)
- [ ] Appears when over valid empty cells
- [ ] Disappears when over occupied cells
- [ ] Bright, noticeable color (#00FF88)
- [ ] Full opacity (1.0)
- [ ] Smooth transition when entering/exiting

### Dimmed (Invalid)
- [ ] Appears when over occupied cells
- [ ] Original piece colors maintained
- [ ] 50% opacity clearly visible
- [ ] No green glow present
- [ ] Indicates "can't place here"

### Off Board
- [ ] Dimmed like invalid position
- [ ] No green glow
- [ ] Piece stays under finger
- [ ] Returns to preview on release

---

## Performance Tests

### Frame Rate Check
**Using React DevTools Profiler:**
1. Start profiling
2. Drag piece continuously for 10 seconds
3. Release and check results

**Expected:**
- Frame rate: 60 FPS ± 2
- No spikes or drops
- Smooth throughout

### Snap Calculation Speed
**Console Timing:**
```typescript
// Add to Board.findBestSnapPosition() temporarily
const start = performance.now();
// ... snap logic ...
const end = performance.now();
console.log(`Snap calc: ${end - start}ms`);
```

**Expected:**
- < 1ms per calculation
- No accumulation over time
- No memory leaks

---

## Tolerance Calibration Tests

### Test Different Tolerances

**To test different values, modify `src/store/gameStore.ts`:**
```typescript
const snapPosition = gameState.board.findBestSnapPosition(
  boardPosition.x,
  boardPosition.y,
  piece,
  0.4  // <- Change this to test: 0.3, 0.4, 0.5
);
```

### User Feedback Metrics

| Tolerance | Feels | Success Rate | Comments |
|-----------|-------|--------------|----------|
| 0.3 | Strict | ~75% | Too hard, frustrating |
| **0.4** | **Just Right** | **~85%** | **Best balance** |
| 0.5 | Too Easy | ~95% | Loses challenge |

---

## Edge Cases

### Test 1: Finger Exactly on Cell Center
**Expected:** Stays exactly where placed (no snap needed)

### Test 2: Finger Between 4 Cells
**Expected:** Snaps to closest valid cell within tolerance

### Test 3: All Surrounding Cells Occupied
**Expected:** No snap, dims piece, can't place

### Test 4: Piece Partially Off Board
**Expected:** No snap if any cell would be off board

### Test 5: Very Fast Swipe
**Expected:** Snap still calculates correctly, no lag

---

## Regression Tests

### Ensure No Breakage

- [ ] Basic placement still works (without snap)
- [ ] Occupied cells still blocked
- [ ] Score updates correctly
- [ ] Line clearing still works
- [ ] Power-ups still function
- [ ] Game over detection works
- [ ] Restart button works
- [ ] All animations smooth

---

## Success Criteria Checklist

### Drag Position
- [ ] Zero offset from finger
- [ ] Works for all piece shapes
- [ ] Smooth 60 FPS tracking
- [ ] No visual glitches

### Smart Snapping
- [ ] Snaps within 0.4 cell tolerance
- [ ] Only snaps to valid positions
- [ ] Green glow for valid
- [ ] Dimmed for invalid
- [ ] Smooth, natural feel
- [ ] ~85% placement success rate

### Performance
- [ ] 60 FPS maintained
- [ ] < 1ms snap calculation
- [ ] No memory leaks
- [ ] Works on physical device

### UX Quality
- [ ] Feels professional (AAA game)
- [ ] Intuitive (no tutorial needed)
- [ ] Satisfying placement
- [ ] Balanced difficulty

---

## Troubleshooting

### If Snap Doesn't Work:
1. Check console for errors
2. Verify `findBestSnapPosition` is being called
3. Check tolerance value (should be 0.4)
4. Test with simple piece (single block)

### If Green Glow Doesn't Appear:
1. Check `DragPreview.tsx` color logic
2. Verify `dragState.canPlace` is true
3. Check if piece is over valid cells
4. Look for CSS/style conflicts

### If Snap Too Aggressive:
1. Reduce tolerance (try 0.3)
2. Test with different piece shapes
3. Get user feedback
4. Adjust in `gameStore.ts`

### If Snap Not Enough:
1. Increase tolerance (try 0.5)
2. But be careful - too easy loses challenge
3. Test placement success rate
4. Balance with user feedback

---

## User Testing Questions

After testing, ask users:

1. **Does the piece follow your finger accurately?**
   - [ ] Yes, perfectly
   - [ ] Mostly, small offset
   - [ ] No, noticeable offset

2. **Is placement easier with smart snapping?**
   - [ ] Much easier
   - [ ] Somewhat easier
   - [ ] About the same

3. **Is the game too easy now?**
   - [ ] No, still challenging
   - [ ] Slightly easier but good
   - [ ] Yes, too easy now

4. **Do you notice the green glow feedback?**
   - [ ] Yes, very helpful
   - [ ] Yes, but subtle
   - [ ] No, didn't notice

5. **Overall satisfaction (1-5):**
   - [ ] 5 - Perfect
   - [ ] 4 - Very good
   - [ ] 3 - Good
   - [ ] 2 - Needs work
   - [ ] 1 - Not working

---

**Ready for comprehensive testing! 🧪**

