/**
 * Main Menu / Index Screen
 * Follows Apple HIG and Material Design principles
 * Integrated with authentication and monetization
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../src/utils/theme';
import { useUser, useGems, useIsPremium } from '../src/store/monetizationStore';
import { AuthModal } from '../src/rendering/components/AuthModal';
import { Shop } from '../src/rendering/components/Shop';
import { CustomizationScreen } from '../src/rendering/screens/CustomizationScreen';
import { AdminDashboard } from '../src/rendering/screens/AdminDashboard';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const gems = useGems();
  const isPremium = useIsPremium();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);

  const handleDebugTap = () => {
    setDebugTapCount(c => {
      const newCount = c + 1;
      if (newCount >= 5) {
        setShowAdmin(true);
        return 0;
      }
      return newCount;
    });
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
        {/* User Profile Header */}
        <View style={styles.headerRow}>
          {user.isAuthenticated ? (
            <View style={styles.userInfo}>
              <Text style={styles.usernameText}>
                {user.username || 'Player'}
                {isPremium && ' 👑'}
              </Text>
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
        <Image 
          source={require('../assets/logo-full.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="Blocktopia"
          accessibilityRole="header"
        />
        <Text style={styles.subtitle}>Block Puzzle Game</Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push('/game')}
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

        {/* Shop Button */}
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
          onPress={handleDebugTap}
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

      {/* Shop Modal */}
      <Shop
        visible={showShop}
        onClose={() => setShowShop(false)}
      />

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
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ui.text,
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
    width: 320,
    height: 100,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 22,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.xxl * 2,
    fontWeight: '500',
  },
  playButton: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
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
  versionText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});

