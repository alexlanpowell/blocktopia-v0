/**
 * Premium Service - Manages premium subscription features and benefits
 * Integrates with RevenueCat for subscription management
 */

import { useMonetizationStore } from '../../store/monetizationStore';
import { revenueCatService } from '../iap/RevenueCatService';
import { analyticsService } from '../analytics/AnalyticsService';
import { powerUpService } from '../powerups/PowerUpService';
import { PowerUpType } from '../../store/monetizationStore';
import { virtualCurrencyManager, GemSource } from '../currency/VirtualCurrencyManager';

export enum PremiumBenefit {
  AD_FREE = 'ad_free',
  DAILY_GEMS = 'daily_gems',
  DAILY_POWER_UPS = 'daily_power_ups',
  EXCLUSIVE_THEMES = 'exclusive_themes',
  CLOUD_SAVE = 'cloud_save',
  PRIORITY_SUPPORT = 'priority_support',
  EARLY_ACCESS = 'early_access',
  BONUS_MULTIPLIER = 'bonus_multiplier',
}

export interface PremiumStatus {
  isActive: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  plan: 'monthly' | 'yearly' | null;
  trialActive: boolean;
  trialEndDate: Date | null;
}

export interface DailyRewardStatus {
  canClaimGems: boolean;
  canClaimPowerUps: boolean;
  lastClaimedGems: Date | null;
  lastClaimedPowerUps: Date | null;
  streak: number;
}

class PremiumService {
  private static instance: PremiumService | null = null;
  private dailyRewardCheckInterval: NodeJS.Timeout | null = null;

  // Daily reward amounts (for premium users)
  private readonly DAILY_GEMS = 50;
  private readonly DAILY_POWER_UPS = {
    [PowerUpType.MAGIC_WAND]: 1,
    [PowerUpType.PIECE_SWAP]: 1,
    [PowerUpType.UNDO_MOVE]: 1,
    [PowerUpType.LINE_BLASTER]: 1,
  };

  private constructor() {}

  static getInstance(): PremiumService {
    if (!PremiumService.instance) {
      PremiumService.instance = new PremiumService();
    }
    return PremiumService.instance;
  }

  /**
   * Initialize premium service and start daily reward checks
   */
  async initialize(): Promise<void> {
    try {
      // Check premium status on init
      await this.checkPremiumStatus();

      // Set up daily reward check (every hour)
      this.dailyRewardCheckInterval = setInterval(() => {
        this.checkDailyRewards().catch(console.error);
      }, 60 * 60 * 1000); // Every hour

      // Immediate check
      await this.checkDailyRewards();

      // Logging handled by app initialization
    } catch (error) {
      console.error('PremiumService initialization error:', error);
    }
  }

  /**
   * Clean up service
   */
  cleanup(): void {
    if (this.dailyRewardCheckInterval) {
      clearInterval(this.dailyRewardCheckInterval);
      this.dailyRewardCheckInterval = null;
    }
  }

  /**
   * Check premium status from RevenueCat
   */
  async checkPremiumStatus(): Promise<PremiumStatus> {
    try {
      if (!revenueCatService.isInitialized()) {
        return this.getDefaultStatus();
      }

      const hasPremium = await revenueCatService.hasPremium();
      const customerInfo = await revenueCatService.getCustomerInfo();

      if (!customerInfo || !hasPremium) {
        return this.getDefaultStatus();
      }

      // Get premium entitlement details
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      
      if (!premiumEntitlement) {
        return this.getDefaultStatus();
      }

      const expirationDate = premiumEntitlement.expirationDate 
        ? new Date(premiumEntitlement.expirationDate) 
        : null;
      
      const willRenew = premiumEntitlement.willRenew;
      const isActive = premiumEntitlement.isActive;

      // Determine plan type from product identifier
      const productId = premiumEntitlement.productIdentifier;
      const plan = productId?.includes('yearly') ? 'yearly' : 'monthly';

      // Check trial status
      const trialActive = premiumEntitlement.periodType === 'trial';
      const trialEndDate = trialActive && expirationDate ? expirationDate : null;

      const status: PremiumStatus = {
        isActive,
        expirationDate,
        willRenew,
        plan,
        trialActive,
        trialEndDate,
      };

      // Update store
      const store = useMonetizationStore.getState();
      store.setPremium(isActive);

      // Analytics
      analyticsService.logEvent('premium_status_checked', {
        is_active: isActive,
        plan,
        trial_active: trialActive,
      });

      return status;
    } catch (error) {
      console.error('Failed to check premium status:', error);
      return this.getDefaultStatus();
    }
  }

