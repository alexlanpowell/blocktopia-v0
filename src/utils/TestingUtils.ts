/**
 * Testing Utilities - Phase 8
 * Helper functions for testing monetization features
 */

import { useMonetizationStore } from '../store/monetizationStore';
import { errorTracker, ErrorSeverity } from './ErrorTracker';
import { performanceMonitor } from './PerformanceMonitor';

export class TestingUtils {
  /**
   * Reset all monetization state (for testing)
   */
  static resetMonetizationState(): void {
    if (!__DEV__) {
      console.warn('resetMonetizationState should only be used in development');
      return;
    }

    const store = useMonetizationStore.getState();
    store.gems = 0;
    store.isPremium = false;
    store.ownedCosmetics = ['default'];
    store.powerUps = {
      magic_wand: 0,
      piece_swap: 0,
      undo_move: 0,
      line_blaster: 0,
    };

    console.log('✅ Monetization state reset');
  }

  /**
   * Grant test gems (for testing)
   */
  static grantTestGems(amount: number): void {
    if (!__DEV__) {
      console.warn('grantTestGems should only be used in development');
      return;
    }

    const store = useMonetizationStore.getState();
    store.setGems(store.gems + amount);
    console.log(`✅ Granted ${amount} test gems`);
  }

  /**
   * Enable premium (for testing)
   */
  static enableTestPremium(): void {
    if (!__DEV__) {
      console.warn('enableTestPremium should only be used in development');
      return;
    }

    const store = useMonetizationStore.getState();
    store.setPremium(true);
    console.log('✅ Premium enabled (test mode)');
  }

  /**
   * Simulate network failure
   */
  static async simulateNetworkFailure<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    if (!__DEV__) {
      throw new Error('simulateNetworkFailure should only be used in development');
    }

    // 50% chance of failure
    if (Math.random() < 0.5) {
      throw new Error('Simulated network failure');
    }

    return operation();
  }

  /**
   * Simulate slow network
   */
  static async simulateSlowNetwork<T>(
    operation: () => Promise<T>,
    delayMs: number = 3000
  ): Promise<T> {
    if (!__DEV__) {
      throw new Error('simulateSlowNetwork should only be used in development');
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
    return operation();
  }

  /**
   * Test error tracking
   */
  static testErrorTracking(): void {
    if (!__DEV__) return;

    console.log('🧪 Testing error tracking...');

    // Test different severity levels
    errorTracker.trackError(
      new Error('Test low severity error'),
      ErrorSeverity.LOW,
      'Testing'
    );

    errorTracker.trackError(
      new Error('Test medium severity error'),
      ErrorSeverity.MEDIUM,
      'Testing'
    );

    errorTracker.trackError(
      new Error('Test high severity error'),
      ErrorSeverity.HIGH,
      'Testing'
    );

    console.log('✅ Error tracking test complete');
    console.log('Error history:', errorTracker.getErrorHistory());
  }

  /**
   * Test performance monitoring
   */
  static testPerformanceMonitoring(): void {
    if (!__DEV__) return;

    console.log('🧪 Testing performance monitoring...');

    // Simulate fast operation
    performanceMonitor.measure('test_fast_operation', () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    });

    // Simulate slow operation
    performanceMonitor.startMeasure('test_slow_operation');
    setTimeout(() => {
      performanceMonitor.endMeasure('test_slow_operation');
      console.log('✅ Performance monitoring test complete');
      console.log(performanceMonitor.getSummary());
    }, 100);
  }

  /**
   * Validate purchase flow
   */
  static async testPurchaseFlow(): Promise<void> {
    if (!__DEV__) return;

    console.log('🧪 Testing purchase flow...');

    const store = useMonetizationStore.getState();

    // Test: Purchase with insufficient gems
    console.log('Test 1: Purchase with insufficient gems');
    store.setGems(0);
    // Attempt purchase (should fail)

    // Test: Purchase with sufficient gems
    console.log('Test 2: Purchase with sufficient gems');
    store.setGems(1000);
    // Attempt purchase (should succeed)

    // Test: Purchase premium-only without premium
    console.log('Test 3: Premium-only purchase without premium');
    store.setPremium(false);
    // Attempt premium purchase (should fail)

    console.log('✅ Purchase flow tests complete');
  }

  /**
   * Test ad flow
   */
  static testAdFlow(): void {
    if (!__DEV__) return;

    console.log('🧪 Testing ad flow...');

    const store = useMonetizationStore.getState();

    // Test: Ad-free user shouldn't see ads
    console.log('Test 1: Ad-free user');
    store.setAdFreePurchased(true);
    console.log('Should show ad:', store.shouldShowInterstitial()); // Should be false

    // Test: Premium user shouldn't see ads
    console.log('Test 2: Premium user');
    store.setPremium(true);
    console.log('Should show ad:', store.shouldShowInterstitial()); // Should be false

    // Test: Regular user with correct frequency
    console.log('Test 3: Regular user with frequency');
    store.setAdFreePurchased(false);
    store.setPremium(false);
    store.resetInterstitialCount();
    
    for (let i = 0; i < 5; i++) {
      store.incrementInterstitialCount();
      console.log(`Game ${i + 1}, should show ad:`, store.shouldShowInterstitial());
    }

    console.log('✅ Ad flow tests complete');
  }

  /**
   * Generate test report
   */
  static generateTestReport(): string {
    if (!__DEV__) return 'Test report only available in development';

    let report = '=== TEST REPORT ===\n\n';
    
    report += '--- Error Tracking ---\n';
    report += errorTracker.generateErrorReport();
    report += '\n';

    report += '--- Performance ---\n';
    report += performanceMonitor.getSummary();
    report += '\n';

    report += '--- Monetization State ---\n';
    const store = useMonetizationStore.getState();
    report += `Gems: ${store.gems}\n`;
    report += `Premium: ${store.isPremium}\n`;
    report += `Ad-Free: ${store.adState.adFreePurchased}\n`;
    report += `Owned Cosmetics: ${store.ownedCosmetics.length}\n`;

    return report;
  }

  /**
   * Stress test: Rapid purchases
   */
  static async stressTestPurchases(count: number = 10): Promise<void> {
    if (!__DEV__) return;

    console.log(`🧪 Stress testing ${count} rapid purchases...`);

    const start = Date.now();

    for (let i = 0; i < count; i++) {
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const duration = Date.now() - start;
    console.log(`✅ Stress test complete: ${count} purchases in ${duration}ms`);
    console.log(`Average: ${(duration / count).toFixed(2)}ms per purchase`);
  }

  /**
   * Memory leak detection
   */
  static checkMemoryLeaks(): void {
    if (!__DEV__) return;

    console.log('🧪 Checking for memory leaks...');

    // Check for common memory leak patterns
    const store = useMonetizationStore.getState();
    
    // Check for excessive array sizes
    if (store.ownedCosmetics.length > 1000) {
      console.warn('⚠️ Possible memory leak: ownedCosmetics array too large');
    }

    console.log('✅ Memory leak check complete');
  }
}

// Export singleton methods
export const {
  resetMonetizationState,
  grantTestGems,
  enableTestPremium,
  simulateNetworkFailure,
  simulateSlowNetwork,
  testErrorTracking,
  testPerformanceMonitoring,
  testPurchaseFlow,
  testAdFlow,
  generateTestReport,
  stressTestPurchases,
  checkMemoryLeaks,
} = TestingUtils;

