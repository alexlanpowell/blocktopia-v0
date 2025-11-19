/**
 * Enhanced Analytics Service - Phase 7
 * Advanced analytics, conversion tracking, A/B testing, performance monitoring
 */

import { analyticsService } from './AnalyticsService';
import { useMonetizationStore } from '../../store/monetizationStore';

// Conversion Funnel Events
export enum ConversionFunnel {
  SHOP_OPENED = 'shop_opened',
  PRODUCT_VIEWED = 'product_viewed',
  PURCHASE_INITIATED = 'purchase_initiated',
  PURCHASE_COMPLETED = 'purchase_completed',
  PURCHASE_FAILED = 'purchase_failed',
}

// User Segments
export enum UserSegment {
  NEW_USER = 'new_user',           // < 1 day
  ACTIVE_USER = 'active_user',     // 1-7 days
  ENGAGED_USER = 'engaged_user',   // 7-30 days
  POWER_USER = 'power_user',       // 30+ days, high activity
  WHALE = 'whale',                 // High spender
  CHURNED = 'churned',             // 30+ days inactive
}

// A/B Test Variants
export interface ABTestConfig {
  testId: string;
  variantId: string;
  startDate: Date;
  endDate: Date;
}

class EnhancedAnalyticsService {
  private static instance: EnhancedAnalyticsService | null = null;
  private sessionStartTime: number = 0;
  private eventQueue: any[] = [];
  private abTests: Map<string, string> = new Map(); // testId -> variantId
  
  private constructor() {
    this.sessionStartTime = Date.now();
  }

  static getInstance(): EnhancedAnalyticsService {
    if (!EnhancedAnalyticsService.instance) {
      EnhancedAnalyticsService.instance = new EnhancedAnalyticsService();
    }
    return EnhancedAnalyticsService.instance;
  }

  /**
   * Track conversion funnel step
   */
  trackConversionFunnel(
    step: ConversionFunnel,
    metadata?: Record<string, any>
  ): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    analyticsService.logEvent(step, {
      ...metadata,
      session_duration_ms: sessionDuration,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track revenue event (unified)
   */
  trackRevenue(params: {
    source: 'ad' | 'iap' | 'subscription';
    amount: number;
    currency: string;
    productId?: string;
    transactionId?: string;
  }): void {
    analyticsService.logEvent('revenue_generated', {
      revenue_source: params.source,
      revenue_amount: params.amount,
      revenue_currency: params.currency,
      product_id: params.productId,
      transaction_id: params.transactionId,
      user_segment: this.getUserSegment(),
      is_premium: useMonetizationStore.getState().isPremium,
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, duration?: number): void {
    analyticsService.logEvent('user_engagement', {
      engagement_action: action,
      engagement_duration_ms: duration,
      session_duration_ms: Date.now() - this.sessionStartTime,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    analyticsService.logEvent('feature_used', {
      feature_name: feature,
      ...metadata,
      user_segment: this.getUserSegment(),
    });
  }

  /**
   * Track error/exception
   */
  trackError(error: Error, context?: string): void {
    analyticsService.logEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
      user_segment: this.getUserSegment(),
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    analyticsService.logEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
    });
  }

  /**
   * Track retention event
   */
  trackRetention(daysSinceInstall: number): void {
    analyticsService.logEvent('retention_check', {
      days_since_install: daysSinceInstall,
      user_segment: this.getUserSegment(),
      is_premium: useMonetizationStore.getState().isPremium,
    });
  }

  /**
   * Get user segment
   */
  getUserSegment(): UserSegment {
    const store = useMonetizationStore.getState();
    
    // Whale: Premium + high gems spent
    if (store.isPremium) {
      return UserSegment.WHALE;
    }
    
    // Power user: High engagement (placeholder logic)
    // In production, check actual metrics from backend
    const gems = store.gems;
    if (gems > 5000) {
      return UserSegment.POWER_USER;
    }
    
    // Default segments (would need install date from backend)
    return UserSegment.ACTIVE_USER;
  }

  /**
   * Set user properties for segmentation
   */
  setUserProperties(properties: Record<string, any>): void {
    for (const [key, value] of Object.entries(properties)) {
      analyticsService.setUserProperty(key, value);
    }
  }

  /**
   * A/B Testing: Assign user to variant
   */
  assignABTestVariant(testId: string, variants: string[]): string {
    // Check if already assigned
    if (this.abTests.has(testId)) {
      return this.abTests.get(testId)!;
    }

    // Random assignment
    const variantIndex = Math.floor(Math.random() * variants.length);
    const variant = variants[variantIndex];
    
    this.abTests.set(testId, variant);

    // Log assignment
    analyticsService.logEvent('ab_test_assigned', {
      test_id: testId,
      variant_id: variant,
    });

    return variant;
  }

  /**
   * A/B Testing: Get assigned variant
   */
  getABTestVariant(testId: string): string | null {
    return this.abTests.get(testId) || null;
  }

  /**
   * Track A/B test conversion
   */
  trackABTestConversion(testId: string, conversionEvent: string): void {
    const variant = this.abTests.get(testId);
    if (!variant) return;

    analyticsService.logEvent('ab_test_conversion', {
      test_id: testId,
      variant_id: variant,
      conversion_event: conversionEvent,
    });
  }

  /**
   * Track session start
   */
  startSession(): void {
    this.sessionStartTime = Date.now();
    analyticsService.logEvent('session_start', {
      user_segment: this.getUserSegment(),
      is_premium: useMonetizationStore.getState().isPremium,
    });
  }

  /**
   * Track session end
   */
  endSession(): void {
    const duration = Date.now() - this.sessionStartTime;
    analyticsService.logEvent('session_end', {
      session_duration_ms: duration,
      user_segment: this.getUserSegment(),
    });
  }

  /**
   * Batch events (for performance)
   */
  private queueEvent(event: any): void {
    this.eventQueue.push(event);
    
    // Flush every 10 events or after 30 seconds
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    }
  }

  /**
   * Flush event queue
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Batch send to analytics
    console.log(`📊 Flushing ${events.length} analytics events`);
    // In production, batch send to Firebase/backend
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(
    numeratorEvent: string,
    denominatorEvent: string
  ): number {
    // This would query actual analytics data
    // Placeholder for now
    return 0;
  }

  /**
   * Get revenue metrics
   */
  getRevenueMetrics(): {
    totalRevenue: number;
    averageRevenuePerUser: number;
    averageRevenuePerPayingUser: number;
  } {
    // This would query actual analytics data
    // Placeholder for now
    return {
      totalRevenue: 0,
      averageRevenuePerUser: 0,
      averageRevenuePerPayingUser: 0,
    };
  }

  /**
   * Debug: Print all active A/B tests
   */
  debugPrintABTests(): void {
    console.log('🧪 Active A/B Tests:');
    this.abTests.forEach((variant, testId) => {
      console.log(`  ${testId}: ${variant}`);
    });
  }
}

export const enhancedAnalytics = EnhancedAnalyticsService.getInstance();
export { EnhancedAnalyticsService };

