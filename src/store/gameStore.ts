/**
 * Zustand store for Blocktopia game state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState } from '../game/core/GameState';
import { Piece } from '../utils/types';
import { PowerUpType } from './monetizationStore';
import { powerUpGameIntegration } from '../services/powerups/PowerUpGameIntegration';
import { GAME_CONFIG } from '../game/constants';
import { HighScoreService } from '../services/scoring/HighScoreService';
import { GamePersistenceService } from '../services/game/GamePersistenceService';
import { useMonetizationStore } from './monetizationStore';
import * as Haptics from 'expo-haptics';

interface DragState {
  isDragging: boolean;
  draggedPieceIndex: number | null;
  draggedPiece: Piece | null;
  dragPosition: { x: number; y: number } | null;
  canPlace: boolean;
  targetPosition: { x: number; y: number } | null;
  // Offset from touch point to piece center (for precise tracking)
  touchOffset: { x: number; y: number } | null;
  // Track snap state for haptic feedback
  isSnapped: boolean;
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

  // High score state
  highScore: number;
  isLoadingHighScore: boolean;
  highScoreError: string | null;

  // Actions
  placePiece: (pieceIndex: number, x: number, y: number) => boolean;
  restartGame: () => void;
  continueGame: () => void;
  
  // High score actions
  loadHighScore: (userId: string | null) => Promise<void>;
  syncHighScore: (userId: string | null) => Promise<void>;
  
  // Drag actions
  startDrag: (pieceIndex: number, position: { x: number; y: number }, touchOffset?: { x: number; y: number } | null) => void;
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
  touchOffset: null,
  isSnapped: false,
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
    
    // High score state
    highScore: 0,
    isLoadingHighScore: false,
    highScoreError: null,

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
        // Create a completely new GameState instance to ensure deep state updates
        const newGameState = new GameState(state.gameState.bestScore);
        state.gameState = newGameState;
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
    startDrag: (pieceIndex: number, position: { x: number; y: number }, touchOffset?: { x: number; y: number } | null) => {
      try {
        set(state => {
          // Null check: ensure game state exists and is valid
          if (!state.gameState || state.gameState.isGameOver) {
            if (__DEV__) {
              console.warn(`[startDrag] Game state invalid or game over`);
            }
            return;
          }

          // Validate piece index
          if (pieceIndex < 0 || pieceIndex >= GAME_CONFIG.PIECE_COUNT) {
            if (__DEV__) {
              console.warn(`[startDrag] Invalid piece index: ${pieceIndex}`);
            }
            return;
          }

          // Ensure currentPieces array exists and has items
          if (!state.gameState.currentPieces || state.gameState.currentPieces.length === 0) {
            if (__DEV__) {
              console.warn(`[startDrag] No pieces available`);
            }
            return;
          }

          const piece = state.gameState.getPiece(pieceIndex);
          
          // Null check: ensure piece exists
          if (!piece) {
            if (__DEV__) {
              console.warn(`[startDrag] Piece not found at index: ${pieceIndex}`);
            }
            return;
          }

          // Validate piece structure
          if (!piece.structure || !Array.isArray(piece.structure) || piece.structure.length === 0) {
            if (__DEV__) {
              console.warn(`[startDrag] Invalid piece structure at index: ${pieceIndex}`);
            }
            return;
          }

          state.dragState = {
            isDragging: true,
            draggedPieceIndex: pieceIndex,
            draggedPiece: piece,
            dragPosition: position,
            canPlace: false,
            targetPosition: null,
            touchOffset: touchOffset || null,
            isSnapped: false,
          };
        });
      } catch (error) {
        if (__DEV__) {
          console.error('[startDrag] Error starting drag:', error);
        }
        // Reset drag state on error
        set(state => {
          state.dragState = initialDragState;
        });
      }
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
            // Try smart snapping first (tolerance: 0.4 cells = 40% of cell size)
            // This helps with easier placement without making the game too easy
            const snapPosition = gameState.board.findBestSnapPosition(
              boardPosition.x,
              boardPosition.y,
              piece,
              0.4 // Balanced tolerance for good UX without losing challenge
            );
            
            // Use snapped position if available, otherwise use raw grid position
            const targetPosition = snapPosition || {
              x: Math.floor(boardPosition.x),
              y: Math.floor(boardPosition.y)
            };
            
            // Check if piece can be placed at the target position
            const canPlace = gameState.board.canPlacePiece(piece, targetPosition.x, targetPosition.y);
            
            // Track snap state change for haptic feedback
            const wasSnapped = dragState.isSnapped;
            const isSnapped = snapPosition !== null && canPlace;
            
            // Trigger haptic feedback when entering snap zone
            if (!wasSnapped && isSnapped) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            
            state.dragState.isSnapped = isSnapped;
            state.dragState.canPlace = canPlace;
            // Always set targetPosition when over board (for preview), even if can't place
            state.dragState.targetPosition = targetPosition;
          } else {
            state.dragState.canPlace = false;
            state.dragState.targetPosition = null;
            state.dragState.isSnapped = false;
          }
        } else {
          state.dragState.canPlace = false;
          state.dragState.targetPosition = null;
          state.dragState.isSnapped = false;
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
          
          // Check if new high score achieved
          const currentScore = gameState.score;
          if (currentScore > state.highScore) {
            state.highScore = currentScore;
            // Sync high score asynchronously (don't block)
            const userId = useMonetizationStore.getState().user.userId;
            HighScoreService.updateHighScore(userId, currentScore).catch((error) => {
              if (__DEV__) {
                console.warn('[GameStore] Failed to update high score:', error);
              }
            });
          }
          
          // Auto-save game state (debounced)
          const userId = useMonetizationStore.getState().user.userId;
          // Use the gameState from closure, not state.gameState (which is a draft)
          GamePersistenceService.triggerAutoSave(() => gameState, userId);
          
          // Clear saved game if game over
          if (gameState.isGameOver) {
            GamePersistenceService.clearSavedGame().catch((error) => {
              if (__DEV__) {
                console.warn('[GameStore] Failed to clear saved game:', error);
              }
            });
          }
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

    // Load high score from storage/Supabase
    loadHighScore: async (userId: string | null) => {
      set(state => {
        state.isLoadingHighScore = true;
        state.highScoreError = null;
      });

      try {
        const highScore = await HighScoreService.getHighScore(userId);
        set(state => {
          state.highScore = highScore;
          state.isLoadingHighScore = false;
        });
      } catch (error) {
        if (__DEV__) {
          console.error('[GameStore] Error loading high score:', error);
        }
        set(state => {
          state.isLoadingHighScore = false;
          state.highScoreError = error instanceof Error ? error.message : 'Failed to load high score';
          // Fallback to local score
          state.highScore = HighScoreService.getLocalHighScore();
        });
      }
    },

    // Sync high score to cloud
    syncHighScore: async (userId: string | null) => {
      if (!userId) {
        return;
      }

      try {
        await HighScoreService.retrySync(userId);
      } catch (error) {
        if (__DEV__) {
          console.warn('[GameStore] Failed to sync high score:', error);
        }
      }
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
export const useBestScore = () => useGameStore(state => state.highScore ?? 0);
export const useIsGameOver = () => useGameStore(state => state.gameState?.isGameOver ?? false);
export const useCurrentPieces = () => useGameStore(state => state.gameState?.currentPieces ?? []);
export const useDragState = () => useGameStore(state => state.dragState);
export const useBoard = () => useGameStore(state => state.gameState?.board!);
export const usePowerUpState = () => useGameStore(state => state.powerUpState);

