/**
 * GamePersistenceService - Manages game state persistence
 * Local-first strategy: MMKV for fast saves, Supabase for backup
 */

import { getSupabase } from '../backend/SupabaseClient';
import { MMKV } from 'react-native-mmkv';
import { GameState } from '../../game/core/GameState';
import { BoardGrid, Piece } from '../../utils/types';

// Create MMKV instance for game state storage
const storage = new MMKV({ id: 'game-state' });

const STORAGE_KEYS = {
  ACTIVE_GAME: 'blocktopia_active_game',
  GAME_STATE: 'blocktopia_game_state',
  LAST_SAVE: 'blocktopia_last_save_timestamp',
};

export interface SerializedGameState {
  board: BoardGrid;
  currentPieces: Piece[];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  canContinue: boolean;
  timestamp: number;
}

export class GamePersistenceService {
  /**
   * Save current game state locally
   */
  static async saveGameState(gameState: GameState): Promise<void> {
    try {
      const serialized = this.serializeGameState(gameState);
      
      // Save to MMKV (fast, synchronous)
      storage.set(STORAGE_KEYS.GAME_STATE, JSON.stringify(serialized));
      storage.set(STORAGE_KEYS.ACTIVE_GAME, true);
      storage.set(STORAGE_KEYS.LAST_SAVE, Date.now());
      
      if (__DEV__) {
        console.log('[GamePersistence] Game state saved locally');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[GamePersistence] Error saving game state:', error);
      }
      throw error;
    }
  }

  /**
   * Load saved game state
   */
  static async loadGameState(): Promise<SerializedGameState | null> {
    try {
      const stateJson = storage.getString(STORAGE_KEYS.GAME_STATE);
      
      if (!stateJson) {
        return null;
      }

      const state = JSON.parse(stateJson) as SerializedGameState;
      
      // Validate state structure
      if (!state.board || !state.currentPieces || typeof state.score !== 'number') {
        if (__DEV__) {
          console.warn('[GamePersistence] Invalid game state structure');
        }
        return null;
      }

      return state;
    } catch (error) {
      if (__DEV__) {
        console.error('[GamePersistence] Error loading game state:', error);
      }
      return null;
    }
  }

  /**
   * Check if there's an active saved game
   */
  static async hasActiveGame(): Promise<boolean> {
    try {
      const hasActive = storage.getBoolean(STORAGE_KEYS.ACTIVE_GAME) ?? false;
      
      if (!hasActive) {
        return false;
      }

      // Verify state exists and is valid
      const state = await this.loadGameState();
      return state !== null && !state.isGameOver;
    } catch (error) {
      if (__DEV__) {
        console.error('[GamePersistence] Error checking active game:', error);
      }
      return false;
    }
  }

  /**
   * Clear saved game (on game completion or new game)
   */
  static async clearSavedGame(): Promise<void> {
    try {
      storage.delete(STORAGE_KEYS.GAME_STATE);
      storage.set(STORAGE_KEYS.ACTIVE_GAME, false);
      storage.delete(STORAGE_KEYS.LAST_SAVE);
      
      if (__DEV__) {
        console.log('[GamePersistence] Saved game cleared');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[GamePersistence] Error clearing saved game:', error);
      }
    }
  }

  /**
   * Sync to cloud (optional, for cross-device)
   */
  static async syncToCloud(userId: string | null, gameState: GameState): Promise<void> {
    if (!userId) {
      return; // No user, skip cloud sync
    }

    try {
      const serialized = this.serializeGameState(gameState);
      const supabase = getSupabase();

      // Deactivate other sessions
      await supabase.rpc('deactivate_other_sessions', { p_user_id: userId });

      // Upsert current session
      const { error } = await supabase
        .from('game_sessions')
        .upsert({
          user_id: userId,
          board_state: serialized.board,
          current_pieces: serialized.currentPieces,
          score: serialized.score,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,is_active',
        });

      if (error) {
        throw error;
      }

      if (__DEV__) {
        console.log('[GamePersistence] Game state synced to cloud');
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[GamePersistence] Failed to sync to cloud:', error);
      }
      // Don't throw - local save is more important
    }
  }

  /**
   * Load from cloud (for cross-device restore)
   */
  static async loadFromCloud(userId: string | null): Promise<SerializedGameState | null> {
    if (!userId) {
      return null;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('game_sessions')
        .select('board_state, current_pieces, score')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        board: data.board_state as BoardGrid,
        currentPieces: data.current_pieces as Piece[],
        score: data.score,
        bestScore: 0, // Will be loaded separately
        isGameOver: false,
        canContinue: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      if (__DEV__) {
        console.error('[GamePersistence] Error loading from cloud:', error);
      }
      return null;
    }
  }

  /**
   * Serialize GameState to JSON-safe format
   */
  private static serializeGameState(gameState: GameState): SerializedGameState {
    return {
      board: gameState.board.getGrid(),
      currentPieces: gameState.currentPieces,
      score: gameState.score,
      bestScore: gameState.bestScore,
      isGameOver: gameState.isGameOver,
      canContinue: gameState.canContinue,
      timestamp: Date.now(),
    };
  }

  /**
   * Deserialize and restore GameState
   */
  static deserializeGameState(data: SerializedGameState): GameState {
    const gameState = new GameState(data.bestScore);
    
    // Restore board
    gameState.board.setGrid(data.board);
    
    // Restore pieces
    gameState.currentPieces = data.currentPieces;
    
    // Restore score and state
    gameState.score = data.score;
    gameState.isGameOver = data.isGameOver;
    gameState.canContinue = data.canContinue;
    
    return gameState;
  }

  /**
   * Auto-save on game state changes (debounced)
   */
  private static debounceTimer: NodeJS.Timeout | null = null;
  private static readonly DEBOUNCE_MS = 2000; // Save 2 seconds after last change

  static startAutoSave(
    getGameState: () => GameState,
    interval: number = this.DEBOUNCE_MS
  ): () => void {
    // Return cleanup function
    return () => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
    };
  }

  /**
   * Trigger auto-save (call this when game state changes)
   */
  static triggerAutoSave(getGameState: () => GameState, userId: string | null = null): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(async () => {
      try {
        const gameState = getGameState();
        
        // Don't save if game is over
        if (gameState.isGameOver) {
          await this.clearSavedGame();
          return;
        }

        // Save locally
        await this.saveGameState(gameState);
        
        // Sync to cloud if user is logged in
        if (userId) {
          await this.syncToCloud(userId, gameState);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[GamePersistence] Auto-save failed:', error);
        }
      }
    }, this.DEBOUNCE_MS);
  }
}

