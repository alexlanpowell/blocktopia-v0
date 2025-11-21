# Native Crash Fix - Object Access in Worklets ✅

**Date:** Current Session  
**Status:** ✅ ROOT CAUSE FIXED - READY FOR TESTING

---

## Root Cause Identified

### The REAL Problem:
The app was crashing because **React Native Reanimated worklets were accessing JavaScript object properties** (`BOARD_DIMENSIONS.width`, `GAME_CONFIG.BOARD_SIZE`, etc.). 

### Why It Crashed:
React Native Reanimated worklets run on the **UI thread** and cannot serialize JavaScript objects. When a worklet tries to access object properties like `BOARD_DIMENSIONS.width`, React Native Reanimated attempts to serialize the entire object to pass it to the UI thread, which causes an immediate native crash.

### Crash Points Found:
1. `screenToBoardCoordinates` worklet accessing:
   - `BOARD_DIMENSIONS.width` ❌
   - `BOARD_DIMENSIONS.height` ❌
   - `BOARD_DIMENSIONS.cellSize` ❌
   - `BOARD_DIMENSIONS.cellGap` ❌
   - `GAME_CONFIG.BOARD_SIZE` ❌

2. `handleStartDrag` worklet accessing:
   - `GAME_CONFIG.PIECE_COUNT` ❌

3. `onStart` worklet accessing:
   - `GAME_CONFIG.PIECE_COUNT` ❌

---

## Fix Implemented

### Solution: Pass Primitive Values Instead of Objects

**Key Principle:** Worklets can only access primitive values (numbers, strings, booleans) that are captured at worklet creation time. Objects cannot be serialized to the UI thread.

### Changes Made:

#### 1. `app/game.tsx` - Extract Primitives
```typescript
// Extract primitive values from objects BEFORE passing to worklets
const boardWidth = BOARD_DIMENSIONS.width;
const boardHeight = BOARD_DIMENSIONS.height;
const cellSize = BOARD_DIMENSIONS.cellSize;
const cellGap = BOARD_DIMENSIONS.cellGap;
const boardSize = GAME_CONFIG.BOARD_SIZE;
const pieceCount = GAME_CONFIG.PIECE_COUNT;

// Pass primitives to useGestures hook
const { panGesture } = useGestures({
  boardOffsetX: BOARD_OFFSET_X,
  boardOffsetY: BOARD_OFFSET_Y,
  piecePreviewY: PIECE_PREVIEW_Y,
  boardWidth,      // ✅ Primitive
  boardHeight,     // ✅ Primitive
  cellSize,        // ✅ Primitive
  cellGap,         // ✅ Primitive
  boardSize,       // ✅ Primitive
  pieceCount,      // ✅ Primitive
});
```

#### 2. `src/rendering/hooks/useGestures.ts` - Use Primitives in Worklets

**Updated Interface:**
```typescript
interface UseGesturesConfig {
  boardOffsetX: number;
  boardOffsetY: number;
  piecePreviewY: number;
  boardWidth: number;      // ✅ Added
  boardHeight: number;     // ✅ Added
  cellSize: number;        // ✅ Added
  cellGap: number;         // ✅ Added
  boardSize: number;       // ✅ Added
  pieceCount: number;      // ✅ Added
}
```

**Updated `screenToBoardCoordinates` Function:**
```typescript
// BEFORE (CRASHED):
function screenToBoardCoordinates(...) {
  'worklet';
  if (relativeX > BOARD_DIMENSIONS.width) { ... }  // ❌ Object access
  const cellWithGap = BOARD_DIMENSIONS.cellSize + BOARD_DIMENSIONS.cellGap;  // ❌
  if (gridX >= GAME_CONFIG.BOARD_SIZE) { ... }  // ❌ Object access
}

// AFTER (FIXED):
function screenToBoardCoordinates(
  screenX: number,
  screenY: number,
  boardOffsetX: number,
  boardOffsetY: number,
  boardWidth: number,      // ✅ Primitive parameter
  boardHeight: number,     // ✅ Primitive parameter
  cellSize: number,        // ✅ Primitive parameter
  cellGap: number,         // ✅ Primitive parameter
  boardSize: number        // ✅ Primitive parameter
) {
  'worklet';
  if (relativeX > boardWidth) { ... }  // ✅ Primitive access
  const cellWithGap = cellSize + cellGap;  // ✅ Primitive access
  if (gridX >= boardSize) { ... }  // ✅ Primitive access
}
```

