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
  // First, try EAS Secrets (available in Constants.expoConfig.extra in cloud builds)
  const expoExtra = Constants.expoConfig?.extra;
  if (expoExtra && expoExtra[key]) {
    return expoExtra[key];
  }
  
  // Fall back to @env for local development
  // NOTE: This will be empty in cloud builds without .env file
  try {
    const envModule = require('@env');
    return envModule[key] || '';
  } catch {
    return '';
  }
}

// Load all environment variables
const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY');
const REVENUECAT_API_KEY_IOS = getEnvVar('REVENUECAT_API_KEY_IOS');
const REVENUECAT_API_KEY_ANDROID = getEnvVar('REVENUECAT_API_KEY_ANDROID');
const ADMOB_APP_ID_IOS = getEnvVar('ADMOB_APP_ID_IOS');
const ADMOB_APP_ID_ANDROID = getEnvVar('ADMOB_APP_ID_ANDROID');
const ADMOB_REWARDED_AD_UNIT_IOS = getEnvVar('ADMOB_REWARDED_AD_UNIT_IOS');
const ADMOB_REWARDED_AD_UNIT_ANDROID = getEnvVar('ADMOB_REWARDED_AD_UNIT_ANDROID');
const ADMOB_INTERSTITIAL_AD_UNIT_IOS = getEnvVar('ADMOB_INTERSTITIAL_AD_UNIT_IOS');
const ADMOB_INTERSTITIAL_AD_UNIT_ANDROID = getEnvVar('ADMOB_INTERSTITIAL_AD_UNIT_ANDROID');
const ADMOB_BANNER_AD_UNIT_IOS = getEnvVar('ADMOB_BANNER_AD_UNIT_IOS');
const ADMOB_BANNER_AD_UNIT_ANDROID = getEnvVar('ADMOB_BANNER_AD_UNIT_ANDROID');
const ADMOB_BANNER_AD_UNIT_HOME_IOS = getEnvVar('ADMOB_BANNER_AD_UNIT_HOME_IOS');
const ADMOB_BANNER_AD_UNIT_HOME_ANDROID = getEnvVar('ADMOB_BANNER_AD_UNIT_HOME_ANDROID');

// ============================================================
// 🔍 DEBUG: Environment Variable Loading Check (DEV ONLY)
// ============================================================
if (__DEV__) {
  console.log('\n=== 🔍 ENV DEBUG: Checking environment variables ===');
  console.log('SUPABASE_URL:', {
    type: typeof SUPABASE_URL,
    hasValue: !!SUPABASE_URL,
    length: SUPABASE_URL?.length || 0,
    preview: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 25)}...` : 'EMPTY/UNDEFINED'
  });
  console.log('SUPABASE_ANON_KEY:', {
    type: typeof SUPABASE_ANON_KEY,
    hasValue: !!SUPABASE_ANON_KEY,
    length: SUPABASE_ANON_KEY?.length || 0,
    preview: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 30)}...` : 'EMPTY/UNDEFINED'
  });
  console.log('=== END ENV DEBUG ===\n');
}
// ============================================================

export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  
  // RevenueCat
  REVENUECAT_API_KEY_IOS,
  REVENUECAT_API_KEY_ANDROID,
  
  // AdMob
  ADMOB_APP_ID_IOS,
  ADMOB_APP_ID_ANDROID,
  ADMOB_REWARDED_AD_UNIT_IOS,
  ADMOB_REWARDED_AD_UNIT_ANDROID,
  ADMOB_INTERSTITIAL_AD_UNIT_IOS,
  ADMOB_INTERSTITIAL_AD_UNIT_ANDROID,
  ADMOB_BANNER_AD_UNIT_IOS,
  ADMOB_BANNER_AD_UNIT_ANDROID,
  ADMOB_BANNER_AD_UNIT_HOME_IOS,
  ADMOB_BANNER_AD_UNIT_HOME_ANDROID,
  
  // Feature Flags
  ENABLE_ADS: true,
  ENABLE_IAP: true,
  ENABLE_ANALYTICS: true,
  
  // Environment
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
} as const;

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

