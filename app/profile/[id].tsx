/**
 * Profile View Screen
 * View user profiles with stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { getSupabase, supabaseManager } from '../../src/services/backend/SupabaseClient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/utils/theme';

interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  gems: number;
  premium_status: boolean;
  created_at: string;
}

export default function ProfileViewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    best_score: number;
    total_games: number;
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) {
      router.back();
      return;
    }

    try {
      const supabase = getSupabase();

      // Load profile
      const { data: profileData, error: profileError } = await supabaseManager
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load game stats
      const { data: statsData } = await supabase
        .from('game_stats')
        .select('best_score, total_games_played')
        .eq('user_id', id)
        .single();

      if (statsData) {
        setStats({
          best_score: statsData.best_score || 0,
          total_games: statsData.total_games_played || 0,
        });
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.background.dark1, COLORS.background.dark2]}
          style={styles.gradient}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.cyan} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.background.dark1, COLORS.background.dark2]}
          style={styles.gradient}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2, COLORS.background.dark3]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 20) },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar and Username */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {profile.premium_status && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>👑</Text>
              </View>
            )}
          </View>

          <Text style={styles.username}>
            {profile.username || 'Anonymous'}
          </Text>

          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.best_score || 0}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total_games || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.gems || 0}</Text>
            <Text style={styles.statLabel}>Gems</Text>
          </View>
        </View>

        {/* Member Since */}
        <View style={styles.memberSince}>
          <Text style={styles.memberSinceText}>
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.ui.text,
    fontSize: 16,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.ui.text,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary.cyan,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary.cyan,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.ui.text,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent.gold,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.dark1,
  },
  premiumBadgeText: {
    fontSize: 20,
  },
  username: {
    ...TYPOGRAPHY.title,
    color: COLORS.ui.text,
    marginBottom: SPACING.sm,
  },
  bio: {
    ...TYPOGRAPHY.body,
    color: COLORS.ui.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statValue: {
    ...TYPOGRAPHY.score,
    color: COLORS.primary.cyan,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.ui.textSecondary,
    textTransform: 'uppercase',
  },
  memberSince: {
    alignItems: 'center',
  },
  memberSinceText: {
    ...TYPOGRAPHY.body,
    color: COLORS.ui.textSecondary,
  },
});

