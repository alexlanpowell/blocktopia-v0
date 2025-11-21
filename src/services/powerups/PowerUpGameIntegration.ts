/**
 * Power-Up Game Integration - Applies power-up effects to game state
 * Integrates with GameState and Board classes
 */

import { GameState } from '../../game/core/GameState';
import { PowerUpType } from '../../store/monetizationStore';
import { powerUpService, POWER_UPS } from './PowerUpService';
import { generateRandomPiece } from '../../game/core/Piece';
import { analyticsService } from '../analytics/AnalyticsService';
import * as Haptics from 'expo-haptics';

export interface PowerUpResult {
  success: boolean;
  message?: string;
  error?: string;
}

class PowerUpGameIntegration {
  private static instance: PowerUpGameIntegration | null = null;
  private gameStateHistory: GameState[] = []; // For undo functionality
  private maxHistorySize: number = 5;

  private constructor() {}

  static getInstance(): PowerUpGameIntegration {
    if (!PowerUpGameIntegration.instance) {
      PowerUpGameIntegration.instance = new PowerUpGameIntegration();
    }
    return PowerUpGameIntegration.instance;
  }

  /**
   * Save game state for undo (called after each successful move)
   */
  saveGameState(gameState: GameState): void {
    // Clone the game state
    const stateCopy = JSON.parse(JSON.stringify(gameState.toJSON()));
    
    this.gameStateHistory.push(stateCopy);

    // Limit history size
    if (this.gameStateHistory.length > this.maxHistorySize) {
      this.gameStateHistory.shift();
    }
  }

  /**
   * Clear game state history
   */
  clearHistory(): void {
    this.gameStateHistory = [];
  }

  /**
   * Apply Magic Wand - Clear random filled cells
   */
  async applyMagicWand(gameState: GameState): Promise<PowerUpResult> {
    try {
      // Check if user has power-up
      if (!powerUpService.hasPowerUp(PowerUpType.MAGIC_WAND)) {
        return { success: false, error: 'Power-up not available' };
      }

      // Use power-up
      const useResult = await powerUpService.usePowerUp(PowerUpType.MAGIC_WAND);
      if (!useResult.success) {
        return { success: false, error: useResult.error };
      }

      // Find all filled cells
      const filledCells: Array<{ x: number; y: number }> = [];
      const boardSize = gameState.board.getSize();

      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          if (gameState.board.getCellValue(x, y) !== null) {
            filledCells.push({ x, y });
          }
        }
      }

      if (filledCells.length === 0) {
        // Refund if board is empty
        return { success: false, error: 'Board is empty' };
      }

      // Clear 3-5 random cells
      const cellsToClear = Math.min(
        3 + Math.floor(Math.random() * 3),
        filledCells.length
      );

      for (let i = 0; i < cellsToClear; i++) {
        const randomIndex = Math.floor(Math.random() * filledCells.length);
        const cell = filledCells.splice(randomIndex, 1)[0];
        gameState.board.setCellValue(cell.x, cell.y, null);
      }

      // Check if game is still over
      if (gameState.isGameOver) {
        gameState.isGameOver = false;
        // Re-check game over status
        const canPlace = gameState.board.canPlaceAnyPiece(gameState.currentPieces);
        if (!canPlace) {
          gameState.isGameOver = true;
        }
      }

