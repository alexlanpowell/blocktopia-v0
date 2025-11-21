/**
 * HUD Component - Display score, best score, and controls
 * Follows Apple HIG and Material Design principles
 * Optimized with React.memo for performance
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useScore, useBestScore, useIsGameOver, useGameStore } from '../../store/gameStore';
import { useMonetizationStore } from '../../store/monetizationStore';
import { rewardedAdService } from '../../services/ads/RewardedAdService';
import { interstitialAdService } from '../../services/ads/InterstitialAdService';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import AudioManager, { SoundEffect } from '../../services/audio/AudioManager';

export const HUD = memo(function HUD() {
  const score = useScore();
  const bestScore = useBestScore();
  const isGameOver = useIsGameOver();
  const restartGameStore = useGameStore(state => state.restartGame);
  const continueGameStore = useGameStore(state => state.continueGame);
  const gameState = useGameStore(state => state.gameState);
  const isPremium = useMonetizationStore(state => state.isPremium);
  const router = useRouter();
  
  // State for continue button
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  
  // Check if continue is available
  const canContinue = gameState?.canContinue ?? false;
  
  const handleRestartPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    Alert.alert(
      "Restart Game",
      "Are you sure you want to restart? Your current progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Restart", 
          style: "destructive",
          onPress: () => restartGameStore()
        }
      ]
    );
  }, [restartGameStore]);

  const handlePlayAgain = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    
    // Show interstitial ad before restarting (for free users)
    try {
      // Increment game count for ad frequency tracking
      interstitialAdService.incrementGameCount();
      
      // Show interstitial ad (non-blocking - game continues if ad fails)
      await interstitialAdService.show();
    } catch (error) {
      // Silently handle ad errors - don't block game restart
      if (__DEV__) {
        console.log('Interstitial ad not shown:', error);
      }
    }
    
    // Restart game regardless of ad result
    restartGameStore();
  }, [restartGameStore]);

  const handleContinue = useCallback(async () => {
    if (!canContinue) {
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    setContinueError(null);
    
    // Premium users get extra try without ads
    if (isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      continueGameStore();
      return;
    }
    
    // Free users watch rewarded ad for extra try
    setIsLoadingAd(true);
    
    try {
      const result = await rewardedAdService.show();
      
      if (result.watched) {
        // User watched the full ad - grant extra try
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        continueGameStore();
      } else {
        // User closed ad without watching or ad failed
        const errorMsg = result.error === 'ad_not_ready' 
          ? 'Ad not ready, try again in a moment' 
          : 'Watch the full ad for extra try';
        setContinueError(errorMsg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      // Ad failed to load or show
      setContinueError('Ad not available, try again');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      if (__DEV__) {
        console.error('Rewarded ad error:', error);
      }
    } finally {
      setIsLoadingAd(false);
    }
  }, [canContinue, isPremium, continueGameStore]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Left section - Back button */}
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the main menu"
          >
            <BlurView intensity={20} tint="dark" style={styles.buttonBlur}>
              <Text style={styles.buttonText}>‹</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Center section - Logo */}
        <View style={styles.centerSection}>
          <Image 
            source={require('../../../assets/logo-full.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Blocktopia"
            accessibilityRole="header"
          />
        </View>

        {/* Right section - Settings and Restart Buttons */}
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
              router.push('/settings');
            }}
            activeOpacity={0.7}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            accessibilityHint="Opens app settings"
          >
            <BlurView intensity={20} tint="dark" style={styles.buttonBlur}>
              <Text style={styles.buttonText}>⚙️</Text>
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRestartPress}
            activeOpacity={0.7}
            accessibilityLabel="Restart game"
            accessibilityRole="button"
            accessibilityHint="Restarts the current game"
          >
            <BlurView intensity={20} tint="dark" style={styles.buttonBlur}>
              <Text style={styles.buttonText}>↻</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scores Row - Moved below Top Bar */}
      <View style={styles.scoreRow}>
        <BlurView intensity={15} tint="dark" style={styles.scoreContainer} accessible={true} accessibilityLabel={`Current score: ${score}`}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </BlurView>
        <BlurView intensity={15} tint="dark" style={styles.scoreContainer} accessible={true} accessibilityLabel={`Best score: ${bestScore}`}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.bestScoreValue}>{bestScore.toLocaleString()}</Text>
        </BlurView>
      </View>

      {/* Game over overlay */}
      {isGameOver && (
        <BlurView intensity={50} tint="dark" style={styles.gameOverOverlay} accessible={true} accessibilityLabel="Game over screen">
          <View style={styles.gameOverCard}>
            <LinearGradient
              colors={[COLORS.accent.error, COLORS.primary.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gameOverTitleGradient}
            >
              <Text style={styles.gameOverTitle} accessibilityRole="header">Game Over!</Text>
            </LinearGradient>
            
            <Text style={styles.gameOverScore}>Score: {score.toLocaleString()}</Text>
            {score === bestScore && score > 0 && (
              <LinearGradient
                colors={[COLORS.accent.gold, COLORS.accent.warning]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newBestGradient}
              >
                <Text style={styles.newBestText} accessibilityLiveRegion="polite">
                  🎉 New Best Score!
                </Text>
              </LinearGradient>
            )}
            
            {/* Extra Try Button - Watch Ad for Second Chance */}
            {canContinue && (
              <TouchableOpacity 
                style={[styles.continueButton, isLoadingAd && styles.continueButtonDisabled]} 
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={isLoadingAd}
                accessibilityLabel={isPremium ? "Extra try" : "Watch ad for extra try"}
                accessibilityRole="button"
                accessibilityHint="Clears 4 random rows to give you another chance"
              >
                <LinearGradient
                  colors={[COLORS.accent.gold, COLORS.accent.warning]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  {isLoadingAd ? (
                    <ActivityIndicator color={COLORS.ui.text} size="small" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonIcon}>🎬</Text>
                      <Text style={styles.continueButtonText}>
                        {isPremium ? 'Extra Try' : 'Watch Ad for Extra Try'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Error message if ad fails */}
            {continueError && (
              <Text style={styles.errorText}>{continueError}</Text>
            )}
            
            {/* Play Again Button */}
            <TouchableOpacity 
              style={styles.restartButton} 
              onPress={handlePlayAgain}
              activeOpacity={0.8}
              accessibilityLabel="Play again"
              accessibilityRole="button"
              accessibilityHint="Starts a new game"
            >
              <LinearGradient
                colors={[COLORS.primary.cyan, COLORS.primary.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.restartButtonGradient}
              >
                <Text style={styles.restartButtonText}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 44 : 36,
    paddingBottom: SPACING.xs,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  logoImage: {
    width: 204,
    height: 61,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.round,
  },
  buttonText: {
    fontSize: 24,
    color: COLORS.ui.text,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 90,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  scoreLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.ui.textSecondary,
    marginBottom: 2,
    fontSize: 10,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.primary.cyan,
    textShadowColor: COLORS.primary.cyanGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bestScoreValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.accent.gold,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 1000, // Ensure it covers everything
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameOverCard: {
    backgroundColor: COLORS.ui.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.ui.cardBorder,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.large,
    minWidth: 300,
    maxWidth: '90%',
    gap: SPACING.md,
  },
  gameOverTitleGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
  },
  gameOverScore: {
    fontSize: 26,
    color: COLORS.ui.text,
    fontWeight: '600',
    marginVertical: SPACING.sm,
  },
  newBestGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
  },
  newBestText: {
    fontSize: 20,
    color: COLORS.ui.text,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent.gold,
    ...SHADOWS.medium,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  continueButtonIcon: {
    fontSize: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.accent.error,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  restartButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.md,
    ...SHADOWS.glow,
  },
  restartButtonGradient: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
  },
  restartButtonText: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
