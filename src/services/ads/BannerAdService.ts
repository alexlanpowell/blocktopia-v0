/**
 * BannerAdService - Manages banner ads displayed during gameplay
 * Shows persistent banner at bottom of screen for non-premium users
 * Follows singleton pattern matching existing AdManager architecture
 */

import {
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { ENV_CONFIG } from '../backend/config';
import { adManager } from './AdManager';
import { analyticsService } from '../analytics/AnalyticsService';

class BannerAdService {
  private static instance: BannerAdService | null = null;
  private adUnitId: string;

  private constructor() {
    // Use test IDs in development, real IDs in production
    this.adUnitId = ENV_CONFIG.isDevelopment
      ? TestIds.BANNER
      : Platform.select({
          ios: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_IOS,
          android: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_ANDROID,
          default: TestIds.BANNER,
        }) || TestIds.BANNER;

    if (__DEV__) {
      console.log('BannerAdService initialized with unit ID:', this.adUnitId);
    }
  }

  static getInstance(): BannerAdService {
    if (!BannerAdService.instance) {
      BannerAdService.instance = new BannerAdService();
    }
    return BannerAdService.instance;
  }

  /**
   * Get ad unit ID for banner
   * @returns Ad unit ID string
   */
  getAdUnitId(): string {
    return this.adUnitId;
  }

  /**
   * Check if banner should be shown
   * Verifies AdMob is initialized and user is not ad-free
   * @returns true if banner should be displayed
   */
  shouldShowBanner(): boolean {
    return adManager.canShowAds();
  }

  /**
   * Log banner impression for analytics
   */
  logImpression(): void {
    try {
      analyticsService.logEvent('banner_ad_shown', {
        placement: 'game_screen',
        ad_unit_id: this.adUnitId,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to log banner impression:', error);
      }
    }
  }

  /**
   * Log banner click for analytics
   */
  logClick(): void {
    try {
      analyticsService.logEvent('banner_ad_clicked', {
        placement: 'game_screen',
        ad_unit_id: this.adUnitId,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to log banner click:', error);
      }
    }
  }

  /**
   * Log banner ad load failure
   * @param error - Error that occurred during ad load
   */
  logLoadError(error: unknown): void {
    try {
      analyticsService.logEvent('banner_ad_load_failed', {
        placement: 'game_screen',
        error: error instanceof Error ? error.message : String(error),
      });
    } catch (logError) {
      if (__DEV__) {
        console.warn('Failed to log banner load error:', logError);
      }
    }
  }
}

export const bannerAdService = BannerAdService.getInstance();
export { BannerAdService };

