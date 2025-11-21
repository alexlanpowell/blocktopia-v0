/**
 * Worklet-Safe Store Action Helpers
 * Wraps Zustand store actions to be safely callable from worklets
 * 
 * @module useGesturesHelpers
 */

import * as Haptics from 'expo-haptics';
import { useGameStore } from '../../store/gameStore';
import AudioManager, { SoundEffect } from '../../services/audio/AudioManager';

// JS-thread logging (not worklet-safe, for use in regular JS functions)
const logErrorJS = (message: string, error?: any) => {
  if (__DEV__) {
    const errorString = error 
      ? (error instanceof Error 
          ? `${error.message}\n${error.stack}` 
          : JSON.stringify(error))
      : 'Unknown error';
    console.error(`[JS] ${message}`, errorString);
  }
};

const logDebugJS = (message: string, data?: any) => {
  if (__DEV__) {
    const dataString = data ? JSON.stringify(data) : '';
    console.log(`[JS Debug] ${message}`, dataString || '');
  }
};

/**
 * Worklet-safe wrapper for starting a drag operation
 * Accepts separate x, y parameters to avoid object serialization issues across worklet boundaries
 * Also accepts touch offset to maintain precise finger tracking
 */
export const startDragOnJS = (pieceIndex: number, x: number, y: number, touchOffsetX: number, touchOffsetY: number) => {
  try {
    if (__DEV__) {
      console.log('[startDragOnJS] Called with:', pieceIndex, x, y, 'offset:', touchOffsetX, touchOffsetY);
    }
    
    const store = useGameStore.getState();
    if (!store) {
      logErrorJS('startDragOnJS: Store not available');
      return;
    }
    
    if (__DEV__) {
      console.log('[startDragOnJS] Store available, calling startDrag');
    }
    
    // Construct position object on JS thread (safe)
    const position = { x, y };
    const touchOffset = { x: touchOffsetX, y: touchOffsetY };
    store.startDrag(pieceIndex, position, touchOffset);
    
    // Play pickup sound
    AudioManager.playSoundEffect(SoundEffect.PIECE_PICKUP);
    
    if (__DEV__) {
      console.log('[startDragOnJS] startDrag completed successfully');
    }
  } catch (error) {
    if (__DEV__) {
      console.log('[startDragOnJS] ERROR:', String(error));
    }
    logErrorJS('startDragOnJS: Error starting drag', error);
  }
};

/**
 * Worklet-safe wrapper for updating drag position
 * Optimized for frequent calls during drag
 * Accepts separate x, y parameters to avoid object serialization issues across worklet boundaries
 */
export const updateDragOnJS = (
  x: number,
  y: number,
  boardX: number | null,
  boardY: number | null
) => {
  try {
    const store = useGameStore.getState();
    if (!store) {
      return; // Silent return - updateDrag is called frequently
    }
    
    // Quick check - only update if actually dragging
    const dragState = store.dragState;
    if (!dragState || !dragState.isDragging) {
      return; // Not dragging, skip update
    }
    
    // Construct position objects on JS thread (safe)
    const position = { x, y };
    const boardPosition = (boardX !== null && boardY !== null) ? { x: boardX, y: boardY } : null;
    
    store.updateDrag(position, boardPosition);
  } catch (error) {
    // Silent error handling for performance - updateDrag is called very frequently
    if (__DEV__) {
      logErrorJS('updateDragOnJS: Error updating drag', error);
    }
  }
};

/**
 * Worklet-safe wrapper for ending drag operation
 * Handles haptic feedback on successful placement (all on JS thread)
 */
export const endDragOnJS = (): boolean => {
  try {
    const store = useGameStore.getState();
    if (!store) {
      logErrorJS('endDragOnJS: Store not available');
      return false;
    }
    
    const success = store.endDrag();
    
    // Trigger haptic feedback and sound on successful placement (all on JS thread, no worklet boundary crossing)
    if (success) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        AudioManager.playSoundEffect(SoundEffect.PIECE_PLACE);
      } catch (hapticError) {
        // Haptics errors are non-critical, fail silently
        if (__DEV__) {
          logErrorJS('endDragOnJS: Haptic feedback error', hapticError);
        }
      }
    } else {
      // Play invalid sound if placement failed
      AudioManager.playSoundEffect(SoundEffect.PIECE_INVALID);
    }
    
    return success;
  } catch (error) {
    logErrorJS('endDragOnJS: Error ending drag', error);
    return false;
  }
};

/**
 * Worklet-safe wrapper for canceling drag operation
 */
export const cancelDragOnJS = () => {
  try {
    const store = useGameStore.getState();
    if (!store) {
      return; // Silent return
    }
    
    store.cancelDrag();
  } catch (error) {
    logErrorJS('cancelDragOnJS: Error canceling drag', error);
  }
};

/**
 * Worklet-safe wrapper for checking if piece can be placed
 * Note: This should be called from JS thread, not worklet
 */
export const canPieceBePlacedOnJS = (pieceIndex: number): boolean => {
  try {
    const store = useGameStore.getState();
    if (!store) {
      return false;
    }
    
    return store.canPieceBePlaced(pieceIndex);
  } catch (error) {
    logErrorJS('canPieceBePlacedOnJS: Error checking placement', error);
    return false;
  }
};

/**
 * Worklet-safe wrapper for haptic feedback
 */
export const triggerHapticOnJS = (style: Haptics.ImpactFeedbackStyle) => {
  try {
    Haptics.impactAsync(style);
  } catch (error) {
    // Haptics errors are non-critical, fail silently
  }
};

/**
 * Get drag state safely (for checking if dragging is active)
 * This should be called from JS thread
 */
export const getDragStateOnJS = () => {
  try {
    const store = useGameStore.getState();
    if (!store) {
      return null;
    }
    
    return store.dragState;
  } catch (error) {
    logErrorJS('getDragStateOnJS: Error getting drag state', error);
    return null;
  }
};

