/**
 * Environment Configuration
 * Centralized configuration management for all services
 */

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  REVENUECAT_API_KEY_IOS,
  REVENUECAT_API_KEY_ANDROID,
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
} from '@env';

// ============================================================
// 🔍 DEBUG: Environment Variable Loading Check
// ============================================================
console.log('\n=== 🔍 ENV DEBUG: Checking @env imports ===');
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
// ============================================================

export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL: SUPABASE_URL || '',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || '',
  
  // RevenueCat
  REVENUECAT_API_KEY_IOS: REVENUECAT_API_KEY_IOS || '',
  REVENUECAT_API_KEY_ANDROID: REVENUECAT_API_KEY_ANDROID || '',
  
  // AdMob
  ADMOB_APP_ID_IOS: ADMOB_APP_ID_IOS || '',
  ADMOB_APP_ID_ANDROID: ADMOB_APP_ID_ANDROID || '',
  ADMOB_REWARDED_AD_UNIT_IOS: ADMOB_REWARDED_AD_UNIT_IOS || '',
  ADMOB_REWARDED_AD_UNIT_ANDROID: ADMOB_REWARDED_AD_UNIT_ANDROID || '',
  ADMOB_INTERSTITIAL_AD_UNIT_IOS: ADMOB_INTERSTITIAL_AD_UNIT_IOS || '',
  ADMOB_INTERSTITIAL_AD_UNIT_ANDROID: ADMOB_INTERSTITIAL_AD_UNIT_ANDROID || '',
  ADMOB_BANNER_AD_UNIT_IOS: ADMOB_BANNER_AD_UNIT_IOS || '',
  ADMOB_BANNER_AD_UNIT_ANDROID: ADMOB_BANNER_AD_UNIT_ANDROID || '',
  ADMOB_BANNER_AD_UNIT_HOME_IOS: ADMOB_BANNER_AD_UNIT_HOME_IOS || '',
  ADMOB_BANNER_AD_UNIT_HOME_ANDROID: ADMOB_BANNER_AD_UNIT_HOME_ANDROID || '',
  
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

