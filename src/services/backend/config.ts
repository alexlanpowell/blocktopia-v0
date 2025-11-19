/**
 * Environment Configuration
 * Centralized configuration management for all services
 */

export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  
  // RevenueCat
  REVENUECAT_API_KEY_IOS: process.env.REVENUECAT_API_KEY_IOS || '',
  REVENUECAT_API_KEY_ANDROID: process.env.REVENUECAT_API_KEY_ANDROID || '',
  
  // AdMob
  ADMOB_APP_ID_IOS: process.env.ADMOB_APP_ID_IOS || '',
  ADMOB_APP_ID_ANDROID: process.env.ADMOB_APP_ID_ANDROID || '',
  ADMOB_REWARDED_AD_UNIT_IOS: process.env.ADMOB_REWARDED_AD_UNIT_IOS || '',
  ADMOB_REWARDED_AD_UNIT_ANDROID: process.env.ADMOB_REWARDED_AD_UNIT_ANDROID || '',
  ADMOB_INTERSTITIAL_AD_UNIT_IOS: process.env.ADMOB_INTERSTITIAL_AD_UNIT_IOS || '',
  ADMOB_INTERSTITIAL_AD_UNIT_ANDROID: process.env.ADMOB_INTERSTITIAL_AD_UNIT_ANDROID || '',
  
  // Google Sign-In
  GOOGLE_CLIENT_ID_IOS: process.env.GOOGLE_CLIENT_ID_IOS || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.GOOGLE_CLIENT_ID_ANDROID || '',
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '',
  
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

