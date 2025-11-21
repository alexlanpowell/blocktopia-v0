/**
 * Environment Configuration
 * Centralized configuration management for all services
 * 
 * IMPORTANT: Uses expo-constants to read EAS Secrets in cloud builds
 * Falls back to @env for local development with .env file
 */

import Constants from 'expo-constants';

// ============================================================
// 🔧 ENVIRONMENT VARIABLE LOADING (EAS Secrets + .env support)
// ============================================================
// EAS Secrets are injected into Constants.expoConfig.extra during cloud builds
// For local dev, we fall back to @env imports from .env file

// Helper function to get env var from EAS Secrets (production) or @env (dev)
function getEnvVar(key: string): string {
  try {
    // First, try EAS Secrets (available in Constants.expoConfig.extra in cloud builds)
    const expoExtra = Constants.expoConfig?.extra;
    if (expoExtra && expoExtra[key]) {
      return String(expoExtra[key]);
    }
    
    // Fall back to @env for local development
    // NOTE: This will be empty in cloud builds without .env file
    try {
      const envModule = require('@env');
      return envModule[key] || '';
    } catch {
      return '';
    }
  } catch (error) {
    console.error(`Error loading env var ${key}:`, error);
    return '';
  }
}

// ============================================================
// 🚀 LAZY-LOADED ENVIRONMENT CONFIG
// Values are computed when ACCESSED, not when IMPORTED
// This ensures Constants.expoConfig.extra is available
// ============================================================
export const ENV_CONFIG = {
  // Supabase - lazy loaded via getters
  get SUPABASE_URL() { return getEnvVar('SUPABASE_URL'); },
  get SUPABASE_ANON_KEY() { return getEnvVar('SUPABASE_ANON_KEY'); },
  
  // RevenueCat - lazy loaded via getters
  get REVENUECAT_API_KEY_IOS() { return getEnvVar('REVENUECAT_API_KEY_IOS'); },
  get REVENUECAT_API_KEY_ANDROID() { return getEnvVar('REVENUECAT_API_KEY_ANDROID'); },
  
  // AdMob - lazy loaded via getters
  get ADMOB_APP_ID_IOS() { return getEnvVar('ADMOB_APP_ID_IOS'); },
  get ADMOB_APP_ID_ANDROID() { return getEnvVar('ADMOB_APP_ID_ANDROID'); },
  get ADMOB_REWARDED_AD_UNIT_IOS() { return getEnvVar('ADMOB_REWARDED_AD_UNIT_IOS'); },
  get ADMOB_REWARDED_AD_UNIT_ANDROID() { return getEnvVar('ADMOB_REWARDED_AD_UNIT_ANDROID'); },
  get ADMOB_INTERSTITIAL_AD_UNIT_IOS() { return getEnvVar('ADMOB_INTERSTITIAL_AD_UNIT_IOS'); },
  get ADMOB_INTERSTITIAL_AD_UNIT_ANDROID() { return getEnvVar('ADMOB_INTERSTITIAL_AD_UNIT_ANDROID'); },
  get ADMOB_BANNER_AD_UNIT_IOS() { return getEnvVar('ADMOB_BANNER_AD_UNIT_IOS'); },
  get ADMOB_BANNER_AD_UNIT_ANDROID() { return getEnvVar('ADMOB_BANNER_AD_UNIT_ANDROID'); },
  get ADMOB_BANNER_AD_UNIT_HOME_IOS() { return getEnvVar('ADMOB_BANNER_AD_UNIT_HOME_IOS'); },
  get ADMOB_BANNER_AD_UNIT_HOME_ANDROID() { return getEnvVar('ADMOB_BANNER_AD_UNIT_HOME_ANDROID'); },
  
  // Feature Flags - static values
  ENABLE_ADS: true,
  ENABLE_IAP: true,
  ENABLE_ANALYTICS: true,
  
  // Environment - static values
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

/**
 * Validate that all required environment variables are set
 */
export function validateConfig(): { valid: boolean; missing: string[] } {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!ENV_CONFIG[key as keyof typeof ENV_CONFIG]) {
      missing.push(key);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Debug function to log environment variable status
 * Safe to call - won't crash if values are missing
 */
export function debugEnvVars() {
  if (__DEV__) {
    try {
      const supabaseUrl = ENV_CONFIG.SUPABASE_URL;
      const supabaseKey = ENV_CONFIG.SUPABASE_ANON_KEY;
      
      console.log('\n=== 🔍 ENV DEBUG: Environment Variables ===');
      console.log('SUPABASE_URL:', {
        hasValue: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        preview: supabaseUrl ? `${supabaseUrl.substring(0, 25)}...` : 'EMPTY'
      });
      console.log('SUPABASE_ANON_KEY:', {
        hasValue: !!supabaseKey,
        length: supabaseKey?.length || 0,
        preview: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'EMPTY'
      });
      console.log('=== END ENV DEBUG ===\n');
    } catch (error) {
      console.error('Error in debugEnvVars:', error);
    }
  }
}

