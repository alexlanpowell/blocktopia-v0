/**
 * HighScoreService - Manages persistent high scores
 * Syncs to Supabase for cross-device persistence
 */

import { getSupabase, supabaseManager } from '../backend/SupabaseClient';
import { MMKV } from 'react-native-mmkv';

// Lazy-initialized MMKV instance for high scores storage
let storageInstance: MMKV | null = null;

/**
 * Get or create MMKV storage instance
 * Returns null if MMKV is not available
 */
function getStorage(): MMKV | null {
  if (storageInstance) {
    return storageInstance;
  }

  try {
    storageInstance = new MMKV({ id: 'highscores' });
    return storageInstance;
  } catch (error) {
    if (__DEV__) {
      console.warn('[HighScoreService] MMKV not available:', error);
    }
    return null;
  }
}

const HIGH_SCORE_KEY = 'local_high_score';
const HIGH_SCORE_SYNC_KEY = 'high_score_synced';

interface HighScoreData {
  highScore: number;
  achievedAt: string;
  piecesPlaced?: number;
  linesCleared?: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  highScore: number;
  achievedAt: string;
  rank: number;
}

export class HighScoreService {
  /**
   * Get user's current high score (from local cache or Supabase)
   */
  static async getHighScore(userId: string | null): Promise<number> {
    try {
      const storage = getStorage();
      
      // If no user, return local high score only
      if (!userId) {
        return storage?.getNumber(HIGH_SCORE_KEY) || 0;
      }

      // Try to fetch from Supabase
      const supabase = getSupabase();
      const { data, error } = await supabaseManager
        .from('user_high_scores')
        .select('high_score')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - return local score
          return storage?.getNumber(HIGH_SCORE_KEY) || 0;
        }
        if (__DEV__) {
          console.warn('[HighScoreService] Error fetching high score:', error);
        }
        // Fallback to local storage
        return storage?.getNumber(HIGH_SCORE_KEY) || 0;
      }

      const remoteScore = data?.high_score || 0;
      const localScore = storage?.getNumber(HIGH_SCORE_KEY) || 0;

      // Use the higher of the two
      const bestScore = Math.max(remoteScore, localScore);

      // Update local cache
      if (storage) {
        storage.set(HIGH_SCORE_KEY, bestScore);
      }

      return bestScore;
    } catch (error) {
      if (__DEV__) {
        console.error('[HighScoreService] Error in getHighScore:', error);
      }
      // Fallback to local storage
      const storage = getStorage();
      return storage?.getNumber(HIGH_SCORE_KEY) || 0;
    }
  }

  /**
   * Update high score if new score is higher
   * Only updates if score > current high score
   */
  static async updateHighScore(
    userId: string | null,
    score: number,
    stats?: { piecesPlaced?: number; linesCleared?: number }
  ): Promise<boolean> {
    try {
      const storage = getStorage();
      const currentHigh = storage?.getNumber(HIGH_SCORE_KEY) || 0;

      // Only update if new score is higher
      if (score <= currentHigh) {
        return false;
      }

      // Update local storage immediately (optimistic update)
      if (storage) {
        storage.set(HIGH_SCORE_KEY, score);
      }

      // If no user, only update local
      if (!userId) {
        return true;
      }

      // Sync to Supabase (fire and forget - don't block)
      this.syncHighScoreToCloud(userId, score, stats).catch((error) => {
        if (__DEV__) {
          console.warn('[HighScoreService] Failed to sync high score:', error);
        }
        // Mark as unsynced for retry later
        if (storage) {
          storage.set(HIGH_SCORE_SYNC_KEY, false);
        }
      });

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('[HighScoreService] Error updating high score:', error);
      }
      return false;
    }
  }

  /**
   * Sync high score to Supabase
   */
  private static async syncHighScoreToCloud(
    userId: string,
    score: number,
    stats?: { piecesPlaced?: number; linesCleared?: number }
  ): Promise<void> {
    try {
      // Use upsert function for atomic update
      const supabase = getSupabase();
      const { error } = await supabase.rpc('upsert_high_score', {
        p_user_id: userId,
        p_score: score,
        p_pieces_placed: stats?.piecesPlaced || 0,
        p_lines_cleared: stats?.linesCleared || 0,
      });

      if (error) {
        throw error;
      }

      // Mark as synced
      const storage = getStorage();
      if (storage) {
        storage.set(HIGH_SCORE_SYNC_KEY, true);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[HighScoreService] Error syncing to cloud:', error);
      }
      throw error;
    }
  }

  /**
   * Get global leaderboard (top N players)
   */
  static async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabaseManager
        .from('user_high_scores')
        .select(`
          user_id,
          high_score,
          achieved_at,
          profiles:user_id (
            username
          )
        `)
        .order('high_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map((entry: any, index: number) => ({
        userId: entry.user_id,
        username: (entry.profiles as any)?.username || null,
        highScore: entry.high_score,
        achievedAt: entry.achieved_at,
        rank: index + 1,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error('[HighScoreService] Error fetching leaderboard:', error);
      }
      return [];
    }
  }

  /**
   * Retry syncing unsynced high scores (call on app start or when online)
   */
  static async retrySync(userId: string | null): Promise<void> {
    if (!userId) {
      return;
    }

    const storage = getStorage();
    if (!storage) {
      return;
    }

    const isSynced = storage.getBoolean(HIGH_SCORE_SYNC_KEY) ?? true;
    if (isSynced) {
      return;
    }

    const localScore = storage.getNumber(HIGH_SCORE_KEY) || 0;
    if (localScore > 0) {
      try {
        await this.syncHighScoreToCloud(userId, localScore);
      } catch (error) {
        if (__DEV__) {
          console.warn('[HighScoreService] Retry sync failed:', error);
        }
      }
    }
  }

  /**
   * Get local high score (for offline use)
   */
  static getLocalHighScore(): number {
    const storage = getStorage();
    return storage?.getNumber(HIGH_SCORE_KEY) || 0;
  }
}

