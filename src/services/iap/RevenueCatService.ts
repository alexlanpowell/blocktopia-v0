/**
 * RevenueCat Service - IAP & Subscription Management
 * Wrapper around RevenueCat SDK for purchases, subscriptions, and entitlements
 */

import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  PurchasesStoreProduct,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { ENV_CONFIG } from '../backend/config';
import { analyticsService } from '../analytics/AnalyticsService';

class RevenueCatService {
  private static instance: RevenueCatService | null = null;
  private initialized: boolean = false;
  private offerings: PurchasesOfferings | null = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  /**
   * Initialize RevenueCat with user ID
   */
  async initialize(userId: string): Promise<void> {
    if (this.initialized) {
      console.log('RevenueCat already initialized');
      return;
    }

    try {
      console.log('🛒 Initializing RevenueCat...');

      // Get API key for platform
      const apiKey = Platform.select({
        ios: ENV_CONFIG.REVENUECAT_API_KEY_IOS,
        android: ENV_CONFIG.REVENUECAT_API_KEY_ANDROID,
        default: '',
      });

      if (!apiKey) {
        console.warn('⚠️ RevenueCat API key not configured');
        return;
      }

      // Configure SDK
      Purchases.setLogLevel(ENV_CONFIG.isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      
      // Configure with user ID
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      // Load offerings
      this.offerings = await Purchases.getOfferings();
      
      this.initialized = true;
      console.log('✅ RevenueCat initialized');
      console.log(`Available offerings: ${Object.keys(this.offerings.all).length}`);
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get available offerings (products)
   */
  async getOfferings(): Promise<PurchasesOfferings> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Refresh offerings
    this.offerings = await Purchases.getOfferings();
    return this.offerings;
  }

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
    customerInfo: CustomerInfo;
    productIdentifier: string;
  }> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      console.log(`Purchasing package: ${packageToPurchase.product.identifier}`);
      
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('✅ Purchase successful:', productIdentifier);
      
      // Log analytics
      analyticsService.logEvent('iap_purchase_success', {
        product_id: productIdentifier,
        price: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode,
      });

      return { customerInfo, productIdentifier };
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Log error analytics
      analyticsService.logEvent('iap_purchase_failed', {
        product_id: packageToPurchase.product.identifier,
        error_code: error.code,
        error_message: error.message,
      });

      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('✅ Purchases restored');
      analyticsService.logEvent('iap_restore_success');

      return customerInfo;
    } catch (error) {
      console.error('Restore error:', error);
      analyticsService.logEvent('iap_restore_failed');
      throw error;
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    return await Purchases.getCustomerInfo();
  }

  /**
   * Check if user has active entitlement
   */
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo.entitlements.active[entitlementId] !== undefined;
    } catch (error) {
      console.error('Error checking entitlement:', error);
      return false;
    }
  }

  /**
   * Check if user has premium subscription
   */
  async hasPremium(): Promise<boolean> {
    return await this.hasEntitlement('premium');
  }

  /**
   * Check if user has ad-free purchase
   */
  async hasAdFree(): Promise<boolean> {
    return await this.hasEntitlement('ad_free');
  }

  /**
   * Get products by IDs
   */
  async getProducts(productIds: string[]): Promise<PurchasesStoreProduct[]> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    return await Purchases.getProducts(productIds);
  }

  /**
   * Set user attributes
   */
  async setAttributes(attributes: Record<string, string | null>): Promise<void> {
    if (!this.initialized) return;

    try {
      await Purchases.setAttributes(attributes);
    } catch (error) {
      console.error('Error setting attributes:', error);
    }
  }

  /**
   * Set user ID (for account linking)
   */
  async logIn(userId: string): Promise<{ customerInfo: CustomerInfo; created: boolean }> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const { customerInfo, created } = await Purchases.logIn(userId);
      console.log(`✅ Logged in as ${userId}${created ? ' (new customer)' : ''}`);
      return { customerInfo, created };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Log out user (for account switching)
   */
  async logOut(): Promise<CustomerInfo> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const customerInfo = await Purchases.logOut();
      console.log('✅ Logged out');
      return customerInfo;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current offerings (cached)
   */
  getCurrentOfferings(): PurchasesOfferings | null {
    return this.offerings;
  }
}

export const revenueCatService = RevenueCatService.getInstance();
export { RevenueCatService };