  /**
   * Get default (non-premium) status
   */
  private getDefaultStatus(): PremiumStatus {
    return {
      isActive: false,
      expirationDate: null,
      willRenew: false,
      plan: null,
      trialActive: false,
      trialEndDate: null,
    };
  }

  /**
   * Check if user has a specific premium benefit
   */
  async hasBenefit(benefit: PremiumBenefit): Promise<boolean> {
    const status = await this.checkPremiumStatus();
    
    if (!status.isActive) {
      return false;
    }

    // All benefits available to active premium users
    return true;
  }

  /**
   * Get all active benefits
   */
  async getActiveBenefits(): Promise<PremiumBenefit[]> {
    const status = await this.checkPremiumStatus();
    
    if (!status.isActive) {
      return [];
    }

    // All benefits for premium users
    return Object.values(PremiumBenefit);
  }

  /**
   * Check daily reward status
   */
  async getDailyRewardStatus(): Promise<DailyRewardStatus> {
    const store = useMonetizationStore.getState();
    const { dailyReward } = store;

    const now = new Date();
    const lastClaimedGems = dailyReward.lastClaimedGems 
      ? new Date(dailyReward.lastClaimedGems) 
      : null;
    const lastClaimedPowerUps = dailyReward.lastClaimedPowerUps 
      ? new Date(dailyReward.lastClaimedPowerUps) 
      : null;

    // Can claim if last claim was on a different day
    const canClaimGems = !lastClaimedGems || !this.isSameDay(lastClaimedGems, now);
    const canClaimPowerUps = !lastClaimedPowerUps || !this.isSameDay(lastClaimedPowerUps, now);

    return {
      canClaimGems,
      canClaimPowerUps,
      lastClaimedGems,
      lastClaimedPowerUps,
      streak: dailyReward.streak,
    };
  }

