/**
 * Type definitions for environment variables from @env
 * These variables are loaded by react-native-dotenv from .env file
 */

declare module '@env' {
  // Supabase Configuration
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  
  // RevenueCat Configuration (for in-app purchases)
  export const REVENUECAT_API_KEY_IOS: string;
  export const REVENUECAT_API_KEY_ANDROID: string;
  
  // AdMob Configuration (for ads)
  export const ADMOB_APP_ID_IOS: string;
  export const ADMOB_APP_ID_ANDROID: string;
  export const ADMOB_REWARDED_AD_UNIT_IOS: string;
  export const ADMOB_REWARDED_AD_UNIT_ANDROID: string;
  export const ADMOB_INTERSTITIAL_AD_UNIT_IOS: string;
  export const ADMOB_INTERSTITIAL_AD_UNIT_ANDROID: string;
  export const ADMOB_BANNER_AD_UNIT_IOS: string;
  export const ADMOB_BANNER_AD_UNIT_ANDROID: string;
  export const ADMOB_BANNER_AD_UNIT_HOME_IOS: string;
  export const ADMOB_BANNER_AD_UNIT_HOME_ANDROID: string;
  
  // Google Sign-In Configuration
  export const GOOGLE_CLIENT_ID_IOS: string;
  export const GOOGLE_CLIENT_ID_ANDROID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
}

