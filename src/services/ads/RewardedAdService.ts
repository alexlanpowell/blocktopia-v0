/**
 * RewardedAdService - Manages rewarded video ads for the "Extra Try" feature
 * Users watch an ad to get a second chance when game is over (clears 4 random rows)
 */

import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { ENV_CONFIG } from '../backend/config';
import { adManager } from './AdManager';
import { analyticsService } from '../analytics/AnalyticsService';

class RewardedAdService {
  private static instance: RewardedAdService | null = null;
  private rewarded: RewardedAd | null = null;
  private loaded: boolean = false;
  private loading: boolean = false;
  private adUnitId: string;

  private constructor() {
    // Use test IDs in development, real IDs in production
    this.adUnitId = ENV_CONFIG.isDevelopment
      ? TestIds.REWARDED
      : Platform.select({
          ios: ENV_CONFIG.ADMOB_REWARDED_AD_UNIT_IOS,
          android: ENV_CONFIG.ADMOB_REWARDED_AD_UNIT_ANDROID,
          default: TestIds.REWARDED,
        });

    console.log('RewardedAdService initialized with unit ID:', this.adUnitId);
    this.initializeAd();
  }

  static getInstance(): RewardedAdService {
    if (!RewardedAdService.instance) {
      RewardedAdService.instance = new RewardedAdService();
    }
    return RewardedAdService.instance;
  }

  private initializeAd(): void {
    try {
      this.rewarded = RewardedAd.createForAdRequest(this.adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners
      this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('✅ Rewarded ad loaded');
        this.loaded = true;
        this.loading = false;
      });

      this.rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('🎁 User earned reward:', reward);
        analyticsService.logEvent('rewarded_ad_completed', {
          ad_type: 'extra_try',
          reward_amount: reward.amount,
          reward_type: reward.type,
        });
      });

      // Note: CLOSED event removed in newer AdMob versions
      // Ad will be reloaded when show() completes

      // Preload the first ad
      this.loadAd();
    } catch (error) {
      console.error('Failed to initialize rewarded ad:', error);
    }
  }

  async loadAd(): Promise<void> {
    if (!adManager.isInitialized() || this.loading || this.loaded) {
      return;
    }

    try {
      this.loading = true;
      console.log('Loading rewarded ad...');
      await this.rewarded?.load();
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
      this.loading = false;
      
      // Retry after 30 seconds
      setTimeout(() => {
        this.loadAd();
      }, 30000);
    }
  }

  async show(): Promise<{ watched: boolean; error?: string }> {
    if (!adManager.canShowAds()) {
      console.log('User is ad-free, skipping ad');
      return { watched: false, error: 'ad_free_user' };
    }

    if (!this.loaded || !this.rewarded) {
      console.warn('Rewarded ad not ready');
      analyticsService.logEvent('rewarded_ad_not_ready', {
        loaded: this.loaded,
        has_rewarded: !!this.rewarded,
      });
      
      // Try to load ad
      await this.loadAd();
      return { watched: false, error: 'ad_not_ready' };
    }

    return new Promise((resolve) => {
      let resolved = false;

      const earnedRewardListener = this.rewarded!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          if (!resolved) {
            resolved = true;
            resolve({ watched: true });
          }
        }
      );

      // Note: CLOSED event removed in newer AdMob versions
      // Fallback timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          earnedRewardListener();
          resolve({ watched: false, error: 'ad_timeout' });
        }
      }, 30000); // 30 second timeout

      try {
        this.loaded = false;
        this.rewarded!.show();
        
        analyticsService.logEvent('rewarded_ad_shown', {
          ad_type: 'extra_try',
        });
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
        if (!resolved) {
          resolved = true;
          resolve({ watched: false, error: 'show_failed' });
        }
        earnedRewardListener();
        clearTimeout(timeoutId);
      }
    });
  }

  isReady(): boolean {
    return this.loaded && !!this.rewarded;
  }
}

export const rewardedAdService = RewardedAdService.getInstance();
export { RewardedAdService };

