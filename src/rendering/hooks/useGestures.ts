/**
 * Gesture handlers for drag-and-drop piece placement
 * Using Gesture API (Reanimated v4)
 * 
 * Architecture:
 * - Uses Reanimated v4 Gesture API
 * - All store access happens via runOnJS inline calls
 * - Drag operations are optimistic (always allow drag, validate during movement)
 */

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  startDragOnJS,
  updateDragOnJS,
  endDragOnJS,
  cancelDragOnJS,
  triggerHapticOnJS,
} from './useGesturesHelpers';

/**
 * Convert screen coordinates to board grid coordinates (floating point for snapping)
 * This function is called from worklets, so it needs to be worklet-compatible
 * All values must be primitives (no object property access in worklets)
 * @returns Floating point grid coordinates for precise snapping, or null if outside board
 */
function screenToBoardCoordinatesFloat(
  screenX: number,
  screenY: number,
  boardOffsetX: number,
  boardOffsetY: number,
  boardWidth: number,
  boardHeight: number,
  cellSize: number,
  cellGap: number,
  boardSize: number
): { x: number; y: number } | null {
  'worklet';
  // Adjust for board offset
  const relativeX = screenX - boardOffsetX;
  const relativeY = screenY - boardOffsetY;

  // Check if within board bounds
  if (
    relativeX < 0 ||
    relativeY < 0 ||
    relativeX > boardWidth ||
    relativeY > boardHeight
  ) {
    return null;
  }

  // Calculate grid position as floating point (with gaps considered)
  const cellWithGap = cellSize + cellGap;
  const gridX = (relativeX - cellGap) / cellWithGap;
  const gridY = (relativeY - cellGap) / cellWithGap;

  // Validate grid bounds
  if (
    gridX < 0 ||
    gridY < 0 ||
    gridX >= boardSize ||
    gridY >= boardSize
  ) {
    return null;
  }

  return { x: gridX, y: gridY };
}

/**
 * Convert screen coordinates to board grid coordinates (integer for direct placement)
 * This function is called from worklets, so it needs to be worklet-compatible
 * All values must be primitives (no object property access in worklets)
 */
function screenToBoardCoordinates(
  screenX: number,
  screenY: number,
  boardOffsetX: number,
  boardOffsetY: number,
  boardWidth: number,
  boardHeight: number,
  cellSize: number,
  cellGap: number,
  boardSize: number
): { x: number; y: number } | null {
  'worklet';
  const floatCoords = screenToBoardCoordinatesFloat(
    screenX, screenY, boardOffsetX, boardOffsetY,
    boardWidth, boardHeight, cellSize, cellGap, boardSize
  );
  
  if (!floatCoords) {
    return null;
  }
  
  return {
    x: Math.floor(floatCoords.x),
    y: Math.floor(floatCoords.y)
  };
}

interface UseGesturesConfig {
  boardOffsetX: number;
  boardOffsetY: number;
  piecePreviewY: number;
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
  cellGap: number;
  boardSize: number;
  pieceCount: number;
  screenWidth: number;
}

export function useGestures(config: UseGesturesConfig) {
  const { 
    boardOffsetX, 
    boardOffsetY, 
    piecePreviewY,
    boardWidth,
    boardHeight,
    cellSize,
    cellGap,
    boardSize,
    pieceCount,
    screenWidth,
  } = config;

  // Use Gesture.Pan() API (Reanimated v4)
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
    .onStart((event) => {
      'worklet';
      
      const { y: touchY, x: touchX } = event;
      
      // IMPORTANT: Since GestureDetector wraps only PiecePreview,
      // event coordinates are relative to PiecePreview (not screen)
      // touchX: 0 to screenWidth (preview spans full width)
      // touchY: 0 to 150 (preview height)
      
      // Calculate which piece was touched (0, 1, or 2) based on X position
      const pieceIndex = Math.floor((touchX / screenWidth) * pieceCount);
      const clampedIndex = Math.max(0, Math.min(pieceIndex, pieceCount - 1));
      
      // Calculate piece container center (pieces are centered in their containers)
      const pieceContainerWidth = screenWidth / pieceCount;
      const pieceCenterXInContainer = pieceContainerWidth / 2;
      const pieceCenterX = (clampedIndex * pieceContainerWidth) + pieceCenterXInContainer;
      const pieceCenterY = 75; // Center of 150px preview height
      
      // Convert to absolute screen coordinates
      const absoluteX = pieceCenterX;
      const absoluteY = pieceCenterY + piecePreviewY;
      
      // Calculate offset from touch point to piece center (for precise tracking)
      const touchOffsetX = touchX - pieceCenterX;
      const touchOffsetY = touchY - pieceCenterY;
      
      if (__DEV__) {
        console.log(`[Gesture Start] Piece: ${clampedIndex}, Center: (${absoluteX}, ${absoluteY}), Offset: (${touchOffsetX}, ${touchOffsetY})`);
      }
      
      // Trigger haptic feedback
      runOnJS(triggerHapticOnJS)(Haptics.ImpactFeedbackStyle.Light);
      
      // Start drag with piece center coordinates and touch offset
      runOnJS(startDragOnJS)(clampedIndex, absoluteX, absoluteY, touchOffsetX, touchOffsetY);
    })
    .onUpdate((event) => {
      'worklet';
      
      // Convert local coordinates to absolute screen coordinates
      const absoluteX = event.x;
      const absoluteY = event.y + piecePreviewY;
      
      // Calculate board position using absolute coordinates (floating point for snapping)
      const boardPositionFloat = screenToBoardCoordinatesFloat(
        absoluteX,
        absoluteY,
        boardOffsetX,
        boardOffsetY,
        boardWidth,
        boardHeight,
        cellSize,
        cellGap,
        boardSize
      );
      
      // Pass floating point coordinates to store for snap calculation
      const boardX = boardPositionFloat ? boardPositionFloat.x : null;
      const boardY = boardPositionFloat ? boardPositionFloat.y : null;
      
      runOnJS(updateDragOnJS)(absoluteX, absoluteY, boardX, boardY);
    })
    .onEnd(() => {
      'worklet';
      // Try to place the piece
      runOnJS(endDragOnJS)();
    })
    .onFinalize(() => {
      'worklet';
      // Cancel drag if gesture was cancelled
      runOnJS(cancelDragOnJS)();
    })
    .shouldCancelWhenOutside(false);

  return { panGesture };
}
