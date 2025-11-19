/**
 * HUD Component - Display score, best score, and controls
 * Follows Apple HIG and Material Design principles
 * Optimized with React.memo for performance
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useScore, useBestScore, useIsGameOver, useGameStore } from '../../store/gameStore';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { rewardedAdService } from '../../services/ads/RewardedAdService';
import { interstitialAdService } from '../../services/ads/InterstitialAdService';
import { adManager } from '../../services/ads/AdManager';
import { useMonetizationStore } from '../../store/monetizationStore';

export const HUD = memo(function HUD() {
  const score = useScore();
  const bestScore = useBestScore();
  const isGameOver = useIsGameOver();
  const canContinue = useGameStore(state => state.gameState?.canContinue ?? false);
  const restartGameStore = useGameStore(state => state.restartGame);
  const continueGame = useGameStore(state => state.continueGame);
  const isPremium = useMonetizationStore(state => state.isPremium);
  const [loadingContinue, setLoadingContinue] = useState(false);
  
  const restartGame = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    restartGameStore();
    // Show interstitial ad after game ends
    interstitialAdService.incrementGameCount();
    interstitialAdService.show();
  }, [restartGameStore]);

  const handleContinue = useCallback(async () => {
    if (!canContinue || loadingContinue) return;

    try {
      setLoadingContinue(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Premium users don't need to watch ads
      if (isPremium) {
        continueGame();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      // Show rewarded ad
      const { watched, error } = await rewardedAdService.show();

      if (watched) {
        // User watched the ad, grant continue
        continueGame();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Ad not watched or failed
        console.log('Continue cancelled or ad failed:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoadingContinue(false);
    }
  }, [canContinue, continueGame, loadingContinue, isPremium]);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Left section - Restart button */}
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={restartGame}
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

        {/* Right section - Scores */}
        <View style={styles.rightSection}>
          <BlurView intensity={15} tint="dark" style={styles.scoreContainer} accessible={true} accessibilityLabel={`Current score: ${score}`}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </BlurView>
          <BlurView intensity={15} tint="dark" style={[styles.scoreContainer, styles.bestScoreContainer]} accessible={true} accessibilityLabel={`Best score: ${bestScore}`}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.bestScoreValue}>{bestScore.toLocaleString()}</Text>
          </BlurView>
        </View>
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

            {/* Continue Button (with rewarded ad) */}
            {canContinue && adManager.canShowAds() && (
              <TouchableOpacity
                style={[styles.continueButton, loadingContinue && styles.disabledButton]}
                onPress={handleContinue}
                disabled={loadingContinue}
                activeOpacity={0.8}
                accessibilityLabel="Watch ad to continue"
                accessibilityRole="button"
                accessibilityHint="Watch a video ad to get a second chance"
              >
                <LinearGradient
                  colors={[COLORS.accent.success, COLORS.accent.info]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  {loadingContinue ? (
                    <ActivityIndicator color={COLORS.ui.text} />
                  ) : (
                    <>
                      <Text style={styles.continueIcon}>📺</Text>
                      <Text style={styles.continueButtonText}>
                        {isPremium ? 'Continue' : 'Watch Ad to Continue'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Play Again Button */}
            <TouchableOpacity 
              style={styles.restartButton} 
              onPress={restartGame}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: SPACING.lg,
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
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  logoImage: {
    width: 140,
    height: 42,
  },
  button: {
    width: 50,
    height: 50,
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
    fontSize: 28,
    color: COLORS.ui.text,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  bestScoreContainer: {
    marginTop: SPACING.xs,
  },
  scoreLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    ...TYPOGRAPHY.score,
    color: COLORS.primary.cyan,
    textShadowColor: COLORS.primary.cyanGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bestScoreValue: {
    ...TYPOGRAPHY.score,
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
    ...SHADOWS.glow,
    width: '100%',
  },
  continueButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  continueIcon: {
    fontSize: 20,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
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

