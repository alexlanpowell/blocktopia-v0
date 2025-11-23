/**
 * User Tab - User data viewer and monetization testing tools
 * Shows user profile, currency, power-ups, cosmetics, and provides testing actions
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { StatCard } from '../../components/admin/StatCard';
import { ActionButton } from '../../components/admin/ActionButton';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../utils/theme';
import { useMonetizationStore, PowerUpType } from '../../../store/monetizationStore';

export function UserTab() {
  const user = useMonetizationStore(state => state.user);
  const gems = useMonetizationStore(state => state.gems);
  const isPremium = useMonetizationStore(state => state.isPremium);
  const premiumExpiresAt = useMonetizationStore(state => state.premiumExpiresAt);
  const powerUps = useMonetizationStore(state => state.powerUps);
  const ownedCosmetics = useMonetizationStore(state => state.ownedCosmetics);
  const activeCosmetics = useMonetizationStore(state => state.activeCosmetics);

  const addGems = useMonetizationStore(state => state.addGems);
  const spendGems = useMonetizationStore(state => state.spendGems);
  const setPremium = useMonetizationStore(state => state.setPremium);
  const addPowerUp = useMonetizationStore(state => state.addPowerUp);
  const reset = useMonetizationStore(state => state.reset);
  const syncWithBackend = useMonetizationStore(state => state.syncWithBackend);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [gemAmount, setGemAmount] = useState('100');

  const handleGrantGems = async (amount: number) => {
    try {
      addGems(amount);
      await syncWithBackend();
      console.log(`✅ Granted ${amount} gems and synced to database`);
    } catch (error) {
      console.error('❌ Failed to sync gems to database:', error);
    }
  };

  const handleGrantPowerUp = async (type: PowerUpType, quantity: number = 1) => {
    try {
      addPowerUp(type, quantity);
      await syncWithBackend();
      console.log(`✅ Granted ${quantity}x ${type} and synced to database`);
    } catch (error) {
      console.error('❌ Failed to sync power-up to database:', error);
    }
  };

  const handleTogglePremium = async () => {
    try {
      setPremium(!isPremium);
      await syncWithBackend();
      console.log(`✅ Premium status ${!isPremium ? 'enabled' : 'disabled'} and synced to database`);
    } catch (error) {
      console.error('❌ Failed to sync premium status to database:', error);
    }
  };

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
  };

  // Defensive check: if user data hasn't loaded yet, show loading state
  if (!user.userId) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading user data...</Text>
          <Text style={styles.loadingText}>Please wait while we fetch your profile.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="User ID"
            value={user?.userId || 'N/A'}
            subtitle={user?.userId ? user.userId.substring(0, 8) + '...' : ''}
          />
          <StatCard label="Username" value={user?.username || 'Guest'} icon="👤" />
          <StatCard
            label="Auth Method"
            value={user?.isAnonymous ? 'Anonymous' : 'Authenticated'}
          />
          <StatCard
            label="Email"
            value={user?.email || 'N/A'}
            subtitle={user?.email ? user.email.substring(0, 20) + '...' : ''}
          />
        </View>
      </View>

      {/* Currency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Gems" value={gems} icon="💎" color={COLORS.accent.gold} />
        </View>
        <View style={styles.actionsGrid}>
          <ActionButton
            label="+100"
            onPress={() => handleGrantGems(100)}
            variant="success"
            small
          />
          <ActionButton
            label="+500"
            onPress={() => handleGrantGems(500)}
            variant="success"
            small
          />
          <ActionButton
            label="+1000"
            onPress={() => handleGrantGems(1000)}
            variant="success"
            small
          />
          <ActionButton
            label="+5000"
            onPress={() => handleGrantGems(5000)}
            variant="success"
            small
          />
        </View>
      </View>

      {/* Premium Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Status</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Premium"
            value={isPremium ? 'Active' : 'Inactive'}
            color={isPremium ? COLORS.accent.success : COLORS.ui.textSecondary}
          />
          {premiumExpiresAt && (
            <StatCard
              label="Expires"
              value={new Date(premiumExpiresAt).toLocaleDateString()}
            />
          )}
        </View>
        <View style={styles.actionsGrid}>
          <ActionButton
            label={isPremium ? 'Disable Premium' : 'Enable Premium'}
            onPress={handleTogglePremium}
            variant={isPremium ? 'warning' : 'success'}
            small
          />
        </View>
      </View>

      {/* Power-Ups Inventory */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Power-Ups Inventory</Text>
        <View style={styles.powerUpList}>
          {Object.entries(powerUps).map(([type, quantity]) => (
            <View key={type} style={styles.powerUpRow}>
              <View style={styles.powerUpInfo}>
                <Text style={styles.powerUpLabel}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.powerUpQuantity}>x{quantity}</Text>
              </View>
              <View style={styles.powerUpActions}>
                <ActionButton
                  label="+1"
                  onPress={() => handleGrantPowerUp(type as PowerUpType, 1)}
                  variant="success"
                  small
                />
                <ActionButton
                  label="+10"
                  onPress={() => handleGrantPowerUp(type as PowerUpType, 10)}
                  variant="success"
                  small
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Cosmetics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cosmetics</Text>
        <StatCard
          label="Owned Cosmetics"
          value={ownedCosmetics.length}
          subtitle={`${ownedCosmetics.length} items unlocked`}
        />
        {activeCosmetics && (
          <View style={styles.cosmeticsInfo}>
            <Text style={styles.cosmeticLabel}>
              Block Skin: {activeCosmetics.block_skin || 'Default'}
            </Text>
            <Text style={styles.cosmeticLabel}>
              Board Theme: {activeCosmetics.board_theme || 'Default'}
            </Text>
          </View>
        )}
      </View>

      {/* Testing Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            label="Reset Monetization State"
            icon="🔄"
            onPress={() => setShowResetDialog(true)}
            variant="danger"
            small
          />
        </View>
      </View>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showResetDialog}
        title="Reset Monetization State"
        message="This will reset all monetization data (gems, power-ups, premium status). This cannot be undone. Continue?"
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
        variant="danger"
        confirmLabel="Reset"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  powerUpList: {
    gap: SPACING.sm,
  },
  powerUpRow: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  powerUpInfo: {
    flex: 1,
  },
  powerUpLabel: {
    color: COLORS.ui.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  powerUpQuantity: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
  },
  powerUpActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  cosmeticsInfo: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  cosmeticLabel: {
    color: COLORS.ui.text,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    marginTop: SPACING.sm,
  },
});

