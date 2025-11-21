/**
 * Optimization Service - Phase 10
 * Orchestrates A/B testing and personalization
 */

import { remoteConfig } from '../config/RemoteConfigService';

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
   * @param getVariantFn - Optional function to get A/B test variant (breaks circular dependency)
   */
  getOptimizedValue<T>(key: string, defaultValue: T, getVariantFn?: (testId: string) => string | null): T {
    // 1. Check if there's an active A/B test for this key
    const testVariant = this.getVariantForConfigKey(key, getVariantFn);
    
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
   * @param assignVariantFn - Function to assign variant (from EnhancedAnalyticsService)
   */
  startTest(testId: string, variants: string[], assignVariantFn: (testId: string, variants: string[]) => string): string {
    // Assign user to variant using provided function
    const variant = assignVariantFn(testId, variants);
    this.activeTests.set(testId, variant);
    return variant;
  }

  /**
   * Get assigned variant for a test
   * @param getVariantFn - Function to get variant (from EnhancedAnalyticsService)
   */
  getTestVariant(testId: string, getVariantFn?: (testId: string) => string | null): string | null {
    // Check local cache first
    if (this.activeTests.has(testId)) {
      return this.activeTests.get(testId) || null;
    }
    // Fallback to provided function
    return getVariantFn ? getVariantFn(testId) : null;
  }

  // --- Optimization Logic ---

  private getVariantForConfigKey(key: string, getVariantFn?: (testId: string) => string | null): string | null {
    // Map config keys to tests
    const testMap: Record<string, string> = {
      'ad_interstitial_frequency': ABTestType.AD_FREQUENCY,
      'welcome_bonus_gems': ABTestType.WELCOME_BONUS,
    };

    const testId = testMap[key];
    if (!testId) return null;

    return this.getTestVariant(testId, getVariantFn);
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

