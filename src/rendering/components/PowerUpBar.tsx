/**
 * Power-Up Bar Component - In-game power-up display and activation
 * Shows all available power-ups with quantities and allows activation
 * Follows Apple HIG and Material Design principles
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePowerUps } from '../../store/monetizationStore';
import { PowerUpType } from '../../store/monetizationStore';
import { useGameStore, usePowerUpState } from '../../store/gameStore';
import { POWER_UPS } from '../../services/powerups/PowerUpService';
import { powerUpGameIntegration } from '../../services/powerups/PowerUpGameIntegration';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../../utils/theme';

export function PowerUpBar() {
  const powerUps = usePowerUps();
  const powerUpState = usePowerUpState();
  const gameState = useGameStore(state => state.gameState);
  const usePowerUp = useGameStore(state => state.usePowerUp);
  const [activating, setActivating] = useState<PowerUpType | null>(null);

  const handlePowerUpPress = useCallback(async (type: PowerUpType) => {
    if (activating || !gameState) return;

    // Check if can use
    const canUseCheck = powerUpGameIntegration.canUsePowerUp(type, gameState);
    if (!canUseCheck.canUse) {
      Alert.alert('Cannot Use Power-Up', canUseCheck.reason || 'This power-up cannot be used right now');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setActivating(type);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const AudioManager = (await import('../../services/audio/AudioManager')).default;
      const { SoundEffect } = await import('../../services/audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);

      const result = await usePowerUp(type);

      if (result.success) {
        if (result.message) {
          // Show success message for non-interactive power-ups
          if (type !== PowerUpType.LINE_BLASTER) {
            Alert.alert('Success!', result.message);
          }
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to use power-up');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Power-up activation error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActivating(null);
    }
  }, [activating, gameState, usePowerUp]);

  // Get all power-up types
  const powerUpTypes = Object.values(PowerUpType);

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <View style={styles.powerUpGrid}>
          {powerUpTypes.map((type) => {
            const definition = POWER_UPS[type];
            const quantity = powerUps[type];
            const isActive = powerUpState.activeType === type;
            const isActivating = activating === type;
            const isDisabled = quantity === 0 || isActivating;

            return (
              <PowerUpButton
                key={type}
                type={type}
                definition={definition}
                quantity={quantity}
                isActive={isActive}
                isDisabled={isDisabled}
                onPress={() => handlePowerUpPress(type)}
              />
            );
          })}
        </View>
      </BlurView>

      {/* Line Blaster Instruction */}
      {powerUpState.awaitingLineSelection && (
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>
            Tap a row or column to clear it
          </Text>
        </View>
      )}
    </View>
  );
}

interface PowerUpButtonProps {
  type: PowerUpType;
  definition: typeof POWER_UPS[PowerUpType];
  quantity: number;
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

function PowerUpButton({
  definition,
  quantity,
  isActive,
  isDisabled,
  onPress,
}: PowerUpButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.powerUpButton,
        isActive && styles.activePowerUpButton,
        isDisabled && styles.disabledPowerUpButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityLabel={`${definition.name}: ${quantity} available`}
      accessibilityRole="button"
      accessibilityHint={definition.description}
    >
      <LinearGradient
        colors={
          isActive
            ? [definition.color, COLORS.primary.cyan]
            : isDisabled
            ? [COLORS.ui.cardBackground, COLORS.ui.cardBackground]
            : [`${definition.color}30`, `${definition.color}10`]
        }
        style={styles.powerUpGradient}
      >
        <Text style={[styles.powerUpIcon, isDisabled && styles.disabledIcon]}>
          {definition.icon}
        </Text>
        
        {/* Quantity Badge */}
        <View style={[styles.quantityBadge, quantity === 0 && styles.emptyBadge]}>
          <Text style={[styles.quantityText, quantity === 0 && styles.emptyQuantityText]}>
            {quantity}
          </Text>
        </View>

        {/* Active Indicator */}
        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Adjusted for new HUD height: TopBar + ScoreRow
    // Position PowerUpBar just below HUD with small gap
    top: Platform.OS === 'ios' ? 164 : 156,
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: SPACING.md,
  },
  blurContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.ui.cardBackground + '80',
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    ...SHADOWS.medium,
  },
  powerUpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xs,
  },
  powerUpButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 72,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  activePowerUpButton: {
    ...SHADOWS.glow,
  },
  disabledPowerUpButton: {
    opacity: 0.5,
  },
  powerUpGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
  },
  powerUpIcon: {
    fontSize: 28,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary.cyan,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  emptyBadge: {
    backgroundColor: COLORS.ui.cardBorder,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  emptyQuantityText: {
    color: COLORS.ui.textSecondary,
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    backgroundColor: COLORS.accent.success,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  activeText: {
    fontSize: 8,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instruction: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.accent.info + '20',
    borderWidth: 1,
    borderColor: COLORS.accent.info,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.accent.info,
    textAlign: 'center',
  },
});

