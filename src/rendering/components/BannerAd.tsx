/**
 * BannerAd Component - Displays banner ad at bottom of game screen
 * Only shows for non-premium users
 * Follows Apple HIG and Material Design principles
 * Optimized with React.memo for performance
 * 
 * IMPORTANT: This component lazy-loads Google Mobile Ads to prevent native module crashes
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMonetizationStore } from '../../store/monetizationStore';

/**
 * GameBannerAd Component
 * Displays a banner ad above the piece preview area
 * Respects safe areas, premium users, and follows UI/UX best practices
 * 
 * Lazy-loads native ad module to prevent crashes on startup
 */
export const GameBannerAd = memo(function GameBannerAd() {
  const insets = useSafeAreaInsets();
  const isPremium = useMonetizationStore(state => state.isPremium);
  const adFreePurchased = useMonetizationStore(state => state.adState.adFreePurchased);
  const [BannerAdComponent, setBannerAdComponent] = useState<any>(null);
  const [bannerAdService, setBannerAdService] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);

  // Lazy load the native ad modules
  useEffect(() => {
    // Don't load ads for premium/ad-free users
    if (isPremium || adFreePurchased) {
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [{ BannerAd, BannerAdSize: AdSize }, { bannerAdService: service }] = await Promise.all([
          import('react-native-google-mobile-ads'),
          import('../../services/ads/BannerAdService'),
        ]);

        if (mounted) {
          setBannerAdComponent(() => BannerAd);
          setBannerAdSize(() => AdSize);
          setBannerAdService(() => service);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to load banner ad modules:', error);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isPremium, adFreePurchased]);

  const handleAdLoaded = useCallback(() => {
    if (__DEV__) {
      console.log('✅ Banner ad loaded successfully');
    }
    bannerAdService?.logImpression();
  }, [bannerAdService]);

  const handleAdFailedToLoad = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn('⚠️ Banner ad failed to load:', error.message);
    }
    bannerAdService?.logLoadError(error);
  }, [bannerAdService]);

  const handleAdOpened = useCallback(() => {
    if (__DEV__) {
      console.log('👆 Banner ad opened');
    }
    bannerAdService?.logClick();
  }, [bannerAdService]);

  // Don't show banner for premium or ad-free users
  if (isPremium || adFreePurchased || !bannerAdService?.shouldShowBanner()) {
    return null;
  }

  // Don't render until modules are loaded
  if (!BannerAdComponent || !BannerAdSize || !bannerAdService) {
    return null;
  }

  // Calculate position: piece preview is 150px tall, positioned at bottom + safe area
  // Banner should sit directly above it
  const PIECE_PREVIEW_HEIGHT = 150;
  const bannerBottom = PIECE_PREVIEW_HEIGHT + insets.bottom;

  return (
    <View 
      style={[
        styles.container,
        { bottom: bannerBottom }
      ]}
      accessible={false}
      pointerEvents="box-none"
    >
      <BannerAdComponent
        unitId={bannerAdService.getAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
      />
    </View>
  );
});

/**
 * HomeBannerAd Component
 * Displays a banner ad at the bottom of the home screen
 * Respects safe areas, premium users, and follows UI/UX best practices
 * 
 * Lazy-loads native ad module to prevent crashes on startup
 */
export const HomeBannerAd = memo(function HomeBannerAd() {
  const insets = useSafeAreaInsets();
  const isPremium = useMonetizationStore(state => state.isPremium);
  const adFreePurchased = useMonetizationStore(state => state.adState.adFreePurchased);
  const [BannerAdComponent, setBannerAdComponent] = useState<any>(null);
  const [bannerAdService, setBannerAdService] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);

  // Lazy load the native ad modules
  useEffect(() => {
    // Don't load ads for premium/ad-free users
    if (isPremium || adFreePurchased) {
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [{ BannerAd, BannerAdSize: AdSize }, { bannerAdService: service }] = await Promise.all([
          import('react-native-google-mobile-ads'),
          import('../../services/ads/BannerAdService'),
        ]);

        if (mounted) {
          setBannerAdComponent(() => BannerAd);
          setBannerAdSize(() => AdSize);
          setBannerAdService(() => service);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to load home banner ad modules:', error);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isPremium, adFreePurchased]);

  const handleAdLoaded = useCallback(() => {
    if (__DEV__) {
      console.log('✅ Home banner ad loaded successfully');
    }
    bannerAdService?.logImpression('home');
  }, [bannerAdService]);

  const handleAdFailedToLoad = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn('⚠️ Home banner ad failed to load:', error.message);
    }
    bannerAdService?.logLoadError(error, 'home');
  }, [bannerAdService]);

  const handleAdOpened = useCallback(() => {
    if (__DEV__) {
      console.log('👆 Home banner ad opened');
    }
    bannerAdService?.logClick('home');
  }, [bannerAdService]);

  // Don't show banner for premium or ad-free users
  if (isPremium || adFreePurchased || !bannerAdService?.shouldShowBanner()) {
    return null;
  }

  // Don't render until modules are loaded
  if (!BannerAdComponent || !BannerAdSize || !bannerAdService) {
    return null;
  }

  return (
    <View 
      style={[
        styles.homeContainer,
        { paddingBottom: insets.bottom }
      ]}
      accessible={false}
      pointerEvents="box-none"
    >
      <BannerAdComponent
        unitId={bannerAdService.getAdUnitId('home')}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 5, // Above game board, below HUD and power-ups
    // Minimum height for adaptive banner (will expand if needed)
    minHeight: 50,
  },
  homeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10, // Above most UI elements
    minHeight: 50,
  },
});

