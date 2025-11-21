/**
 * Settings Screen
 * Comprehensive account management and app settings
 * Follows Apple HIG and Material Design principles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/auth/AuthService';
import { useUser, useGems, useIsPremium } from '../../store/monetizationStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../utils/theme';
import { AudioControls } from '../components/AudioControls';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const user = useUser();
  const gems = useGems();
  const isPremium = useIsPremium();
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (visible) {
      checkAnonymousStatus();
    }
  }, [visible]);

  const checkAnonymousStatus = async () => {
    const anonymous = await authService.isAnonymousUser();
    setIsAnonymous(anonymous);
  };

  if (!visible) return null;

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await authService.signOut();
            setLoading(false);
            onClose();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Double confirmation for account deletion
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete all your data. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    const result = await authService.deleteAccount();
                    setLoading(false);

                    if (result.success) {
                      Alert.alert('Account Deleted', 'Your account has been deleted.');
                      onClose();
                    } else {
                      Alert.alert('Error', result.error || 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleUpgradeAccount = () => {
    Alert.prompt(
      'Upgrade Account',
      'Enter your email to upgrade your guest account to a permanent account:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async (email?: string) => {
            if (!email || !email.includes('@')) {
              Alert.alert('Invalid Email', 'Please enter a valid email address.');
              return;
            }

            Alert.prompt(
              'Set Password',
              'Create a password for your account (minimum 6 characters):',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Upgrade',
                  onPress: async (password?: string) => {
                    if (!password || password.length < 6) {
                      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
                      return;
                    }

                    setLoading(true);
                    const result = await authService.upgradeAnonymousAccount(email, password);
                    setLoading(false);

                    if (result.success) {
                      setIsAnonymous(false);
                    } else {
                      Alert.alert('Error', result.error || 'Failed to upgrade account');
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ],
      'plain-text'
    );
  };

  const openPrivacyPolicy = () => {
    onClose();
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      require('expo-router').router.push('/privacy');
    }, 100);
  };

  const openTermsOfService = () => {
    onClose();
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      require('expo-router').router.push('/terms');
    }, 100);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.background.dark1, COLORS.background.dark2]}
          style={styles.gradient}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* User Info Card */}
            {user.isAuthenticated && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Account</Text>
                  {isPremium && <Text style={styles.premiumBadge}>👑 Premium</Text>}
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Username</Text>
                  <Text style={styles.value}>{user.username || 'Guest'}</Text>
                </View>

                {user.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Gems</Text>
                  <View style={styles.gemsContainer}>
                    <Text style={styles.gemIcon}>💎</Text>
                    <Text style={styles.value}>{gems}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Account Type</Text>
                  <Text style={styles.value}>{isAnonymous ? 'Guest' : 'Full Account'}</Text>
                </View>
              </View>
            )}

            {/* Upgrade Account (for anonymous users) */}
            {isAnonymous && (
              <View>
                <TouchableOpacity
                  style={styles.upgradeCard}
                  onPress={handleUpgradeAccount}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.primary.purple, COLORS.primary.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.upgradeGradient}
                  >
                    <Text style={styles.upgradeTitle}>🎉 Upgrade to Full Account</Text>
                    <Text style={styles.upgradeSubtitle}>
                      Save your progress permanently with Email
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Account Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              {user.isAuthenticated && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSignOut}
                  disabled={loading}
                >
                  <Text style={styles.menuItemIcon}>🚪</Text>
                  <Text style={styles.menuItemText}>Sign Out</Text>
                  <Text style={styles.menuItemChevron}>›</Text>
                </TouchableOpacity>
              )}

              {user.isAuthenticated && (
                <TouchableOpacity
                  style={[styles.menuItem, styles.dangerItem]}
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text style={[styles.menuItemText, styles.dangerText]}>Delete Account</Text>
                  <Text style={styles.menuItemChevron}>›</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Audio Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Audio Settings</Text>
              <AudioControls />
            </View>

            {/* Legal & Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Legal & Information</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={openPrivacyPolicy}>
                <Text style={styles.menuItemIcon}>🔒</Text>
                <Text style={styles.menuItemText}>Privacy Policy</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={openTermsOfService}>
                <Text style={styles.menuItemIcon}>📄</Text>
                <Text style={styles.menuItemText}>Terms of Service</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.menuItem}>
                <Text style={styles.menuItemIcon}>ℹ️</Text>
                <Text style={styles.menuItemText}>Version</Text>
                <Text style={styles.versionText}>1.0.0</Text>
              </View>
            </View>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary.cyan} />
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ui.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.ui.text,
    lineHeight: 24,
  },
  card: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ui.text,
  },
  premiumBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.gold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  label: {
    fontSize: 15,
    color: COLORS.ui.textSecondary,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ui.text,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  gemIcon: {
    fontSize: 16,
  },
  upgradeCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.glow,
  },
  upgradeGradient: {
    padding: SPACING.lg,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ui.text,
    marginBottom: SPACING.xs,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ui.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.ui.text,
  },
  menuItemChevron: {
    fontSize: 24,
    color: COLORS.ui.textSecondary,
    opacity: 0.5,
  },
  dangerItem: {
    borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  dangerText: {
    color: COLORS.accent.error,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

