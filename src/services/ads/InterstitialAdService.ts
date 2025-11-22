/**
 * InterstitialAdService - Manages interstitial ads shown between games
 * Shows full-screen ads every N games for non-premium users
 */

import { Platform } from 'react-native';
import { ENV_CONFIG } from '../backend/config';
import { adManager } from './AdManager';
import { analyticsService } from '../analytics/AnalyticsService';
// import type { InterstitialAd as InterstitialAdType } from 'react-native-google-mobile-ads';

type InterstitialAdType = any;

class InterstitialAdService {
  private static instance: InterstitialAdService | null = null;
  private interstitial: InterstitialAdType | null = null;
  private loaded: boolean = false;
  private loading: boolean = false;
  private adUnitId: string = ''; // Initialize in initializeAd()
  
  // Ad frequency configuration
  private gamesPlayedSinceLastAd: number = 0;
  private readonly AD_FREQUENCY = 3; // Show every 3 games
  private readonly MIN_TIME_BETWEEN_ADS = 180000; // 3 minutes in milliseconds
  private lastAdTimestamp: number = 0;

  private constructor() {
    // Don't initialize immediately - wait for adManager to be ready
  }

  static getInstance(): InterstitialAdService {
    if (!InterstitialAdService.instance) {
      InterstitialAdService.instance = new InterstitialAdService();
    }
    return InterstitialAdService.instance;
  }

  async initialize(): Promise<void> {
    /*
    const { TestIds } = await import('react-native-google-mobile-ads');

    // Use test IDs in development, real IDs in production
    this.adUnitId = ENV_CONFIG.isDevelopment
      ? TestIds.INTERSTITIAL
      : Platform.select({
          ios: ENV_CONFIG.ADMOB_INTERSTITIAL_AD_UNIT_IOS,
          android: ENV_CONFIG.ADMOB_INTERSTITIAL_AD_UNIT_ANDROID,
          default: TestIds.INTERSTITIAL,
        }) || TestIds.INTERSTITIAL;
    */
    
    console.log('InterstitialAdService initialized (MOCKED)');
    await this.initializeAd();
  }

  private async initializeAd(): Promise<void> {
    try {
      /*
      const { InterstitialAd, AdEventType } = await import('react-native-google-mobile-ads');

      this.interstitial = InterstitialAd.createForAdRequest(this.adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ Interstitial ad loaded');
        this.loaded = true;
        this.loading = false;
      });

      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');
        this.loaded = false;
        // Preload next ad
        this.loadAd();
      });

      this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('Interstitial ad error:', error);
        this.loading = false;
        this.loaded = false;
        
        analyticsService.logEvent('interstitial_ad_error', {
          error: error.message,
        });
        
        // Retry loading after delay
        setTimeout(() => {
          this.loadAd();
        }, 60000); // 1 minute
      });

      // Preload the first ad
      this.loadAd();
      */
    } catch (error) {
      console.error('Failed to initialize interstitial ad:', error);
    }
  }

  async loadAd(): Promise<void> {
    if (!adManager.isInitialized() || this.loading || this.loaded) {
      return;
    }

    try {
      this.loading = true;
      console.log('Loading interstitial ad... (MOCKED)');
      // await this.interstitial?.load();
      this.loading = false;
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
      this.loading = false;
    }
  }

  /**
   * Call this when a game ends to track frequency
   */
  incrementGameCount(): void {
    this.gamesPlayedSinceLastAd++;
    console.log(`Games since last ad: ${this.gamesPlayedSinceLastAd}/${this.AD_FREQUENCY}`);
  }

  /**
   * Check if we should show an ad based on frequency and timing
   */
  private shouldShowAd(): boolean {
    // Don't show to premium users
    if (adManager.isAdFreeUser()) {
      console.log('User is ad-free, skipping interstitial');
      return false;
    }

    // Check game frequency
    if (this.gamesPlayedSinceLastAd < this.AD_FREQUENCY) {
      console.log(`Not enough games played: ${this.gamesPlayedSinceLastAd}/${this.AD_FREQUENCY}`);
      return false;
    }

    // Check time since last ad
    const timeSinceLastAd = Date.now() - this.lastAdTimestamp;
    if (timeSinceLastAd < this.MIN_TIME_BETWEEN_ADS) {
      console.log('Too soon since last ad');
      return false;
    }

    // Check if ad is loaded
    if (!this.loaded || !this.interstitial) {
      console.log('Interstitial ad not ready');
      return false;
    }

    return true;
  }

  /**
   * Attempt to show an interstitial ad
   * Call this after game ends
   */
  async show(): Promise<{ shown: boolean; reason?: string }> {
    if (!this.shouldShowAd()) {
      return { shown: false, reason: 'criteria_not_met' };
    }

    try {
      console.log('Showing interstitial ad');
      
      await this.interstitial!.show();
      
      // Reset counters
      this.gamesPlayedSinceLastAd = 0;
      this.lastAdTimestamp = Date.now();
      this.loaded = false;
      
      analyticsService.logEvent('interstitial_ad_shown', {
        games_since_last: this.gamesPlayedSinceLastAd,
      });

      return { shown: true };
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      
      analyticsService.logEvent('interstitial_ad_show_failed', {
        error: error instanceof Error ? error.message : 'unknown',
      });

      return { shown: false, reason: 'show_failed' };
    }
  }

  /**
   * Check if ad is ready to show
   */
  isReady(): boolean {
    return this.loaded && !!this.interstitial;
  }

  /**
   * Get games remaining until next ad
   */
  getGamesUntilNextAd(): number {
    return Math.max(0, this.AD_FREQUENCY - this.gamesPlayedSinceLastAd);
  }

  /**
   * Reset game counter (useful for testing)
   */
  resetGameCounter(): void {
    this.gamesPlayedSinceLastAd = 0;
  }
}

export const interstitialAdService = InterstitialAdService.getInstance();
export { InterstitialAdService };
