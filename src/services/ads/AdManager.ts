/**
 * AdManager - Singleton for managing ad lifecycle and configuration
 * Handles initialization and ad-free user checks
 */

import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { useMonetizationStore } from '../../store/monetizationStore';
import { ENV_CONFIG } from '../backend/config';

class AdManager {
  private static instance: AdManager | null = null;
  private initialized: boolean = false;
  private initializing: boolean = false;

  private constructor() {}

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) {
      console.log('AdManager already initialized or initializing');
      return;
    }

    if (!ENV_CONFIG.ENABLE_ADS) {
      console.log('Ads disabled via feature flag');
      return;
    }

    try {
      this.initializing = true;
      console.log('🎯 Initializing AdMob...');

      await mobileAds().initialize();

      // Configure ad settings
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      this.initialized = true;
      console.log('✅ AdMob initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AdMob:', error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if user should see ads
   * Premium users and users who purchased ad-free don't see ads
   */
  isAdFreeUser(): boolean {
    const state = useMonetizationStore.getState();
    return state.isPremium || state.adState.adFreePurchased;
  }

  /**
   * Check if user can see ads (initialized and not ad-free)
   */
  canShowAds(): boolean {
    return this.initialized && !this.isAdFreeUser();
  }
}

export const adManager = AdManager.getInstance();
export { AdManager };

