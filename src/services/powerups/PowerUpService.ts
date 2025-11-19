/**
 * Power-Up Service - Manages power-up purchases, inventory, and usage
 * Integrates with VirtualCurrencyManager and game logic
 */

import { useMonetizationStore, PowerUpType } from '../../store/monetizationStore';
import { virtualCurrencyManager, GemSpend } from '../currency/VirtualCurrencyManager';
import { analyticsService } from '../analytics/AnalyticsService';
import { POWER_UP_PRICES } from '../iap/ProductCatalog';

export interface PowerUpDefinition {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  gemsPrice: number;
  usdPrice: number;
  color: string;
  cooldown?: number; // milliseconds
}

// Power-up definitions with UI metadata
export const POWER_UPS: Record<PowerUpType, PowerUpDefinition> = {
  [PowerUpType.MAGIC_WAND]: {
    type: PowerUpType.MAGIC_WAND,
    name: 'Magic Wand',
    description: 'Clear a random piece from the board',
    icon: '🪄',
    gemsPrice: 100,
    usdPrice: 0.99,
    color: '#9B59B6',
  },
  [PowerUpType.PIECE_SWAP]: {
    type: PowerUpType.PIECE_SWAP,
    name: 'Piece Swap',
    description: 'Replace current pieces with new ones',
    icon: '🔄',
    gemsPrice: 100,
    usdPrice: 0.99,
    color: '#3498DB',
  },
  [PowerUpType.UNDO_MOVE]: {
    type: PowerUpType.UNDO_MOVE,
    name: 'Undo Move',
    description: 'Undo your last piece placement',
    icon: '↩️',
    gemsPrice: 200,
    usdPrice: 1.99,
    color: '#E67E22',
  },
  [PowerUpType.LINE_BLASTER]: {
    type: PowerUpType.LINE_BLASTER,
    name: 'Line Blaster',
    description: 'Clear any row or column on the board',
    icon: '💥',
    gemsPrice: 200,
    usdPrice: 1.99,
    color: '#E74C3C',
  },
};

class PowerUpService {
  private static instance: PowerUpService | null = null;
  private lastUsedTime: Map<PowerUpType, number> = new Map();

  private constructor() {}

  static getInstance(): PowerUpService {
    if (!PowerUpService.instance) {
      PowerUpService.instance = new PowerUpService();
    }
    return PowerUpService.instance;
  }

  /**
   * Purchase power-up with gems
   */
  async purchaseWithGems(
    type: PowerUpType,
    quantity: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    const powerUp = POWER_UPS[type];
    const totalCost = powerUp.gemsPrice * quantity;

    // Check if user can afford
    if (!virtualCurrencyManager.canAfford(totalCost)) {
      return { success: false, error: 'insufficient_gems' };
    }

    // Spend gems
    const result = await virtualCurrencyManager.spendGems(
      totalCost,
      GemSpend.POWER_UP,
      type,
      {
        power_up_type: type,
        quantity,
        price_per_unit: powerUp.gemsPrice,
      }
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Add power-ups to inventory
    const store = useMonetizationStore.getState();
    store.addPowerUp(type, quantity);

    // Sync to backend
    await store.syncWithBackend();

    // Analytics
    analyticsService.logEvent('power_up_purchased', {
      type,
      quantity,
      gems_spent: totalCost,
      purchase_method: 'gems',
    });

    console.log(`✅ Purchased ${quantity}x ${powerUp.name} for ${totalCost} gems`);

    return { success: true };
  }

  /**
   * Use a power-up (deduct from inventory)
   */
  async usePowerUp(type: PowerUpType): Promise<{ success: boolean; error?: string }> {
    const store = useMonetizationStore.getState();
    const powerUp = POWER_UPS[type];

    // Check if user has power-up
    const quantity = store.powerUps[type];
    if (quantity <= 0) {
      console.log(`No ${powerUp.name} available`);
      return { success: false, error: 'not_owned' };
    }

    // Check cooldown
    if (this.isOnCooldown(type)) {
      const remaining = this.getCooldownRemaining(type);
      console.log(`${powerUp.name} on cooldown: ${remaining}ms remaining`);
      return { success: false, error: 'cooldown' };
    }

    // Deduct from inventory
    const success = store.usePowerUp(type);
    if (!success) {
      return { success: false, error: 'use_failed' };
    }

    // Set cooldown
    this.lastUsedTime.set(type, Date.now());

    // Sync to backend (non-blocking)
    store.syncWithBackend().catch(err => {
      console.error('Failed to sync power-up usage:', err);
    });

    // Analytics
    analyticsService.logEvent('power_up_used', {
      type,
      remaining_quantity: store.powerUps[type],
    });

    console.log(`✅ Used ${powerUp.name}. Remaining: ${store.powerUps[type]}`);

    return { success: true };
  }

  /**
   * Get power-up quantity
   */
  getQuantity(type: PowerUpType): number {
    return useMonetizationStore.getState().powerUps[type];
  }

  /**
   * Check if user has power-up
   */
  hasPowerUp(type: PowerUpType): boolean {
    return this.getQuantity(type) > 0;
  }

  /**
   * Get all power-up quantities
   */
  getAllQuantities(): Record<PowerUpType, number> {
    return useMonetizationStore.getState().powerUps;
  }

  /**
   * Check if power-up is on cooldown
   */
  isOnCooldown(type: PowerUpType): boolean {
    const powerUp = POWER_UPS[type];
    if (!powerUp.cooldown) return false;

    const lastUsed = this.lastUsedTime.get(type);
    if (!lastUsed) return false;

    return Date.now() - lastUsed < powerUp.cooldown;
  }

  /**
   * Get remaining cooldown time in milliseconds
   */
  getCooldownRemaining(type: PowerUpType): number {
    const powerUp = POWER_UPS[type];
    if (!powerUp.cooldown) return 0;

    const lastUsed = this.lastUsedTime.get(type);
    if (!lastUsed) return 0;

    const elapsed = Date.now() - lastUsed;
    return Math.max(0, powerUp.cooldown - elapsed);
  }

  /**
   * Get power-up definition
   */
  getPowerUpDefinition(type: PowerUpType): PowerUpDefinition {
    return POWER_UPS[type];
  }

  /**
   * Get all power-up definitions
   */
  getAllPowerUps(): PowerUpDefinition[] {
    return Object.values(POWER_UPS);
  }

  /**
   * Calculate total value of inventory
   */
  getInventoryValue(): number {
    const quantities = this.getAllQuantities();
    let total = 0;

    for (const [type, quantity] of Object.entries(quantities)) {
      const powerUp = POWER_UPS[type as PowerUpType];
      total += powerUp.gemsPrice * quantity;
    }

    return total;
  }

  /**
   * Award free power-ups (daily rewards, premium benefits)
   */
  async awardFreePowerUps(
    type: PowerUpType,
    quantity: number,
    source: string
  ): Promise<boolean> {
    try {
      const store = useMonetizationStore.getState();
      store.addPowerUp(type, quantity);

      await store.syncWithBackend();

      analyticsService.logEvent('power_up_awarded', {
        type,
        quantity,
        source,
      });

      console.log(`✅ Awarded ${quantity}x ${POWER_UPS[type].name} (${source})`);

      return true;
    } catch (error) {
      console.error('Failed to award power-ups:', error);
      return false;
    }
  }

  /**
   * Reset cooldowns (for testing/admin)
   */
  resetCooldowns(): void {
    this.lastUsedTime.clear();
  }
}

export const powerUpService = PowerUpService.getInstance();
export { PowerUpService };

