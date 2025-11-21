# Gesture System Architecture

## Overview

The Blocktopia gesture system enables smooth drag-and-drop piece placement using React Native Gesture Handler and Reanimated. This document explains the architecture, patterns, and best practices.

## Architecture

### Core Components

1. **`useGestures.ts`** - Main gesture hook that creates and configures pan gestures
2. **`useGesturesHelpers.ts`** - Worklet-safe wrappers for store actions
3. **`workletLogger.ts`** - Worklet-safe logging utilities
4. **`GameBoard.tsx`** - Renders board with drag preview highlights
5. **`DragPreview.tsx`** - Floating preview that follows finger/cursor

### Key Patterns

#### Worklet-Safe Store Access

**Problem:** Zustand store cannot be accessed directly from Reanimated worklets (UI thread).

**Solution:** All store access is wrapped with `runOnJS` to execute on the JS thread.

```typescript
// ❌ BAD: Direct store access in worklet
const store = useGameStore.getState();
store.startDrag(...);

// ✅ GOOD: Wrapped in runOnJS
const startDragWrapper = runOnJS(startDragOnJS);
startDragWrapper(pieceIndex, position);
```

#### Optimistic Drag Initiation

**Pattern:** Always allow drag to start, validate placement during movement.

**Rationale:** Better UX - users can see where pieces can/cannot be placed rather than being blocked from dragging.

```typescript
// Always start drag, validation happens in updateDrag
handleStartDrag(pieceIndex, touchX, touchY);
// No blocking canPieceBePlaced check
```

#### Worklet-Safe Logging

**Problem:** `console.error` in worklets serializes incorrectly, showing `{}`.

**Solution:** Use worklet-safe logging utilities that serialize errors properly.

```typescript
import { logError } from '../../utils/workletLogger';

// In worklet:
logError('Error message', error); // Properly serialized
```

## Data Flow

```
User Touch
    ↓
Gesture.onStart (worklet)
    ↓
handleStartDrag (worklet)
    ↓
startDragWrapper (runOnJS)
    ↓
startDragOnJS (JS thread)
    ↓
useGameStore.startDrag()
    ↓
Update dragState
    ↓
React re-render
    ↓
GameBoard shows preview
DragPreview follows finger
```

## State Management

### Drag State Structure

```typescript
interface DragState {
  isDragging: boolean;
  draggedPieceIndex: number | null;
  draggedPiece: Piece | null;
  dragPosition: { x: number; y: number } | null;  // Screen coordinates
  canPlace: boolean;
  targetPosition: { x: number; y: number } | null; // Board grid coordinates
}
```

### State Updates

- **onStart:** Sets `isDragging = true`, initializes piece and position
- **onUpdate:** Updates `dragPosition`, calculates `targetPosition`, validates `canPlace`
- **onEnd:** Attempts placement, resets drag state
- **onFinalize:** Cancels drag if gesture was interrupted

## Performance Optimizations

1. **Early Returns:** `updateDragOnJS` checks if dragging before updating
2. **Memoization:** GameBoard cells are memoized, only recalculate on state change
3. **Silent Errors:** Frequent operations (updateDrag) fail silently in production
4. **Conditional Rendering:** DragPreview only renders when dragging

## Error Handling

### Worklet Errors

All worklet operations are wrapped in try-catch with worklet-safe logging:

```typescript
try {
  // worklet code
} catch (error) {
  logError('Operation failed', error);
}
```

### Store Errors

Store actions handle errors gracefully:

```typescript
try {
  const store = useGameStore.getState();
  store.action();
} catch (error) {
  logError('Store action failed', error);
  return false; // Safe default
}
```

## Visual Feedback

### Board Preview

- **Valid Placement:** Green highlight with piece gradient (70% opacity)
- **Invalid Placement:** Red highlight (50% opacity)
- **Empty Cells:** Dark background (30% opacity)

### Floating Preview

- Follows finger/cursor position
- Shows piece with gradient
- Opacity: 90% (valid) or 60% (invalid)
- Centered on touch point

## Testing Checklist

- [ ] Tap piece → Drag → Place on valid position
- [ ] Tap piece → Drag → Release on invalid position
- [ ] Tap piece → Drag → Cancel (drag outside)
- [ ] Rapid successive taps
- [ ] Drag during game over state
- [ ] Drag with no valid placements
- [ ] Multiple pieces in quick succession

## Troubleshooting

### Blocks Don't Move

1. Check if `startDrag` is being called (check logs)
2. Verify `dragState.isDragging` is true
3. Ensure gesture overlay covers piece preview area
4. Check `piecePreviewY` calculation

### Empty Error Objects `{}`

- Use `logError` from `workletLogger` instead of `console.error`
- Errors are now properly serialized

### Performance Issues

- Check if `updateDrag` is being called too frequently
- Verify memoization in GameBoard
- Profile with React DevTools

## Future Enhancements

1. **Gesture Customization:** Sensitivity, dead zones
2. **Multi-touch:** Rotate pieces with two fingers
3. **Haptic Feedback:** Different patterns for valid/invalid
4. **Animations:** Smooth piece placement animations
5. **Analytics:** Track gesture usage patterns

