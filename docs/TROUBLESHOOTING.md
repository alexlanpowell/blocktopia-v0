# Troubleshooting Guide - Gesture System

## Common Issues and Solutions

### Issue: Blocks Don't Move When Tapped

**Symptoms:**
- Tapping pieces does nothing
- No visual feedback
- No errors in console

**Diagnosis Steps:**
1. Check if gesture handler is initialized:
   ```typescript
   // In app/game.tsx, verify panGesture is created
   const { panGesture } = useGestures({...});
   ```

2. Verify gesture overlay covers piece preview:
   ```typescript
   // gestureOverlay should cover piece preview area
   style={[styles.gestureOverlay, { bottom: insets.bottom }]}
   ```

3. Check piecePreviewY calculation:
   ```typescript
   const PIECE_PREVIEW_Y = SCREEN_HEIGHT - PIECE_PREVIEW_HEIGHT - insets.bottom;
   // Should match piece preview container position
   ```

**Solutions:**
- Ensure `GestureDetector` wraps the gesture overlay
- Verify `piecePreviewY` matches actual preview position
- Check if `onStart` is being called (add logDebug)

---

### Issue: Empty Error Objects `{}` in Console

**Symptoms:**
- Console shows `Error: {}`
- No error details visible
- Errors occur in worklet context

**Root Cause:**
- `console.error` in worklets doesn't serialize Error objects correctly

**Solution:**
```typescript
// ❌ BAD
console.error('Error', error);

// ✅ GOOD
import { logError } from '../../utils/workletLogger';
logError('Error', error);
```

---

### Issue: Drag Starts But Piece Doesn't Follow Finger

**Symptoms:**
- Drag initiates (haptic feedback)
- Piece doesn't move with finger
- No visual preview

**Diagnosis Steps:**
1. Check if `updateDrag` is being called:
   ```typescript
   // Add logging in updateDragOnJS
   logDebug('updateDrag', { position, boardPosition });
   ```

2. Verify `dragPosition` is updating:
   ```typescript
   // Check dragState in React DevTools
   dragState.dragPosition // Should update on finger movement
   ```

3. Check DragPreview component:
   ```typescript
   // Verify DragPreview is rendered
   // Check if dragState.isDragging is true
   ```

**Solutions:**
- Ensure `onUpdate` handler is calling `handleUpdateDrag`
- Verify `dragPosition` is being set in store
- Check if DragPreview is in component tree

---

### Issue: Piece Can't Be Placed Even on Valid Position

**Symptoms:**
- Drag works, preview shows
- Release on valid position doesn't place piece
- No error messages

**Diagnosis Steps:**
1. Check `canPlace` flag:
   ```typescript
   // Should be true when over valid position
   dragState.canPlace
   ```

2. Verify `targetPosition` is set:
   ```typescript
   // Should have grid coordinates when over board
   dragState.targetPosition // { x: number, y: number }
   ```

3. Check board coordinate calculation:
   ```typescript
   // screenToBoardCoordinates should return valid position
   const boardPos = screenToBoardCoordinates(x, y, offsetX, offsetY);
   ```

**Solutions:**
- Verify `BOARD_OFFSET_X` and `BOARD_OFFSET_Y` are correct
- Check if `canPlacePiece` logic is correct
- Ensure piece structure is valid

---

### Issue: Performance Issues During Drag

**Symptoms:**
- Laggy drag movement
- Frame drops
- High CPU usage

**Diagnosis Steps:**
1. Profile with React DevTools Profiler
2. Check update frequency:
   ```typescript
   // updateDrag is called on every gesture update
   // Should be optimized with early returns
   ```

3. Verify memoization:
   ```typescript
   // GameBoard cells should be memoized
   const boardCells = useMemo(() => {...}, [grid, dragState]);
   ```

**Solutions:**
- Add early return in `updateDragOnJS` if not dragging
- Ensure GameBoard memoization includes dragState
- Reduce DragPreview re-renders with proper memoization

---

### Issue: Gesture Conflicts with Buttons

**Symptoms:**
- Buttons don't respond
- Gesture triggers instead of button press
- UI elements unresponsive

**Root Cause:**
- `GestureDetector` wrapping too much of the UI

**Solution:**
```typescript
// ✅ GOOD: Only wrap piece preview area
<GestureDetector gesture={panGesture}>
  <View style={styles.gestureOverlay} />
</GestureDetector>

// ❌ BAD: Wrapping entire screen
<GestureDetector gesture={panGesture}>
  <View style={styles.gameContainer}>
    {/* All UI */}
  </View>
</GestureDetector>
```

---

### Issue: Drag Doesn't Cancel Properly

**Symptoms:**
- Drag state persists after release
- Piece stuck in dragging state
- Can't start new drag

**Diagnosis Steps:**
1. Check `onFinalize` handler:
   ```typescript
   // Should cancel drag if still active
   .onFinalize(() => {
     // Cancel logic
   })
   ```

2. Verify `cancelDrag` is called:
   ```typescript
   // Should reset dragState to initial state
   cancelDragOnJS();
   ```

**Solutions:**
- Ensure `onFinalize` checks and cancels drag
- Add timeout fallback for stuck drags
- Verify `cancelDrag` resets all drag state

---

## Debug Mode

Enable verbose logging:

```typescript
// In useGesturesHelpers.ts
if (__DEV__) {
  logDebug('Operation', { data });
}
```

Check logs for:
- `handleStartDrag` - Drag initiation
- `updateDragOnJS` - Position updates
- `endDragOnJS` - Placement attempts
- `cancelDragOnJS` - Cancellations

---

## Performance Profiling

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Perform drag operation
5. Stop recording
6. Analyze flame graph

### Key Metrics

- **Render time:** Should be <16ms for 60fps
- **Update frequency:** updateDrag called ~60 times/sec
- **Re-renders:** Only GameBoard and DragPreview should update

---

## Getting Help

If issues persist:

1. Check console for errors (use worklet-safe logging)
2. Verify all dependencies are up to date
3. Test on physical device (not just simulator)
4. Check React Native and Gesture Handler versions
5. Review gesture system documentation