  /**
   * Claim daily gems reward (premium only)
   */
  async claimDailyGems(): Promise<{ success: boolean; gems?: number; error?: string }> {
    try {
      const isPremium = useMonetizationStore.getState().isPremium;
      if (!isPremium) {
        return { success: false, error: 'not_premium' };
      }

      const rewardStatus = await this.getDailyRewardStatus();
      if (!rewardStatus.canClaimGems) {
        return { success: false, error: 'already_claimed' };
      }

      // Award gems
      const result = await virtualCurrencyManager.addGems(
        this.DAILY_GEMS,
        GemSource.PREMIUM_DAILY,
        { type: 'daily_reward' }
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Update last claimed date and streak
      const store = useMonetizationStore.getState();
      const lastClaimed = store.dailyReward.lastClaimedGems 
        ? new Date(store.dailyReward.lastClaimedGems)
        : null;
      
      const isConsecutiveDay = lastClaimed && this.isConsecutiveDay(lastClaimed, new Date());
      const newStreak = isConsecutiveDay ? store.dailyReward.streak + 1 : 1;

      store.setDailyRewardClaimed('gems', newStreak);
      await store.syncWithBackend();

      // Analytics
      analyticsService.logEvent('daily_reward_claimed', {
        type: 'gems',
        amount: this.DAILY_GEMS,
        streak: newStreak,
      });

      console.log(`✅ Claimed ${this.DAILY_GEMS} daily gems (Streak: ${newStreak})`);

      return { success: true, gems: this.DAILY_GEMS };
    } catch (error) {
      console.error('Failed to claim daily gems:', error);
      return { success: false, error: 'unknown' };
    }
  }

  /**
   * Claim daily power-ups reward (premium only)
   */
  async claimDailyPowerUps(): Promise<{ success: boolean; error?: string }> {
    try {
      const isPremium = useMonetizationStore.getState().isPremium;
      if (!isPremium) {
        return { success: false, error: 'not_premium' };
      }

      const rewardStatus = await this.getDailyRewardStatus();
      if (!rewardStatus.canClaimPowerUps) {
        return { success: false, error: 'already_claimed' };
      }

      // Award power-ups
      for (const [type, quantity] of Object.entries(this.DAILY_POWER_UPS)) {
        await powerUpService.awardFreePowerUps(
          type as PowerUpType,
          quantity,
          'premium_daily_reward'
        );
      }

      // Update last claimed date
      const store = useMonetizationStore.getState();
      store.setDailyRewardClaimed('powerups', store.dailyReward.streak);
      await store.syncWithBackend();

      // Analytics
      analyticsService.logEvent('daily_reward_claimed', {
        type: 'power_ups',
        power_ups: this.DAILY_POWER_UPS,
      });

      console.log('✅ Claimed daily power-ups');

      return { success: true };
    } catch (error) {
      console.error('Failed to claim daily power-ups:', error);
      return { success: false, error: 'unknown' };
    }
  }

  /**
   * Check and auto-claim daily rewards (background task)
   */
  private async checkDailyRewards(): Promise<void> {
    const isPremium = useMonetizationStore.getState().isPremium;
    if (!isPremium) {
      return;
    }

    const rewardStatus = await this.getDailyRewardStatus();
    
    // Notify user if rewards are available (don't auto-claim)
    if (rewardStatus.canClaimGems || rewardStatus.canClaimPowerUps) {
      console.log('💎 Daily rewards available!');
      // Could trigger a notification here
    }
  }

  /**
   * Get premium feature description
   */
  getBenefitDescription(benefit: PremiumBenefit): string {
    const descriptions: Record<PremiumBenefit, string> = {
      [PremiumBenefit.AD_FREE]: 'No ads, uninterrupted gameplay',
      [PremiumBenefit.DAILY_GEMS]: `${this.DAILY_GEMS} gems every day`,
      [PremiumBenefit.DAILY_POWER_UPS]: '4 power-ups every day',
      [PremiumBenefit.EXCLUSIVE_THEMES]: 'Unlock exclusive themes',
      [PremiumBenefit.CLOUD_SAVE]: 'Save progress across devices',
      [PremiumBenefit.PRIORITY_SUPPORT]: 'Get help faster',
      [PremiumBenefit.EARLY_ACCESS]: 'Try new features first',
      [PremiumBenefit.BONUS_MULTIPLIER]: '2x score multiplier events',
    };

    return descriptions[benefit];
  }

  /**
   * Get premium benefit icon
   */
  getBenefitIcon(benefit: PremiumBenefit): string {
    const icons: Record<PremiumBenefit, string> = {
      [PremiumBenefit.AD_FREE]: '🚫',
      [PremiumBenefit.DAILY_GEMS]: '💎',
      [PremiumBenefit.DAILY_POWER_UPS]: '⚡',
      [PremiumBenefit.EXCLUSIVE_THEMES]: '🎨',
      [PremiumBenefit.CLOUD_SAVE]: '☁️',
      [PremiumBenefit.PRIORITY_SUPPORT]: '🎧',
      [PremiumBenefit.EARLY_ACCESS]: '🚀',
      [PremiumBenefit.BONUS_MULTIPLIER]: '✨',
    };

    return icons[benefit];
  }

  /**
   * Helper: Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Helper: Check if date2 is the day after date1
   */
  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const nextDay = new Date(date1);
    nextDay.setDate(nextDay.getDate() + 1);
    return this.isSameDay(nextDay, date2);
  }
}

export const premiumService = PremiumService.getInstance();
export { PremiumService };

