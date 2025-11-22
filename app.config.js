/**
 * App Configuration
 * 
 * IMPORTANT: This file reads EAS Secrets and injects them into app config
 * so they're accessible via expo-constants at runtime.
 */

module.exports = {
  expo: {
    name: "Blocktopia",
    slug: "blocktopia",
    owner: "turntopia",
    version: "1.0.26",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    jsEngine: "hermes",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.blocktopia.app",
      infoPlist: {
        // GADApplicationIdentifier: "ca-app-pub-3088920444099039~9002215056", // Re-enabled with lazy loading fix
        // GADApplicationIdentifier: "ca-app-pub-3088920444099039~9002215056", // DISABLED to isolate crash
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription: "We need access to your photo library to upload your profile avatar.",
        NSCameraUsageDescription: "We need access to your camera to take a photo for your profile avatar."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.blocktopia.app",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "2.0.21"
          }
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "We need access to your photos to upload your profile avatar.",
          cameraPermission: "We need access to your camera to take a photo for your profile avatar."
        }
      ],
      "expo-av"
    ],
    extra: {
      eas: {
        projectId: "952e850a-61d0-46d1-a926-6eb791e88023"
      },
      // Inject EAS Secrets as environment variables accessible via expo-constants
      // These are read from process.env during build (EAS injects them)
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      // REVENUECAT_API_KEY_IOS: process.env.REVENUECAT_API_KEY_IOS || '',
      // REVENUECAT_API_KEY_ANDROID: process.env.REVENUECAT_API_KEY_ANDROID || '',
      // REVENUECAT_API_KEY_IOS: '',
      // REVENUECAT_API_KEY_ANDROID: '',
      // ADMOB_APP_ID_IOS: process.env.ADMOB_APP_ID_IOS || '',
      ADMOB_APP_ID_ANDROID: process.env.ADMOB_APP_ID_ANDROID || '',
      ADMOB_REWARDED_AD_UNIT_IOS: process.env.ADMOB_REWARDED_AD_UNIT_IOS || '',
      ADMOB_REWARDED_AD_UNIT_ANDROID: process.env.ADMOB_REWARDED_AD_UNIT_ANDROID || '',
      ADMOB_INTERSTITIAL_AD_UNIT_IOS: process.env.ADMOB_INTERSTITIAL_AD_UNIT_IOS || '',
      ADMOB_INTERSTITIAL_AD_UNIT_ANDROID: process.env.ADMOB_INTERSTITIAL_AD_UNIT_ANDROID || '',
      ADMOB_BANNER_AD_UNIT_IOS: process.env.ADMOB_BANNER_AD_UNIT_IOS || '',
      ADMOB_BANNER_AD_UNIT_ANDROID: process.env.ADMOB_BANNER_AD_UNIT_ANDROID || '',
      ADMOB_BANNER_AD_UNIT_HOME_IOS: process.env.ADMOB_BANNER_AD_UNIT_HOME_IOS || '',
      ADMOB_BANNER_AD_UNIT_HOME_ANDROID: process.env.ADMOB_BANNER_AD_UNIT_HOME_ANDROID || '',
      ADMOB_BANNER_AD_UNIT_GAME_IOS: process.env.ADMOB_BANNER_AD_UNIT_GAME_IOS || '',
      ADMOB_BANNER_AD_UNIT_GAME_ANDROID: process.env.ADMOB_BANNER_AD_UNIT_GAME_ANDROID || '',
    }
  }
};

