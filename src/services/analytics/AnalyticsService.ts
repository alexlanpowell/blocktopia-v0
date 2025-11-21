/**
 * Analytics Service
 * Centralized event tracking for monetization and user behavior
 */

import { getSupabase } from '../backend/SupabaseClient';
import { useMonetizationStore } from '../../store/monetizationStore';

export interface AnalyticsEvent {
  event_name: string;
  event_params?: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

/**
 * Analytics Service Singleton
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Firebase Analytics will be initialized in Phase 7
      // For now, just mark as initialized
      this.initialized = true;
      // Logging handled by app initialization
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  /**
   * Log generic event
   */
  async logEvent(
    eventName: string,
    params?: Record<string, any>
  ): Promise<void> {
    try {
      const userId = useMonetizationStore.getState().user.userId;

      // Log to Supabase for custom queries
      if (userId) {
        const supabase = getSupabase();
        await supabase.from('analytics_events').insert({
          event_name: eventName,
          event_params: params || {},
          user_id: userId,
          timestamp: new Date().toISOString(),
        });
      }

      // Firebase Analytics will be added in Phase 7
      if (__DEV__) {
        console.log(`📊 Analytics: ${eventName}`, params);
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  // Game Events
  logGameStart(): void {
    this.logEvent('game_start');
  }

  logGameEnd(score: number, duration: number): void {
    this.logEvent('game_end', { score, duration });
  }

  logPiecePlaced(pieceType: string, score: number): void {
    this.logEvent('piece_placed', { piece_type: pieceType, score });
  }

  logLinesCleared(count: number, combo: boolean): void {
    this.logEvent('lines_cleared', { count, combo });
  }

  // Monetization Events (Placeholders for Phase 2+)
  logAdImpression(adType: 'rewarded' | 'interstitial'): void {
    this.logEvent('ad_impression', { ad_type: adType });
  }

  logAdClick(adType: 'rewarded' | 'interstitial'): void {
    this.logEvent('ad_clicked', { ad_type: adType });
  }

  logIAPPurchase(
    productId: string,
    price: number,
    currency: string = 'USD'
  ): void {
    this.logEvent('iap_purchase', {
      product_id: productId,
      price,
      currency,
    });
  }

  logGemsSpent(amount: number, item: string): void {
    this.logEvent('gems_spent', { amount, item });
  }

  logGemsEarned(amount: number, source: string): void {
    this.logEvent('gems_earned', { amount, source });
  }

  // User Events
  logSignIn(provider: string): void {
    this.logEvent('user_sign_in', { provider });
  }

  logSignOut(): void {
    this.logEvent('user_sign_out');
  }

  logAccountLinked(provider: string): void {
    this.logEvent('account_linked', { provider });
  }

  // Set user properties
  setUserProperty(key: string, value: any): void {
    // Firebase Analytics user properties will be added in Phase 7
    if (__DEV__) {
      console.log(`📊 User Property: ${key} = ${value}`);
    }
  }
}

export default AnalyticsService;
export const analyticsService = AnalyticsService.getInstance();

