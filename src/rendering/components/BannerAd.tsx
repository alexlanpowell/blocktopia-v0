/**
 * BannerAd Component - Displays banner ad at bottom of game screen
 * Only shows for non-premium users
 * Follows Apple HIG and Material Design principles
 * Optimized with React.memo for performance
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bannerAdService } from '../../services/ads/BannerAdService';
import { useMonetizationStore } from '../../store/monetizationStore';

/**
 * GameBannerAd Component
 * Displays a banner ad above the piece preview area
 * Respects safe areas, premium users, and follows UI/UX best practices
 */
export const GameBannerAd = memo(function GameBannerAd() {
  const insets = useSafeAreaInsets();
  const isPremium = useMonetizationStore(state => state.isPremium);
  const adFreePurchased = useMonetizationStore(state => state.adState.adFreePurchased);

  const handleAdLoaded = useCallback(() => {
    if (__DEV__) {
      console.log('✅ Banner ad loaded successfully');
    }
    bannerAdService.logImpression();
  }, []);

  const handleAdFailedToLoad = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn('⚠️ Banner ad failed to load:', error.message);
    }
    bannerAdService.logLoadError(error);
  }, []);

  const handleAdOpened = useCallback(() => {
    if (__DEV__) {
      console.log('👆 Banner ad opened');
    }
    bannerAdService.logClick();
  }, []);

  // Don't show banner for premium or ad-free users
  if (isPremium || adFreePurchased || !bannerAdService.shouldShowBanner()) {
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
      <BannerAd
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
 */
export const HomeBannerAd = memo(function HomeBannerAd() {
  const insets = useSafeAreaInsets();
  const isPremium = useMonetizationStore(state => state.isPremium);
  const adFreePurchased = useMonetizationStore(state => state.adState.adFreePurchased);

  const handleAdLoaded = useCallback(() => {
    if (__DEV__) {
      console.log('✅ Home banner ad loaded successfully');
    }
    bannerAdService.logImpression('home');
  }, []);

  const handleAdFailedToLoad = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn('⚠️ Home banner ad failed to load:', error.message);
    }
    bannerAdService.logLoadError(error, 'home');
  }, []);

  const handleAdOpened = useCallback(() => {
    if (__DEV__) {
      console.log('👆 Home banner ad opened');
    }
    bannerAdService.logClick('home');
  }, []);

  // Don't show banner for premium or ad-free users
  if (isPremium || adFreePurchased || !bannerAdService.shouldShowBanner()) {
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
      <BannerAd
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

