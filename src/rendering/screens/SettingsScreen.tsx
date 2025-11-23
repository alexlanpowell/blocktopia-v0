/**
 * Settings Screen
 * Comprehensive account management and app settings
 * Follows Apple HIG and Material Design principles
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import { createClient } from '@supabase/supabase-js';
import { TextInput } from 'react-native';
import Constants from 'expo-constants';

// Lazy load Turntopia Sign-In Modal
const TurntopiaSignInModal = lazy(() => import('../components/TurntopiaSignInModal').then(m => ({ default: m.TurntopiaSignInModal })));

// Unmap's Supabase credentials (from app.config.js extra)
const UNMAP_SUPABASE_URL = Constants.expoConfig?.extra?.UNMAP_SUPABASE_URL || '';
const UNMAP_SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.UNMAP_SUPABASE_ANON_KEY || '';

// Lazy initialization - only create client when credentials are available
let unmapSupabase: any = null;
const getUnmapSupabase = () => {
  if (!UNMAP_SUPABASE_URL || !UNMAP_SUPABASE_ANON_KEY) {
    if (__DEV__) {
      console.warn('[SettingsScreen] Unmap Supabase credentials not configured');
    }
    return null;
  }
  if (!unmapSupabase) {
    unmapSupabase = createClient(UNMAP_SUPABASE_URL, UNMAP_SUPABASE_ANON_KEY);
  }
  return unmapSupabase;
};

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const user = useUser();
  const gems = useGems();
  const isPremium = useIsPremium();
  const [loading, setLoading] = useState(false);
  const [showTurntopiaSignIn, setShowTurntopiaSignIn] = useState(false);
  
  // Turntopia Profile Sync State
  const [displayName, setDisplayName] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [tTokenBalance, setTTokenBalance] = useState<number | null>(null);
  const [isLinkedAccount, setIsLinkedAccount] = useState(false);

  // Load Turntopia profile data on mount
  useEffect(() => {
    loadTurntopiaProfile();
  }, [user.isAuthenticated, user.isAnonymous]);

  const loadTurntopiaProfile = async () => {
    if (user.isAnonymous || !user.isAuthenticated) {
      setIsLinkedAccount(false);
      return;
    }

    const client = getUnmapSupabase();
    if (!client) {
      // Unmap not configured - skip profile loading
      return;
    }

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      // Fetch profile and wallet from Unmap
      const response = await fetch(
        `${UNMAP_SUPABASE_URL}/functions/v1/get-ecosystem-profile`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setIsLinkedAccount(true);
        setDisplayName(result.data.profile?.display_name || '');
        setTTokenBalance(result.data.wallet?.t_tokens || 0);
      }
    } catch (error) {
      console.error('Failed to load Turntopia profile:', error);
    }
  };

  const syncProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a display name');
      return;
    }

    const client = getUnmapSupabase();
    if (!client) {
      Alert.alert('Error', 'Unmap Supabase not configured. Please check your app configuration.');
      return;
    }

    setSyncing(true);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${UNMAP_SUPABASE_URL}/functions/v1/sync-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            displayName,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert('✅ Profile Synced', 'Your profile has been updated across all Turntopia apps!');
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message || 'Failed to sync profile. Please try again.');
    } finally {
      setSyncing(false);
    }
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
    // Open Turntopia Sign-In Modal
    setShowTurntopiaSignIn(true);
  };

  const handleTurntopiaSignInComplete = async (userId: string, tTokens: number) => {
    if (__DEV__) {
      console.log(`[SettingsScreen] Turntopia account linked! User: ${userId}, T Tokens: ${tTokens}`);
    }
    
    // Show success notification
    Alert.alert(
      '🎉 Account Linked!',
      `${gems} Diamonds have been converted to ${tTokens} T Tokens.\n\nYou can now use T Tokens across all Turntopia apps!`,
      [{ text: 'OK', onPress: () => loadTurntopiaProfile() }]
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
                  <Text style={styles.value}>{user.isAnonymous ? 'Guest' : 'Full Account'}</Text>
                </View>
              </View>
            )}

            {/* Turntopia Profile (for linked accounts) */}
            {isLinkedAccount && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🌐 Turntopia Profile</Text>
                </View>

                <Text style={styles.turntopiaDescription}>
                  Your profile is synced across all Turntopia apps (Unmap, Blocktopia, and more)
                </Text>

                {/* T Tokens Balance */}
                <View style={[styles.infoRow, styles.tTokensRow]}>
                  <Text style={styles.label}>T Tokens</Text>
                  <View style={styles.gemsContainer}>
                    <Text style={styles.gemIcon}>💰</Text>
                    <Text style={styles.value}>{tTokenBalance ?? '...'}</Text>
                  </View>
                </View>

                {/* Display Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    maxLength={30}
                  />
                </View>

                {/* Sync Button */}
                <TouchableOpacity
                  style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
                  onPress={syncProfile}
                  disabled={syncing || !displayName.trim()}
                >
                  {syncing ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.syncButtonIcon}>🔄</Text>
                      <Text style={styles.syncButtonText}>Sync Across All Apps</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.hint}>
                  Changes will appear in Unmap and other connected apps
                </Text>
              </View>
            )}

            {/* Upgrade Account (for anonymous users) */}
            {user.isAnonymous && (
              <View>
                <TouchableOpacity
                  style={styles.upgradeCard}
                  onPress={handleUpgradeAccount}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.accent.gold, COLORS.accent.warning, COLORS.primary.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.upgradeGradient}
                  >
                    <Text style={styles.upgradeEmoji}>🎁</Text>
                    <View style={styles.upgradeTextContainer}>
                      <Text style={styles.upgradeTitle}>Upgrade to Full Account</Text>
                      <Text style={styles.upgradeSubtitle}>
                        Save your progress permanently with Email
                      </Text>
                    </View>
                    <Text style={styles.upgradeArrow}>›</Text>
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

      {/* Turntopia Sign-In Modal */}
      <Suspense fallback={null}>
        <TurntopiaSignInModal
          visible={showTurntopiaSignIn}
          onClose={() => setShowTurntopiaSignIn(false)}
          onComplete={handleTurntopiaSignInComplete}
          currentDiamonds={gems}
          gameStats={{
            highScore: 0, // TODO: Get from HighScoreService
            totalGamesPlayed: 0, // TODO: Track in game store
            totalLinesCleared: 0, // TODO: Track in game store
          }}
        />
      </Suspense>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.md + 4,
  },
  upgradeEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  upgradeArrow: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
    marginLeft: SPACING.xs,
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
  // Turntopia Profile Styles
  turntopiaDescription: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  tTokensRow: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ui.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.ui.text,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.cyan,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  hint: {
    fontSize: 12,
    color: COLORS.ui.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

