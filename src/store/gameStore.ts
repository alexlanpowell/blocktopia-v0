/**
 * Zustand store for Blocktopia game state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState } from '../game/core/GameState';
import { Piece } from '../utils/types';

interface DragState {
  isDragging: boolean;
  draggedPieceIndex: number | null;
  draggedPiece: Piece | null;
  dragPosition: { x: number; y: number } | null;
  canPlace: boolean;
  targetPosition: { x: number; y: number } | null;
}

interface GameStore {
  // Core game state
  gameState: GameState;
  
  // Drag and drop state
  dragState: DragState;

  // Actions
  placePiece: (pieceIndex: number, x: number, y: number) => boolean;
  restartGame: () => void;
  
  // Drag actions
  startDrag: (pieceIndex: number, position: { x: number; y: number }) => void;
  updateDrag: (position: { x: number; y: number }, boardPosition: { x: number; y: number } | null) => void;
  endDrag: () => boolean;
  cancelDrag: () => void;

  // Getters
  getScore: () => number;
  getBestScore: () => number;
  isGameOver: () => boolean;
  getCurrentPieces: () => Piece[];
  canPieceBePlaced: (pieceIndex: number) => boolean;
}

const initialDragState: DragState = {
  isDragging: false,
  draggedPieceIndex: null,
  draggedPiece: null,
  dragPosition: null,
  canPlace: false,
  targetPosition: null,
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initialize game state
    gameState: new GameState(),
    dragState: initialDragState,

    // Place a piece on the board
    placePiece: (pieceIndex: number, x: number, y: number) => {
      const { gameState } = get();
      const success = gameState.placePiece(pieceIndex, x, y);
      
      if (success) {
        // Trigger re-render by creating new reference
        set(state => {
          state.gameState = gameState;
        });
      }

      return success;
    },

    // Restart the game
    restartGame: () => {
      set(state => {
        state.gameState.restart();
        state.dragState = initialDragState;
      });
    },

    // Start dragging a piece
    startDrag: (pieceIndex: number, position: { x: number; y: number }) => {
      set(state => {
        const piece = state.gameState.getPiece(pieceIndex);
        state.dragState = {
          isDragging: true,
          draggedPieceIndex: pieceIndex,
          draggedPiece: piece,
          dragPosition: position,
          canPlace: false,
          targetPosition: null,
        };
      });
    },

    // Update drag position
    updateDrag: (position: { x: number; y: number }, boardPosition: { x: number; y: number } | null) => {
      set(state => {
        const { gameState, dragState } = state;
        
        if (!dragState.isDragging || dragState.draggedPieceIndex === null) {
          return;
        }

        state.dragState.dragPosition = position;

        // Check if piece can be placed at board position
        if (boardPosition) {
          const piece = gameState.getPiece(dragState.draggedPieceIndex);
          if (piece) {
            const canPlace = gameState.board.canPlacePiece(piece, boardPosition.x, boardPosition.y);
            state.dragState.canPlace = canPlace;
            state.dragState.targetPosition = canPlace ? boardPosition : null;
          }
        } else {
          state.dragState.canPlace = false;
          state.dragState.targetPosition = null;
        }
      });
    },

    // End drag and attempt to place piece
    endDrag: () => {
      const { dragState, gameState } = get();

      if (!dragState.isDragging || dragState.draggedPieceIndex === null) {
        return false;
      }

      let success = false;

      if (dragState.canPlace && dragState.targetPosition) {
        success = gameState.placePiece(
          dragState.draggedPieceIndex,
          dragState.targetPosition.x,
          dragState.targetPosition.y
        );
      }

      // Reset drag state
      set(state => {
        state.dragState = initialDragState;
        if (success) {
          state.gameState = gameState;
        }
      });

      return success;
    },

    // Cancel drag without placing
    cancelDrag: () => {
      set(state => {
        state.dragState = initialDragState;
      });
    },

    // Getters
    getScore: () => get().gameState.score,
    getBestScore: () => get().gameState.bestScore,
    isGameOver: () => get().gameState.isGameOver,
    getCurrentPieces: () => get().gameState.currentPieces,
    canPieceBePlaced: (pieceIndex: number) => get().gameState.canPieceBePlaced(pieceIndex),
  }))
);

// Selector hooks for performance optimization
export const useScore = () => useGameStore(state => state.gameState.score);
export const useBestScore = () => useGameStore(state => state.gameState.bestScore);
export const useIsGameOver = () => useGameStore(state => state.gameState.isGameOver);
export const useCurrentPieces = () => useGameStore(state => state.gameState.currentPieces);
export const useDragState = () => useGameStore(state => state.dragState);
export const useBoard = () => useGameStore(state => state.gameState.board);

