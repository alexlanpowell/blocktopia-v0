/**
 * Gesture handlers for drag-and-drop piece placement
 * Adapted from Unity InputManager.cs
 */

import { Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { BOARD_DIMENSIONS } from '../components/GameBoard';
import { GAME_CONFIG } from '../../game/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Convert screen coordinates to board grid coordinates
 */
function screenToBoardCoordinates(
  screenX: number,
  screenY: number,
  boardOffsetX: number,
  boardOffsetY: number
): { x: number; y: number } | null {
  // Adjust for board offset
  const relativeX = screenX - boardOffsetX;
  const relativeY = screenY - boardOffsetY;

  // Check if within board bounds
  if (
    relativeX < 0 ||
    relativeY < 0 ||
    relativeX > BOARD_DIMENSIONS.width ||
    relativeY > BOARD_DIMENSIONS.height
  ) {
    return null;
  }

  // Calculate grid position (with gaps considered)
  const cellWithGap = BOARD_DIMENSIONS.cellSize + BOARD_DIMENSIONS.cellGap;
  const gridX = Math.floor((relativeX - BOARD_DIMENSIONS.cellGap) / cellWithGap);
  const gridY = Math.floor((relativeY - BOARD_DIMENSIONS.cellGap) / cellWithGap);

  // Validate grid bounds
  if (
    gridX < 0 ||
    gridY < 0 ||
    gridX >= GAME_CONFIG.BOARD_SIZE ||
    gridY >= GAME_CONFIG.BOARD_SIZE
  ) {
    return null;
  }

  return { x: gridX, y: gridY };
}

interface UseGesturesConfig {
  boardOffsetX: number;
  boardOffsetY: number;
  piecePreviewY: number;
  onPiecePlaced?: () => void;
}

export function useGestures(config: UseGesturesConfig) {
  const { boardOffsetX, boardOffsetY, piecePreviewY, onPiecePlaced } = config;

  const panGesture = Gesture.Pan()
    .onStart(event => {
      const { y: touchY, x: touchX } = event;

      // Check if touch started on piece preview area
      if (touchY > piecePreviewY) {
        // Determine which piece was touched (0, 1, or 2) based on screen width
        const pieceIndex = Math.floor((touchX / SCREEN_WIDTH) * GAME_CONFIG.PIECE_COUNT);

        if (pieceIndex >= 0 && pieceIndex < GAME_CONFIG.PIECE_COUNT) {
          const store = useGameStore.getState();
          // Check if piece can be placed anywhere
          if (store.canPieceBePlaced(pieceIndex)) {
            store.startDrag(pieceIndex, { x: touchX, y: touchY });
          }
        }
      }
    })
    .onUpdate(event => {
      const store = useGameStore.getState();
      const dragState = store.dragState;

      if (!dragState.isDragging) {
        return;
      }

      // Update drag position
      const screenPosition = { x: event.x, y: event.y };

      // Convert to board coordinates
      const boardPosition = screenToBoardCoordinates(event.x, event.y, boardOffsetX, boardOffsetY);

      store.updateDrag(screenPosition, boardPosition);
    })
    .onEnd(event => {
      const store = useGameStore.getState();
      const dragState = store.dragState;

      if (!dragState.isDragging) {
        return;
      }

      // Try to place the piece
      const success = store.endDrag();

      if (success && onPiecePlaced) {
        onPiecePlaced();
      }
    })
    .onFinalize(() => {
      // Cancel drag if gesture was cancelled
      const store = useGameStore.getState();
      const dragState = store.dragState;
      if (dragState.isDragging) {
        store.cancelDrag();
      }
    });

  return { panGesture };
}

