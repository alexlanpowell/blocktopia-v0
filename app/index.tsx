/**
 * Main Menu / Index Screen
 * Follows Apple HIG and Material Design principles
 * Integrated with authentication and monetization
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../src/utils/theme';
import { useUser, useGems, useIsPremium, useMonetizationStore } from '../src/store/monetizationStore';
import { useGameStore } from '../src/store/gameStore';
import { GamePersistenceService } from '../src/services/game/GamePersistenceService';
import { AuthModal } from '../src/rendering/components/AuthModal';
// DON'T import Shop here - lazy load to prevent PurchaseManager -> RevenueCat eager import crash
import { CustomizationScreen } from '../src/rendering/screens/CustomizationScreen';
import { AdminDashboard } from '../src/rendering/screens/AdminDashboard';
import { WelcomeToast } from '../src/rendering/components/WelcomeToast';
import { HomeBannerAd } from '../src/rendering/components/BannerAd';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const gems = useGems();
  const isPremium = useIsPremium();
  const firstLaunch = useMonetizationStore(state => state.firstLaunch);
  const setFirstLaunch = useMonetizationStore(state => state.setFirstLaunch);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [isCheckingGame, setIsCheckingGame] = useState(true);
  const [ShopComponent, setShopComponent] = useState<any>(null);
  
  const restartGame = useGameStore(state => state.restartGame);
  const loadGameState = useGameStore(state => state.gameState);

  // Check for active game on mount
  useEffect(() => {
    const checkActiveGame = async () => {
      setIsCheckingGame(true);
      try {
        const hasActive = await GamePersistenceService.hasActiveGame();
        setHasActiveGame(hasActive);
      } catch (error) {
        if (__DEV__) {
          console.error('[IndexScreen] Error checking active game:', error);
        }
        setHasActiveGame(false);
      } finally {
        setIsCheckingGame(false);
      }
    };
    
    checkActiveGame();
  }, []);

  // Lazy load Shop component to prevent RevenueCat crash
  useEffect(() => {
    if (showShop && !ShopComponent) {
      import('../src/rendering/components/Shop').then(module => {
        setShopComponent(() => module.Shop);
      }).catch(error => {
        if (__DEV__) {
          console.error('Failed to load Shop component:', error);
        }
      });
    }
  }, [showShop, ShopComponent]);

  // Show welcome toast on first launch
  useEffect(() => {
    if (firstLaunch && user.isAuthenticated && user.username) {
      setShowWelcomeToast(true);
      // Mark as no longer first launch after showing
      setTimeout(() => {
        setFirstLaunch(false);
      }, 100);
    }
  }, [firstLaunch, user.isAuthenticated, user.username]);
  
  const handleContinueGame = async () => {
    try {
      // Load saved game state
      const savedState = await GamePersistenceService.loadGameState();
      if (savedState) {
        const gameState = GamePersistenceService.deserializeGameState(savedState);
        useGameStore.setState({ gameState });
        router.push('/game');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[IndexScreen] Error loading game:', error);
      }
      // Fallback to new game
      handleNewGame();
    }
  };
  
  const handleNewGame = () => {
    restartGame();
    GamePersistenceService.clearSavedGame().catch(() => {});
    router.push('/game');
  };

  // Secret sequence: logo → version → logo → version → subtitle → version
  const SECRET_CODE = ['logo', 'version', 'logo', 'version', 'subtitle', 'version'];

  const handleSecretTap = (location: string) => {
    setSecretSequence(prev => {
      const newSeq = [...prev, location].slice(-5); // Keep last 5 taps
      
      if (__DEV__) {
        console.log(`🔐 Secret sequence: [${newSeq.join(' → ')}]`);
      }
      
      // Check if tap sequence matches - unlock immediately
      if (JSON.stringify(newSeq) === JSON.stringify(SECRET_CODE)) {
        if (__DEV__) {
          console.log('🔓 Admin dashboard unlocked! Full sequence completed.');
        }
        setShowAdmin(true);
        return [];
      }
      
      return newSeq;
    });
  };

  const handleVersionTap = () => {
    handleSecretTap('version');
  };

  const handleLogoTap = () => {
    handleSecretTap('logo');
  };

  const handleSubtitleTap = () => {
    handleSecretTap('subtitle');
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2, COLORS.background.dark3]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />
      
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 20) }]}>
        {/* Welcome Toast */}
        {user.isAuthenticated && user.username && (
          <WelcomeToast
            username={user.username}
            visible={showWelcomeToast}
            onDismiss={() => setShowWelcomeToast(false)}
          />
        )}

        {/* User Profile Header - Always show username if authenticated */}
        <View style={styles.headerRow}>
          {user.isAuthenticated ? (
            <View style={styles.userInfo}>
              <View style={styles.usernameContainer}>
                <Text style={styles.usernameLabel}>
                  {user.isAnonymous ? '👤 Guest' : '👤'}
                </Text>
                <Text style={styles.usernameText}>
                  {user.username || 'Player'}
                </Text>
                {isPremium && <Text style={styles.premiumIcon}>👑</Text>}
              </View>
              <View style={styles.gemsContainer}>
                <Text style={styles.gemIcon}>💎</Text>
                <Text style={styles.gemsText}>{gems}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logo Image */}
        <TouchableOpacity 
          onPress={handleLogoTap}
          activeOpacity={1}
        >
          <Image 
            source={require('../assets/logo-full.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Blocktopia"
            accessibilityRole="header"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSubtitleTap}
          activeOpacity={1}
        >
          <Text style={styles.subtitle}>Block Puzzle Game</Text>
        </TouchableOpacity>

        {/* Play/Continue Buttons */}
        {isCheckingGame ? (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Loading...</Text>
          </View>
        ) : hasActiveGame ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.playButton, styles.continueButton]}
              onPress={handleContinueGame}
              activeOpacity={0.7}
              accessibilityLabel="Continue your saved game"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[COLORS.accent.success, COLORS.primary.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playButtonGradient}
              >
                <Text style={styles.playButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playButton, styles.newGameButton]}
              onPress={handleNewGame}
              activeOpacity={0.7}
              accessibilityLabel="Start a new game"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[COLORS.ui.cardBackground, COLORS.ui.cardBackground]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playButtonGradient}
              >
                <Text style={[styles.playButtonText, styles.newGameButtonText]}>New Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleNewGame}
            activeOpacity={0.7}
            accessibilityLabel="Start playing Blocktopia"
            accessibilityRole="button"
            accessibilityHint="Navigates to the game screen"
          >
            <LinearGradient
              colors={[COLORS.primary.cyan, COLORS.primary.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playButtonGradient}
            >
              <Text style={styles.playButtonText}>Play</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowShop(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open gem shop"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[COLORS.accent.gold, COLORS.accent.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.secondaryButtonGradient}
            >
              <Text style={styles.secondaryButtonText}>💎 Shop</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowCustomization(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open customization"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[COLORS.primary.purple, COLORS.primary.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.secondaryButtonGradient}
            >
              <Text style={styles.secondaryButtonText}>🎨 Style</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
          accessibilityLabel="Open settings"
          accessibilityRole="button"
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionText} accessibilityRole="header">
            How to Play:
          </Text>
          <Text style={styles.instructionDetail}>
            • Drag pieces from bottom to grid
          </Text>
          <Text style={styles.instructionDetail}>
            • Fill rows or columns to clear them
          </Text>
          <Text style={styles.instructionDetail}>
            • Game ends when no pieces fit
          </Text>
        </View>
        {/* Version Info / Debug Trigger */}
        <TouchableOpacity 
          onPress={handleVersionTap}
          activeOpacity={1}
          style={{ padding: 20, marginTop: 20 }}
        >
          <Text style={styles.versionText}>v1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          console.log('Sign-in successful');
        }}
        allowAnonymous={true}
      />

      {/* Shop Modal - Lazy loaded to prevent RevenueCat crash */}
      {ShopComponent && (
        <ShopComponent
        visible={showShop}
        onClose={() => setShowShop(false)}
      />
      )}

      {/* Customization Modal */}
      <CustomizationScreen
        visible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        visible={showAdmin}
        onClose={() => setShowAdmin(false)}
      />

      {/* Home Screen Banner Ad */}
      <HomeBannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    maxWidth: 500,
    width: '100%',
  },
  headerRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
  },
  userInfo: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.medium,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  usernameLabel: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    letterSpacing: 0.3,
  },
  premiumIcon: {
    fontSize: 18,
    marginLeft: SPACING.xs,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  gemIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  gemsText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.cyan,
  },
  signInButton: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary.cyan,
  },
  logoImage: {
    width: 403,
    height: 126,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 22,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.xxl * 2,
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  playButton: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  continueButton: {
    marginBottom: 0,
  },
  newGameButton: {
    marginBottom: 0,
    borderWidth: 2,
    borderColor: COLORS.ui.cardBorder,
  },
  newGameButtonText: {
    color: COLORS.ui.text,
  },
  playButtonGradient: {
    paddingHorizontal: SPACING.xxl * 2,
    paddingVertical: SPACING.lg + SPACING.xs,
    minWidth: 220,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  secondaryButtonGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    letterSpacing: 0.5,
  },
  instructions: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    ...SHADOWS.medium,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  instructionDetail: {
    fontSize: 16,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.medium,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ui.text,
    letterSpacing: 0.5,
  },
  versionText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});

