/**
 * Zustand store for Blocktopia game state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState } from '../game/core/GameState';
import { Piece } from '../utils/types';
import { PowerUpType } from './monetizationStore';
import { powerUpGameIntegration } from '../services/powerups/PowerUpGameIntegration';

interface DragState {
  isDragging: boolean;
  draggedPieceIndex: number | null;
  draggedPiece: Piece | null;
  dragPosition: { x: number; y: number } | null;
  canPlace: boolean;
  targetPosition: { x: number; y: number } | null;
}

interface PowerUpState {
  activeType: PowerUpType | null;
  awaitingLineSelection: boolean;
  selectedLine: { isRow: boolean; index: number } | null;
}

interface GameStore {
  // Core game state
  gameState: GameState;
  
  // Drag and drop state
  dragState: DragState;

  // Power-up state
  powerUpState: PowerUpState;

  // Actions
  placePiece: (pieceIndex: number, x: number, y: number) => boolean;
  restartGame: () => void;
  continueGame: () => void;
  
  // Drag actions
  startDrag: (pieceIndex: number, position: { x: number; y: number }) => void;
  updateDrag: (position: { x: number; y: number }, boardPosition: { x: number; y: number } | null) => void;
  endDrag: () => boolean;
  cancelDrag: () => void;

  // Power-up actions
  usePowerUp: (type: PowerUpType) => Promise<{ success: boolean; message?: string; error?: string }>;
  selectLineForBlaster: (isRow: boolean, index: number) => Promise<void>;
  cancelPowerUp: () => void;

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

const initialPowerUpState: PowerUpState = {
  activeType: null,
  awaitingLineSelection: false,
  selectedLine: null,
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initialize game state
    gameState: new GameState(),
    dragState: initialDragState,
    powerUpState: initialPowerUpState,

    // Place a piece on the board
    placePiece: (pieceIndex: number, x: number, y: number) => {
      const { gameState } = get();
      
      // Save state for undo before placing
      powerUpGameIntegration.saveGameState(gameState);
      
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
        state.powerUpState = initialPowerUpState;
      });
      // Clear undo history
      powerUpGameIntegration.clearHistory();
    },

    // Continue game after watching ad
    continueGame: () => {
      set(state => {
        state.gameState.continue();
        state.dragState = initialDragState;
      });
    },

    // Start dragging a piece
    startDrag: (pieceIndex: number, position: { x: number; y: number }) => {
      set(state => {
        // Null check: ensure game state exists and is valid
        if (!state.gameState || state.gameState.isGameOver) {
          return;
        }

        const piece = state.gameState.getPiece(pieceIndex);
        
        // Null check: ensure piece exists
        if (!piece) {
          return;
        }

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
        
        // Null checks: ensure all required state exists
        if (!gameState || !dragState || !dragState.isDragging || dragState.draggedPieceIndex === null) {
          return;
        }

        state.dragState.dragPosition = position;

        // Check if piece can be placed at board position
        if (boardPosition) {
          const piece = gameState.getPiece(dragState.draggedPieceIndex);
          if (piece && gameState.board) {
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

      // Null checks: ensure all required state exists
      if (!gameState || !dragState || !dragState.isDragging || dragState.draggedPieceIndex === null) {
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

    // Use a power-up
    usePowerUp: async (type: PowerUpType) => {
      const { gameState } = get();
      
      if (!gameState) {
        return { success: false, error: 'Game state not available' };
      }

      let result;

      switch (type) {
        case PowerUpType.MAGIC_WAND:
          result = await powerUpGameIntegration.applyMagicWand(gameState);
          break;

        case PowerUpType.PIECE_SWAP:
          result = await powerUpGameIntegration.applyPieceSwap(gameState);
          break;

        case PowerUpType.UNDO_MOVE:
          result = await powerUpGameIntegration.applyUndoMove(gameState);
          break;

        case PowerUpType.LINE_BLASTER:
          // Set state to await line selection
          set(state => {
            state.powerUpState = {
              activeType: PowerUpType.LINE_BLASTER,
              awaitingLineSelection: true,
              selectedLine: null,
            };
          });
          return { success: true, message: 'Select a row or column to clear' };

        default:
          return { success: false, error: 'Unknown power-up type' };
      }

      // Trigger re-render
      if (result.success) {
        set(state => {
          state.gameState = gameState;
          state.powerUpState = initialPowerUpState;
        });
      }

      return result;
    },

    // Select line for Line Blaster power-up
    selectLineForBlaster: async (isRow: boolean, index: number) => {
      const { gameState, powerUpState } = get();

      if (!gameState) {
        console.error('Game state not available');
        return;
      }

      if (powerUpState.activeType !== PowerUpType.LINE_BLASTER) {
        console.error('Line Blaster not active');
        return;
      }

      const result = await powerUpGameIntegration.applyLineBlaster(
        gameState,
        isRow,
        index
      );

      if (result.success) {
        set(state => {
          state.gameState = gameState;
          state.powerUpState = initialPowerUpState;
        });
      } else {
        // Reset power-up state on failure
        set(state => {
          state.powerUpState = initialPowerUpState;
        });
      }
    },

    // Cancel active power-up
    cancelPowerUp: () => {
      set(state => {
        state.powerUpState = initialPowerUpState;
      });
    },

  // Getters with null checks
  getScore: () => {
    const { gameState } = get();
    return gameState ? gameState.score : 0;
  },
  getBestScore: () => {
    const { gameState } = get();
    return gameState ? gameState.bestScore : 0;
  },
  isGameOver: () => {
    const { gameState } = get();
    return gameState ? gameState.isGameOver : false;
  },
  getCurrentPieces: () => {
    const { gameState } = get();
    return gameState ? gameState.currentPieces : [];
  },
  canPieceBePlaced: (pieceIndex: number) => {
    const { gameState } = get();
    if (!gameState || gameState.isGameOver) {
      return false;
    }
    return gameState.canPieceBePlaced(pieceIndex);
  },
  }))
);

// Selector hooks for performance optimization with null checks
export const useScore = () => useGameStore(state => state.gameState?.score ?? 0);
export const useBestScore = () => useGameStore(state => state.gameState?.bestScore ?? 0);
export const useIsGameOver = () => useGameStore(state => state.gameState?.isGameOver ?? false);
export const useCurrentPieces = () => useGameStore(state => state.gameState?.currentPieces ?? []);
export const useDragState = () => useGameStore(state => state.dragState);
export const useBoard = () => useGameStore(state => state.gameState?.board!);
export const usePowerUpState = () => useGameStore(state => state.powerUpState);

