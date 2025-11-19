/**
 * Optimization Service - Phase 10
 * Orchestrates A/B testing and personalization
 */

import { remoteConfig } from '../config/RemoteConfigService';
import { enhancedAnalytics } from '../analytics/EnhancedAnalyticsService';
import { useMonetizationStore } from '../../store/monetizationStore';

export enum ABTestType {
  PRICING = 'pricing_test',
  AD_FREQUENCY = 'ad_frequency_test',
  WELCOME_BONUS = 'welcome_bonus_test',
}

export interface ABTestConfig {
  id: string;
  variants: string[];
  weights: number[]; // e.g. [0.5, 0.5]
}

class OptimizationService {
  private static instance: OptimizationService | null = null;
  private activeTests: Map<string, string> = new Map(); // testId -> variantId

  private constructor() {}

  static getInstance(): OptimizationService {
    if (!OptimizationService.instance) {
      OptimizationService.instance = new OptimizationService();
    }
    return OptimizationService.instance;
  }

  /**
   * Get optimized value for a parameter
   * Checks for active A/B tests first, then falls back to Remote Config
   */
  getOptimizedValue<T>(key: string, defaultValue: T): T {
    // 1. Check if there's an active A/B test for this key
    const testVariant = this.getVariantForConfigKey(key);
    
    if (testVariant) {
      // Logic to return variant value would go here
      // For simplicity, we'll assume variant name contains value or map to it
      return this.getVariantValue<T>(key, testVariant) ?? defaultValue;
    }

    // 2. Fallback to Remote Config
    const remoteVal = remoteConfig.getValue<T>(key);
    if (remoteVal !== undefined && remoteVal !== null) {
      return remoteVal;
    }

    // 3. Fallback to default
    return defaultValue;
  }

  /**
   * Initialize/Start an A/B test
   */
  startTest(testId: string, variants: string[]): string {
    // Assign user to variant
    const variant = enhancedAnalytics.assignABTestVariant(testId, variants);
    this.activeTests.set(testId, variant);
    return variant;
  }

  /**
   * Get assigned variant for a test
   */
  getTestVariant(testId: string): string | null {
    return enhancedAnalytics.getABTestVariant(testId);
  }

  // --- Optimization Logic ---

  private getVariantForConfigKey(key: string): string | null {
    // Map config keys to tests
    const testMap: Record<string, string> = {
      'ad_interstitial_frequency': ABTestType.AD_FREQUENCY,
      'welcome_bonus_gems': ABTestType.WELCOME_BONUS,
    };

    const testId = testMap[key];
    if (!testId) return null;

    return this.getTestVariant(testId);
  }

  private getVariantValue<T>(key: string, variant: string): T | null {
    // Define variant values
    // In a real app, this might also come from remote config JSON
    if (key === 'ad_interstitial_frequency') {
      if (variant === 'frequent') return 2 as T;
      if (variant === 'sparse') return 5 as T;
    }
    
    if (key === 'welcome_bonus_gems') {
      if (variant === 'high_bonus') return 200 as T;
      if (variant === 'low_bonus') return 50 as T;
    }

    return null;
  }
}

export const optimizationService = OptimizationService.getInstance();
export { OptimizationService };

