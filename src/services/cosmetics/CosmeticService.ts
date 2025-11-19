/**
 * Cosmetic Service - Manages cosmetic purchases and ownership
 * Integrates with virtual currency and premium status
 */

import { useMonetizationStore, CosmeticType } from '../../store/monetizationStore';
import { virtualCurrencyManager, GemSpend } from '../currency/VirtualCurrencyManager';
import { analyticsService } from '../analytics/AnalyticsService';
import { getCosmeticById, type Cosmetic } from './CosmeticCatalog';
import { getSupabase } from '../backend/SupabaseClient';

class CosmeticService {
  private static instance: CosmeticService | null = null;

  private constructor() {}

  static getInstance(): CosmeticService {
    if (!CosmeticService.instance) {
      CosmeticService.instance = new CosmeticService();
    }
    return CosmeticService.instance;
  }

  /**
   * Purchase cosmetic with gems
   */
  async purchaseCosmetic(cosmeticId: string): Promise<{ success: boolean; error?: string }> {
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) {
      return { success: false, error: 'cosmetic_not_found' };
    }

    const store = useMonetizationStore.getState();

    // Check if already owned
    if (store.ownedCosmetics.includes(cosmeticId)) {
      return { success: false, error: 'already_owned' };
    }

    // Check premium requirement
    if (cosmetic.isPremium && !store.isPremium) {
      return { success: false, error: 'requires_premium' };
    }

    // Check if can afford
    if (!virtualCurrencyManager.canAfford(cosmetic.price)) {
      return { success: false, error: 'insufficient_gems' };
    }

    // Spend gems (unless default/free)
    if (cosmetic.price > 0) {
      const result = await virtualCurrencyManager.spendGems(
        cosmetic.price,
        GemSpend.COSMETIC,
        cosmeticId,
        {
          cosmetic_type: cosmetic.type,
          cosmetic_name: cosmetic.name,
          rarity: cosmetic.rarity,
        }
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    // Add to owned cosmetics
    store.unlockCosmetic(cosmeticId);

    // Sync to backend
    await this.syncCosmeticOwnership(cosmeticId);
    await store.syncWithBackend();

    // Analytics
    analyticsService.logEvent('cosmetic_purchased', {
      cosmetic_id: cosmeticId,
      cosmetic_type: cosmetic.type,
      cosmetic_name: cosmetic.name,
      price: cosmetic.price,
      rarity: cosmetic.rarity,
      is_premium: cosmetic.isPremium,
    });

    console.log(`✅ Purchased cosmetic: ${cosmetic.name} for ${cosmetic.price} gems`);

    return { success: true };
  }

  /**
   * Equip/activate a cosmetic
   */
  async equipCosmetic(cosmeticId: string): Promise<{ success: boolean; error?: string }> {
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) {
      return { success: false, error: 'cosmetic_not_found' };
    }

    const store = useMonetizationStore.getState();

    // Check if owned
    if (!store.ownedCosmetics.includes(cosmeticId)) {
      return { success: false, error: 'not_owned' };
    }

    // Set as active
    store.setActiveCosmetic(cosmetic.type, cosmeticId);

    // Sync to backend
    await store.syncWithBackend();

    // Analytics
    analyticsService.logEvent('cosmetic_equipped', {
      cosmetic_id: cosmeticId,
      cosmetic_type: cosmetic.type,
      cosmetic_name: cosmetic.name,
    });

    console.log(`✅ Equipped cosmetic: ${cosmetic.name}`);

    return { success: true };
  }

  /**
   * Check if user owns a cosmetic
   */
  isOwned(cosmeticId: string): boolean {
    const store = useMonetizationStore.getState();
    return store.ownedCosmetics.includes(cosmeticId);
  }

  /**
   * Check if cosmetic is currently active
   */
  isActive(cosmeticId: string): boolean {
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) return false;

    const store = useMonetizationStore.getState();
    return store.activeCosmetics[cosmetic.type] === cosmeticId;
  }

  /**
   * Get all owned cosmetics
   */
  getOwnedCosmetics(): string[] {
    return useMonetizationStore.getState().ownedCosmetics;
  }

  /**
   * Get active cosmetics
   */
  getActiveCosmetics(): Record<CosmeticType, string | null> {
    return useMonetizationStore.getState().activeCosmetics;
  }

  /**
   * Can user purchase this cosmetic?
   */
  canPurchase(cosmeticId: string): {
    canPurchase: boolean;
    reason?: string;
  } {
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) {
      return { canPurchase: false, reason: 'Cosmetic not found' };
    }

    const store = useMonetizationStore.getState();

    // Already owned
    if (store.ownedCosmetics.includes(cosmeticId)) {
      return { canPurchase: false, reason: 'Already owned' };
    }

    // Premium requirement
    if (cosmetic.isPremium && !store.isPremium) {
      return { canPurchase: false, reason: 'Requires Premium' };
    }

    // Gems requirement
    if (!virtualCurrencyManager.canAfford(cosmetic.price)) {
      return { canPurchase: false, reason: `Need ${cosmetic.price} gems` };
    }

    return { canPurchase: true };
  }

  /**
   * Sync cosmetic ownership to backend
   */
  private async syncCosmeticOwnership(cosmeticId: string): Promise<void> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;
      if (!userId) return;

      const supabase = getSupabase();

      await supabase
        .from('cosmetics_owned')
        .insert({
          user_id: userId,
          cosmetic_id: cosmeticId,
          purchased_at: new Date().toISOString(),
        });

      console.log(`✅ Synced cosmetic ownership: ${cosmeticId}`);
    } catch (error) {
      console.error('Failed to sync cosmetic ownership:', error);
      // Non-fatal error
    }
  }

  /**
   * Award free cosmetic (rewards, promotions)
   */
  async awardCosmetic(cosmeticId: string, source: string): Promise<boolean> {
    try {
      const cosmetic = getCosmeticById(cosmeticId);
      if (!cosmetic) return false;

      const store = useMonetizationStore.getState();

      // Already owned
      if (store.ownedCosmetics.includes(cosmeticId)) {
        return false;
      }

      // Add to owned
      store.unlockCosmetic(cosmeticId);

      // Sync to backend
      await this.syncCosmeticOwnership(cosmeticId);
      await store.syncWithBackend();

      // Analytics
      analyticsService.logEvent('cosmetic_awarded', {
        cosmetic_id: cosmeticId,
        cosmetic_type: cosmetic.type,
        source,
      });

      console.log(`✅ Awarded cosmetic: ${cosmetic.name} (${source})`);

      return true;
    } catch (error) {
      console.error('Failed to award cosmetic:', error);
      return false;
    }
  }

  /**
   * Get total value of owned cosmetics
   */
  getInventoryValue(): number {
    const store = useMonetizationStore.getState();
    let total = 0;

    for (const cosmeticId of store.ownedCosmetics) {
      const cosmetic = getCosmeticById(cosmeticId);
      if (cosmetic) {
        total += cosmetic.price;
      }
    }

    return total;
  }
}

export const cosmeticService = CosmeticService.getInstance();
export { CosmeticService };