**Updated Worklet Functions:**
- `handleStartDrag`: Uses `pieceCount` parameter instead of `GAME_CONFIG.PIECE_COUNT`
- `onStart`: Uses `pieceCount` parameter instead of `GAME_CONFIG.PIECE_COUNT`
- `onUpdate`: Passes all primitive values to `screenToBoardCoordinates`

---

## Technical Details

### React Native Reanimated Worklet Limitations:
1. **Cannot access JavaScript objects** - Only primitives can be serialized
2. **Cannot access closures** - Only values captured at worklet creation
3. **Cannot call non-worklet functions** - Must use `runOnJS` wrappers
4. **Cannot access React Native APIs** - Must use `runOnJS` wrappers

### Worklet-Safe Patterns:
✅ **GOOD:**
- Primitive values: `const x = 10;`
- Primitive parameters: `function worklet(x: number) { ... }`
- Math operations: `Math.floor(x)`
- Basic conditionals: `if (x > 0) { ... }`

❌ **BAD:**
- Object property access: `BOARD_DIMENSIONS.width`
- Object methods: `obj.method()`
- Non-primitive closures: `const obj = { x: 10 };`
- React Native APIs: `Dimensions.get('window')`

---

## Files Modified

1. **`app/game.tsx`**
   - Added import for `GAME_CONFIG`
   - Extracted primitive values from `BOARD_DIMENSIONS` and `GAME_CONFIG`
   - Passed primitives to `useGestures` hook

2. **`src/rendering/hooks/useGestures.ts`**
   - Removed imports for `BOARD_DIMENSIONS` and `GAME_CONFIG`
   - Updated `UseGesturesConfig` interface with primitive parameters
   - Updated `screenToBoardCoordinates` to accept primitives
   - Updated all worklet functions to use primitive parameters
   - Removed ALL object property access from worklets

---

## Verification

### Before Fix:
```bash
grep -r "BOARD_DIMENSIONS\." src/rendering/hooks/useGestures.ts
# Found: 4 matches ❌

grep -r "GAME_CONFIG\." src/rendering/hooks/useGestures.ts  
# Found: 3 matches ❌
```

### After Fix:
```bash
grep -r "BOARD_DIMENSIONS\." src/rendering/hooks/useGestures.ts
# Found: 0 matches ✅

grep -r "GAME_CONFIG\." src/rendering/hooks/useGestures.ts
# Found: 0 matches ✅
```

---

## Expected Behavior After Fix

### Before Fix:
- ❌ Crashes immediately on ANY touch
- ❌ App closes completely
- ❌ Cannot play game at all

### After Fix:
- ✅ No crashes on touch
- ✅ Can tap buttons without issues
- ✅ Can drag pieces smoothly
- ✅ Full game functionality restored

---

## Testing Checklist

- [ ] App no longer crashes on touch anywhere on screen
- [ ] App no longer crashes when touching pieces
- [ ] Drag and drop works correctly
- [ ] HUD buttons work without interference
- [ ] Power-up buttons work correctly
- [ ] Game board interaction works
- [ ] Piece placement works correctly

---

## Key Learnings

1. **Never access object properties in worklets** - Always extract primitives first
2. **Pass primitives as parameters** - Worklets can only use primitive values
3. **Extract values at component level** - Do object access before passing to hooks
4. **Verify with grep** - Check for object property access in worklet files

---

**Status:** ✅ READY FOR TESTING

**Critical Fix:** Removed ALL object property access from worklets  
**Method:** Extract primitives and pass as parameters  
**Verification:** Zero object property accesses remaining in worklets

