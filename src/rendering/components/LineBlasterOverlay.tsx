/**
 * Line Blaster Overlay - Interactive grid for selecting rows/columns
 * Activated when Line Blaster power-up is used
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGameStore, usePowerUpState } from '../../store/gameStore';
import { PowerUpType } from '../../store/monetizationStore';
import { BOARD_DIMENSIONS } from './GameBoard';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = BOARD_DIMENSIONS.cellSize;
const BOARD_WIDTH = BOARD_DIMENSIONS.width;

interface LineBlasterOverlayProps {
  boardOffsetX: number;
  boardOffsetY: number;
}

export function LineBlasterOverlay({ boardOffsetX, boardOffsetY }: LineBlasterOverlayProps) {
  const powerUpState = usePowerUpState();
  const selectLineForBlaster = useGameStore(state => state.selectLineForBlaster);
  const cancelPowerUp = useGameStore(state => state.cancelPowerUp);

  const handleRowPress = useCallback(async (rowIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await selectLineForBlaster(true, rowIndex);
  }, [selectLineForBlaster]);

  const handleColumnPress = useCallback(async (colIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await selectLineForBlaster(false, colIndex);
  }, [selectLineForBlaster]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancelPowerUp();
  }, [cancelPowerUp]);

  // Only show when Line Blaster is active
  if (powerUpState.activeType !== PowerUpType.LINE_BLASTER || !powerUpState.awaitingLineSelection) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Dimmed Background */}
      <View style={styles.backdrop} />

      {/* Board Overlay with Row/Column Selectors */}
      <View
        style={[
          styles.boardOverlay,
          {
            left: boardOffsetX,
            top: boardOffsetY,
            width: BOARD_WIDTH,
            height: BOARD_WIDTH,
          },
        ]}
      >
        {/* Row Selectors (Left Side) */}
        <View style={styles.rowSelectorsContainer}>
          {Array.from({ length: BOARD_SIZE }).map((_, index) => (
            <TouchableOpacity
              key={`row-${index}`}
              style={[styles.rowSelector, { height: CELL_SIZE }]}
              onPress={() => handleRowPress(index)}
              activeOpacity={0.7}
              accessibilityLabel={`Clear row ${index + 1}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[COLORS.accent.error + '90', COLORS.accent.warning + '90']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.selectorGradient}
              >
                <Text style={styles.selectorText}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Column Selectors (Top Side) */}
        <View style={styles.colSelectorsContainer}>
          {Array.from({ length: BOARD_SIZE }).map((_, index) => (
            <TouchableOpacity
              key={`col-${index}`}
              style={[styles.colSelector, { width: CELL_SIZE }]}
              onPress={() => handleColumnPress(index)}
              activeOpacity={0.7}
              accessibilityLabel={`Clear column ${index + 1}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[COLORS.accent.error + '90', COLORS.accent.warning + '90']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.selectorGradient}
              >
                <Text style={styles.selectorText}>↓</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Board Border Highlight */}
        <View style={styles.boardHighlight} />
      </View>

      {/* Cancel Button */}
      <View style={styles.cancelButtonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
          accessibilityLabel="Cancel Line Blaster"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[COLORS.ui.cardBackground, COLORS.ui.cardBorder]}
            style={styles.cancelButtonGradient}
          >
            <Text style={styles.cancelButtonText}>✕ Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          💥 Tap a row (→) or column (↓) to blast it!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background.dark1 + 'CC',
  },
  boardOverlay: {
    position: 'absolute',
  },
  boardHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: COLORS.accent.error,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.glow,
  },
  rowSelectorsContainer: {
    position: 'absolute',
    left: -52,
    top: 0,
    gap: 0,
  },
  rowSelector: {
    width: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: 1,
    ...SHADOWS.medium,
  },
  colSelectorsContainer: {
    position: 'absolute',
    top: -52,
    left: 0,
    flexDirection: 'row',
    gap: 0,
  },
  colSelector: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: 1,
    ...SHADOWS.medium,
  },
  selectorGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent.error,
  },
  selectorText: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  instructionContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.accent.error,
    textAlign: 'center',
    textShadowColor: COLORS.background.dark1,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cancelButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  cancelButtonGradient: {
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
});

