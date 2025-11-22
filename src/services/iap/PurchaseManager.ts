/**
 * Purchase Manager - Orchestrates IAP purchase flows
 * Integrates RevenueCat with VirtualCurrencyManager and other systems
 */

import { Alert } from 'react-native';
import { revenueCatService } from './RevenueCatService';
import { virtualCurrencyManager, GemSource } from '../currency/VirtualCurrencyManager';
import { useMonetizationStore } from '../../store/monetizationStore';
import { analyticsService } from '../analytics/AnalyticsService';
import { getProductById, getTotalGems } from './ProductCatalog';
// import Purchases from 'react-native-purchases'; // Deep lazy load instead

interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

class PurchaseManager {
  private static instance: PurchaseManager | null = null;

  private constructor() {}

  static getInstance(): PurchaseManager {
    if (!PurchaseManager.instance) {
      PurchaseManager.instance = new PurchaseManager();
    }
    return PurchaseManager.instance;
  }

  /**
   * Purchase a gem pack
   */
  async purchaseGemPack(productId: string): Promise<PurchaseResult> {
    try {
      console.log(`Purchasing gem pack: ${productId}`);

      /*
      // Get product details
      const product = getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get offerings from RevenueCat
      const offerings = await revenueCatService.getOfferings();
      
      // Find the package
      const packageToPurchase = offerings.current?.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Package not found in offerings');
      }

      // Make purchase
      const { customerInfo, productIdentifier } = await revenueCatService.purchasePackage(
        packageToPurchase
      );

      // Calculate gems to add
      const gemsToAdd = getTotalGems(product);

      // Add gems to user account
      await virtualCurrencyManager.addGems(gemsToAdd, GemSource.IAP, {
        product_id: productIdentifier,
        price: product.price,
        base_gems: product.gems,
        bonus_gems: product.bonus || 0,
      });

      // Show success message
      this.showPurchaseSuccess(gemsToAdd);

      // Analytics
      analyticsService.logEvent('gem_pack_purchased', {
        product_id: productIdentifier,
        gems_received: gemsToAdd,
        price: product.price,
      });

      return { success: true, productId: productIdentifier };
      */
     
      return { success: false, error: 'MOCKED' };
    } catch (error: any) {
      console.error('Gem pack purchase error:', error);

      /*
      // Handle user cancellation
      const { default: Purchases } = await import('react-native-purchases');
      
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('Purchase cancelled by user');
        return { success: false, error: 'cancelled' };
      }

      // Handle network errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
        return { success: false, error: 'network_error' };
      }
      */

      // Show generic error
      Alert.alert(
        'Purchase Failed',
        error.message || 'An error occurred. Please try again.'
      );

      return { success: false, error: error.message };
    }
  }

  /**
   * Purchase remove ads
   */
  async purchaseRemoveAds(productId: string): Promise<PurchaseResult> {
    try {
      console.log('Purchasing remove ads');

      /*
      const offerings = await revenueCatService.getOfferings();
      const packageToPurchase = offerings.current?.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Remove ads package not found');
      }

      const { customerInfo, productIdentifier } = await revenueCatService.purchasePackage(
        packageToPurchase
      );

      // Check for ad-free entitlement
      if (customerInfo.entitlements.active['ad_free']) {
        // Update local state
        useMonetizationStore.getState().setAdFreePurchased(true);

        // Sync to backend
        await useMonetizationStore.getState().syncWithBackend();

        Alert.alert(
          'Purchase Successful',
          'Ads have been removed! Enjoy your ad-free experience.'
        );

        analyticsService.logEvent('ad_free_purchased', {
          product_id: productIdentifier,
        });

        return { success: true, productId: productIdentifier };
      }

      return { success: false, error: 'entitlement_not_found' };
      */
      return { success: false, error: 'MOCKED' };
    } catch (error: any) {
      console.error('Remove ads purchase error:', error);

      /*
      const { default: Purchases } = await import('react-native-purchases');

      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { success: false, error: 'cancelled' };
      }
      */

      Alert.alert('Purchase Failed', error.message || 'Please try again.');
      return { success: false, error: error.message };
    }
  }

  /**
   * Purchase premium subscription
   */
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      console.log('Purchasing subscription:', productId);

      /*
      const offerings = await revenueCatService.getOfferings();
      const packageToPurchase = offerings.current?.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Subscription package not found');
      }

      const { customerInfo, productIdentifier } = await revenueCatService.purchasePackage(
        packageToPurchase
      );

      // Check for premium entitlement
      if (customerInfo.entitlements.active['premium']) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;

        // Update local state
        useMonetizationStore.getState().setPremiumStatus(true, expiresAt || undefined);

        // Sync to backend
        await useMonetizationStore.getState().syncWithBackend();

        Alert.alert(
          'Welcome to Premium!',
          'Your premium benefits are now active. Enjoy!'
        );

        analyticsService.logEvent('premium_subscribed', {
          product_id: productIdentifier,
          period_type: entitlement.periodType || 'unknown',
        });

        return { success: true, productId: productIdentifier };
      }

      return { success: false, error: 'entitlement_not_found' };
      */
      return { success: false, error: 'MOCKED' };
    } catch (error: any) {
      console.error('Subscription purchase error:', error);

      /*
      const { default: Purchases } = await import('react-native-purchases');

      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { success: false, error: 'cancelled' };
      }
      */

      Alert.alert('Purchase Failed', error.message || 'Please try again.');
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<boolean> {
    try {
      console.log('Restoring purchases...');

      /*
      const customerInfo = await revenueCatService.restorePurchases();

      let restoredItems: string[] = [];

      // Check for ad-free
      if (customerInfo.entitlements.active['ad_free']) {
        useMonetizationStore.getState().setAdFreePurchased(true);
        restoredItems.push('Ad-Free');
      }

      // Check for premium
      if (customerInfo.entitlements.active['premium']) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
        useMonetizationStore.getState().setPremiumStatus(true, expiresAt || undefined);
        restoredItems.push('Premium Subscription');
      }

      // Sync to backend
      await useMonetizationStore.getState().syncWithBackend();

      if (restoredItems.length > 0) {
        Alert.alert(
          'Purchases Restored',
          `Successfully restored: ${restoredItems.join(', ')}`
        );
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.'
        );
        return false;
      }
      */
     
      Alert.alert('Restore Unavailable', 'This feature is temporarily mocked.');
      return false;
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.'
      );
      return false;
    }
  }

  /**
   * Show purchase success message
   */
  private showPurchaseSuccess(gems: number): void {
    Alert.alert(
      '💎 Purchase Successful!',
      `You received ${gems} gems!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  }

  /**
   * Check if product is available
   */
  async isProductAvailable(productId: string): Promise<boolean> {
    try {
      const offerings = await revenueCatService.getOfferings();
      return offerings.current?.availablePackages.some(
        p => p.product.identifier === productId
      ) || false;
    } catch (error) {
      console.error('Error checking product availability:', error);
      return false;
    }
  }
}

export const purchaseManager = PurchaseManager.getInstance();
export { PurchaseManager };
