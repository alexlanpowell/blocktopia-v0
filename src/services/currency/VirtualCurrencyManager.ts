/**
 * Virtual Currency Manager - Gems System
 * Handles adding, spending, and syncing gems with backend
 */

import { getSupabase, supabaseManager } from '../backend/SupabaseClient';
import { useMonetizationStore } from '../../store/monetizationStore';
import { analyticsService } from '../analytics/AnalyticsService';

export enum GemSource {
  PURCHASE = 'purchase',
  IAP = 'iap',
  AD_REWARD = 'ad_reward',
  DAILY_REWARD = 'daily_reward',
  PREMIUM_DAILY = 'premium_daily',
  ACHIEVEMENT = 'achievement',
  REFERRAL = 'referral',
  PROMOTION = 'promotion',
  ADMIN = 'admin',
}

export enum GemSpend {
  POWER_UP = 'power_up',
  COSMETIC = 'cosmetic',
  CONTINUE = 'continue',
  BOOST = 'boost',
  OTHER = 'other',
}

interface TransactionResult {
  success: boolean;
  newBalance: number;
  error?: string;
}

class VirtualCurrencyManager {
  private static instance: VirtualCurrencyManager | null = null;

  private constructor() {}

  static getInstance(): VirtualCurrencyManager {
    if (!VirtualCurrencyManager.instance) {
      VirtualCurrencyManager.instance = new VirtualCurrencyManager();
    }
    return VirtualCurrencyManager.instance;
  }

  /**
   * Add gems to user's account
   */
  async addGems(
    amount: number,
    source: GemSource,
    metadata?: Record<string, any>
  ): Promise<TransactionResult> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;

      if (!userId) {
        console.error('Cannot add gems: User not authenticated');
        return { success: false, newBalance: 0, error: 'not_authenticated' };
      }

      if (amount <= 0) {
        console.error('Cannot add gems: Invalid amount');
        return { success: false, newBalance: store.gems, error: 'invalid_amount' };
      }

      // Update local state
      store.addGems(amount);
      const newBalance = store.gems;

      // Sync to backend
      const supabase = getSupabase();
      
      // Update user profile
      const { error: updateError } = await supabaseManager
        .from('profiles')
        .update({
          gems: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating gems in profile:', updateError);
        // Rollback local state
        store.addGems(-amount);
        return { success: false, newBalance: store.gems, error: 'database_error' };
      }

      // Log transaction
      await this.logTransaction(userId, amount, source, metadata);

      // Analytics
      analyticsService.logEvent('gems_earned', {
        amount,
        source,
        new_balance: newBalance,
        ...metadata,
      });

      console.log(`✅ Added ${amount} gems (${source}). New balance: ${newBalance}`);

      return { success: true, newBalance };
    } catch (error) {
      console.error('Error adding gems:', error);
      return { success: false, newBalance: 0, error: 'unknown_error' };
    }
  }

  /**
   * Spend gems from user's account
   */
  async spendGems(
    amount: number,
    reason: GemSpend,
    itemId?: string,
    metadata?: Record<string, any>
  ): Promise<TransactionResult> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;

      if (!userId) {
        console.error('Cannot spend gems: User not authenticated');
        return { success: false, newBalance: 0, error: 'not_authenticated' };
      }

      if (amount <= 0) {
        console.error('Cannot spend gems: Invalid amount');
        return { success: false, newBalance: store.gems, error: 'invalid_amount' };
      }

      // Check if user has enough gems
      if (store.gems < amount) {
        console.log(`Insufficient gems: has ${store.gems}, needs ${amount}`);
        analyticsService.logEvent('gems_insufficient', {
          amount_needed: amount,
          current_balance: store.gems,
          reason,
          item_id: itemId,
        });
        return { success: false, newBalance: store.gems, error: 'insufficient_gems' };
      }

      // Spend gems locally
      const success = store.spendGems(amount);
      
      if (!success) {
        return { success: false, newBalance: store.gems, error: 'spend_failed' };
      }

      const newBalance = store.gems;

      // Sync to backend
      const supabase = getSupabase();
      
      const { error: updateError } = await supabaseManager
        .from('profiles')
        .update({
          gems: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating gems in profile:', updateError);
        // Rollback local state
        store.addGems(amount);
        return { success: false, newBalance: store.gems, error: 'database_error' };
      }

      // Log transaction
      await this.logTransaction(userId, -amount, reason as unknown as GemSource, {
        item_id: itemId,
        ...metadata,
      });

      // Analytics
      analyticsService.logEvent('gems_spent', {
        amount,
        reason,
        item_id: itemId,
        new_balance: newBalance,
        ...metadata,
      });

      console.log(`✅ Spent ${amount} gems (${reason}). New balance: ${newBalance}`);

      return { success: true, newBalance };
    } catch (error) {
      console.error('Error spending gems:', error);
      // Attempt rollback
      useMonetizationStore.getState().addGems(amount);
      return { success: false, newBalance: 0, error: 'unknown_error' };
    }
  }

  /**
   * Set gems to specific amount (admin function)
   */
  async setGems(amount: number, reason: string = 'admin_set'): Promise<TransactionResult> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;

      if (!userId) {
        return { success: false, newBalance: 0, error: 'not_authenticated' };
      }

      if (amount < 0) {
        return { success: false, newBalance: store.gems, error: 'invalid_amount' };
      }

      // Update local state
      store.setGems(amount);

      // Sync to backend
      const supabase = getSupabase();
      
      const { error: updateError } = await supabaseManager
        .from('profiles')
        .update({
          gems: amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error setting gems:', updateError);
        return { success: false, newBalance: store.gems, error: 'database_error' };
      }

      console.log(`✅ Set gems to ${amount} (${reason})`);

      return { success: true, newBalance: amount };
    } catch (error) {
      console.error('Error setting gems:', error);
      return { success: false, newBalance: 0, error: 'unknown_error' };
    }
  }

  /**
   * Get current gem balance
   */
  getBalance(): number {
    return useMonetizationStore.getState().gems;
  }

  /**
   * Check if user can afford an amount
   */
  canAfford(amount: number): boolean {
    return this.getBalance() >= amount;
  }

  /**
   * Log gem transaction to database
   */
  private async logTransaction(
    userId: string,
    amount: number,
    source: GemSource | string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = getSupabase();

      await supabaseManager.from('transactions').insert({
        user_id: userId,
        transaction_type: amount > 0 ? 'gems_earned' : 'gems_spent',
        gems_change: amount,
        metadata: {
          source,
          ...metadata,
        },
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging transaction:', error);
      // Don't throw - transaction logging is non-critical
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 50): Promise<any[]> {
    try {
      const userId = useMonetizationStore.getState().user.userId;
      if (!userId) return [];

      const supabase = getSupabase();

      const { data, error } = await supabaseManager
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Calculate lifetime gems earned
   */
  async getLifetimeGemsEarned(): Promise<number> {
    try {
      const userId = useMonetizationStore.getState().user.userId;
      if (!userId) return 0;

      const supabase = getSupabase();

      const { data, error } = await supabaseManager
        .from('transactions')
        .select('gems_change')
        .eq('user_id', userId)
        .gt('gems_change', 0);

      if (error || !data) return 0;

      return data.reduce((sum, t) => sum + (t.gems_change || 0), 0);
    } catch (error) {
      console.error('Error calculating lifetime gems:', error);
      return 0;
    }
  }
}

export const virtualCurrencyManager = VirtualCurrencyManager.getInstance();
export { VirtualCurrencyManager };