      // Haptic feedback and sound
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const AudioManager = (await import('../audio/AudioManager')).default;
      const { SoundEffect } = await import('../audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.POWER_UP_USE);

      analyticsService.logEvent('power_up_applied', {
        type: PowerUpType.MAGIC_WAND,
        cells_cleared: cellsToClear,
      });

      return {
        success: true,
        message: `Cleared ${cellsToClear} cells with Magic Wand!`,
      };
    } catch (error) {
      console.error('Magic Wand error:', error);
      return { success: false, error: 'Failed to apply Magic Wand' };
    }
  }

  /**
   * Apply Piece Swap - Replace current pieces with new ones
   */
  async applyPieceSwap(gameState: GameState): Promise<PowerUpResult> {
    try {
      // Check if user has power-up
      if (!powerUpService.hasPowerUp(PowerUpType.PIECE_SWAP)) {
        return { success: false, error: 'Power-up not available' };
      }

      // Use power-up
      const useResult = await powerUpService.usePowerUp(PowerUpType.PIECE_SWAP);
      if (!useResult.success) {
        return { success: false, error: useResult.error };
      }

      // Replace all current pieces with new random ones
      const newPieces = [];
      for (let i = 0; i < gameState.currentPieces.length; i++) {
        newPieces.push(generateRandomPiece());
      }

      gameState.currentPieces = newPieces;

      // Check if game is still over
      if (gameState.isGameOver) {
        const canPlace = gameState.board.canPlaceAnyPiece(gameState.currentPieces);
        if (canPlace) {
          gameState.isGameOver = false;
        }
      }

      // Haptic feedback and sound
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const AudioManager = (await import('../audio/AudioManager')).default;
      const { SoundEffect } = await import('../audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.POWER_UP_USE);

      analyticsService.logEvent('power_up_applied', {
        type: PowerUpType.PIECE_SWAP,
      });

      return {
        success: true,
        message: 'Pieces swapped!',
      };
    } catch (error) {
      console.error('Piece Swap error:', error);
      return { success: false, error: 'Failed to apply Piece Swap' };
    }
  }

  /**
   * Apply Undo Move - Restore previous game state
   */
  async applyUndoMove(gameState: GameState): Promise<PowerUpResult> {
    try {
      // Check if user has power-up
      if (!powerUpService.hasPowerUp(PowerUpType.UNDO_MOVE)) {
        return { success: false, error: 'Power-up not available' };
      }

      // Check if there's history to undo
      if (this.gameStateHistory.length === 0) {
        return { success: false, error: 'Nothing to undo' };
      }

      // Use power-up
      const useResult = await powerUpService.usePowerUp(PowerUpType.UNDO_MOVE);
      if (!useResult.success) {
        return { success: false, error: useResult.error };
      }

      // Restore previous state
      const previousState = this.gameStateHistory.pop();
      if (!previousState) {
        return { success: false, error: 'Failed to restore state' };
      }

      // Apply previous state to current game
      gameState.score = previousState.score;
      gameState.isGameOver = previousState.isGameOver;
      gameState.canContinue = previousState.canContinue;
      gameState.currentPieces = previousState.currentPieces;

      // Restore board state
      const boardGrid = previousState.board as unknown as (number | null)[][];
      for (let y = 0; y < boardGrid.length; y++) {
        for (let x = 0; x < boardGrid[y].length; x++) {
          gameState.board.setCellValue(x, y, boardGrid[y][x]);
        }
      }

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const AudioManager = (await import('../audio/AudioManager')).default;
      const { SoundEffect } = await import('../audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.POWER_UP_USE);

      analyticsService.logEvent('power_up_applied', {
        type: PowerUpType.UNDO_MOVE,
      });

      return {
        success: true,
        message: 'Move undone!',
      };
    } catch (error) {
      console.error('Undo Move error:', error);
      return { success: false, error: 'Failed to undo move' };
    }
  }

  /**
   * Apply Line Blaster - Clear specified row or column
   */
  async applyLineBlaster(
    gameState: GameState,
    isRow: boolean,
    index: number
  ): Promise<PowerUpResult> {
    try {
      // Check if user has power-up
      if (!powerUpService.hasPowerUp(PowerUpType.LINE_BLASTER)) {
        return { success: false, error: 'Power-up not available' };
      }

      // Validate index
      const boardSize = gameState.board.getSize();
      if (index < 0 || index >= boardSize) {
        return { success: false, error: 'Invalid line index' };
      }

      // Use power-up
      const useResult = await powerUpService.usePowerUp(PowerUpType.LINE_BLASTER);
      if (!useResult.success) {
        return { success: false, error: useResult.error };
      }

      // Clear the specified line
      if (isRow) {
        gameState.board.clearRow(index);
      } else {
        gameState.board.clearColumn(index);
      }

      // Don't award points for power-up clears

      // Check if game is still over
      if (gameState.isGameOver) {
        const canPlace = gameState.board.canPlaceAnyPiece(gameState.currentPieces);
        if (canPlace) {
          gameState.isGameOver = false;
        }
      }

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const AudioManager = (await import('../audio/AudioManager')).default;
      const { SoundEffect } = await import('../audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.POWER_UP_USE);

      analyticsService.logEvent('power_up_applied', {
        type: PowerUpType.LINE_BLASTER,
        is_row: isRow,
        index,
      });

      return {
        success: true,
        message: `${isRow ? 'Row' : 'Column'} ${index + 1} cleared!`,
      };
    } catch (error) {
      console.error('Line Blaster error:', error);
      return { success: false, error: 'Failed to apply Line Blaster' };
    }
  }

  /**
   * Check if power-up can be used in current game state
   */
  canUsePowerUp(type: PowerUpType, gameState: GameState): {
    canUse: boolean;
    reason?: string;
  } {
    // Check ownership
    if (!powerUpService.hasPowerUp(type)) {
      return { canUse: false, reason: 'You don\'t have this power-up' };
    }

    // Check cooldown
    if (powerUpService.isOnCooldown(type)) {
      const remaining = Math.ceil(powerUpService.getCooldownRemaining(type) / 1000);
      return { canUse: false, reason: `Cooldown: ${remaining}s` };
    }

    // Type-specific checks
    switch (type) {
      case PowerUpType.MAGIC_WAND:
        // Check if board has any filled cells
        const boardSize = gameState.board.getSize();
        let hasFilledCells = false;
        for (let y = 0; y < boardSize && !hasFilledCells; y++) {
          for (let x = 0; x < boardSize; x++) {
            if (gameState.board.getCellValue(x, y) !== null) {
              hasFilledCells = true;
              break;
            }
          }
        }
        if (!hasFilledCells) {
          return { canUse: false, reason: 'Board is empty' };
        }
        break;

      case PowerUpType.UNDO_MOVE:
        if (this.gameStateHistory.length === 0) {
          return { canUse: false, reason: 'Nothing to undo' };
        }
        break;

      case PowerUpType.LINE_BLASTER:
        // Always usable if owned (user selects line)
        break;

      case PowerUpType.PIECE_SWAP:
        // Always usable if owned
        break;
    }

    return { canUse: true };
  }

  /**
   * Get usage hint for power-up
   */
  getUsageHint(type: PowerUpType): string {
    const powerUp = POWER_UPS[type];
    
    switch (type) {
      case PowerUpType.MAGIC_WAND:
        return 'Tap to clear 3-5 random blocks from the board';
      case PowerUpType.PIECE_SWAP:
        return 'Tap to replace current pieces with new ones';
      case PowerUpType.UNDO_MOVE:
        return 'Tap to undo your last move';
      case PowerUpType.LINE_BLASTER:
        return 'Tap, then select a row or column to clear';
      default:
        return powerUp.description;
    }
  }
}

export const powerUpGameIntegration = PowerUpGameIntegration.getInstance();
export { PowerUpGameIntegration };

