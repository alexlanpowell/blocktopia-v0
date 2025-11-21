/**
 * BannerAdService - Manages banner ads displayed in different locations
 * Shows persistent banner at bottom of screen for non-premium users
 * Supports multiple ad placements: game screen and home screen
 */

import {
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { ENV_CONFIG } from '../backend/config';
import { adManager } from './AdManager';
import { analyticsService } from '../analytics/AnalyticsService';

export type BannerLocation = 'game' | 'home';

class BannerAdService {
  private static instance: BannerAdService | null = null;
  private gameAdUnitId: string;
  private homeAdUnitId: string;

  private constructor() {
    // Game banner ad unit (default/backward compatible)
    this.gameAdUnitId = ENV_CONFIG.isDevelopment
      ? TestIds.BANNER
      : Platform.select({
          ios: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_IOS,
          android: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_ANDROID,
          default: TestIds.BANNER,
        }) || TestIds.BANNER;

    // Home banner ad unit (separate ad unit for home screen)
    this.homeAdUnitId = ENV_CONFIG.isDevelopment
      ? TestIds.BANNER
      : Platform.select({
          ios: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_HOME_IOS,
          android: ENV_CONFIG.ADMOB_BANNER_AD_UNIT_HOME_ANDROID,
          default: TestIds.BANNER,
        }) || TestIds.BANNER;

    if (__DEV__) {
      console.log('BannerAdService initialized');
      console.log('  Game banner:', this.gameAdUnitId);
      console.log('  Home banner:', this.homeAdUnitId);
    }
  }

  static getInstance(): BannerAdService {
    if (!BannerAdService.instance) {
      BannerAdService.instance = new BannerAdService();
    }
    return BannerAdService.instance;
  }

  /**
   * Get ad unit ID for banner at specific location
   * @param location - Where the banner is displayed ('game' or 'home')
   * @returns Ad unit ID string
   */
  getAdUnitId(location: BannerLocation = 'game'): string {
    return location === 'home' ? this.homeAdUnitId : this.gameAdUnitId;
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
   * @param location - Where the banner is displayed
   */
  logImpression(location: BannerLocation = 'game'): void {
    try {
      analyticsService.logEvent('banner_ad_shown', {
        placement: `${location}_screen`,
        ad_unit_id: this.getAdUnitId(location),
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to log banner impression:', error);
      }
    }
  }

  /**
   * Log banner click for analytics
   * @param location - Where the banner is displayed
   */
  logClick(location: BannerLocation = 'game'): void {
    try {
      analyticsService.logEvent('banner_ad_clicked', {
        placement: `${location}_screen`,
        ad_unit_id: this.getAdUnitId(location),
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
   * @param location - Where the banner is displayed
   */
  logLoadError(error: unknown, location: BannerLocation = 'game'): void {
    try {
      analyticsService.logEvent('banner_ad_load_failed', {
        placement: `${location}_screen`,
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

