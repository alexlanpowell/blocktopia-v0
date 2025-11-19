/**
 * Main Game Screen - Integrates all components
 * Follows Apple HIG and Material Design principles
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GameBoard, BOARD_DIMENSIONS } from '../src/rendering/components/GameBoard';
import { PiecePreview } from '../src/rendering/components/PiecePreview';
import { HUD } from '../src/rendering/components/HUD';
import { PowerUpBar } from '../src/rendering/components/PowerUpBar';
import { LineBlasterOverlay } from '../src/rendering/components/LineBlasterOverlay';
import { useGestures } from '../src/rendering/hooks/useGestures';
import { COLORS } from '../src/utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  // Calculate layout positions with safe areas
  const BOARD_OFFSET_X = (SCREEN_WIDTH - BOARD_DIMENSIONS.width) / 2;
  const BOARD_OFFSET_Y = Math.max(200, insets.top + 130); // Moved down for better spacing
  const PIECE_PREVIEW_HEIGHT = 150;
  const PIECE_PREVIEW_Y = SCREEN_HEIGHT - PIECE_PREVIEW_HEIGHT - insets.bottom;

  const onPiecePlaced = useCallback(() => {
    // Trigger success haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const { panGesture } = useGestures({
    boardOffsetX: BOARD_OFFSET_X,
    boardOffsetY: BOARD_OFFSET_Y,
    piecePreviewY: PIECE_PREVIEW_Y,
    onPiecePlaced,
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2, COLORS.background.dark3]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={styles.gameContainer}>
        {/* HUD (Score, Restart, Game Over) */}
        <HUD />

        {/* Power-Up Bar */}
        <PowerUpBar />

        {/* Game Board */}
        <View 
          style={[styles.boardContainer, { top: BOARD_OFFSET_Y, left: BOARD_OFFSET_X }]}
          accessible={false}
        >
          <GameBoard />
        </View>

        {/* Piece Preview at bottom */}
        <View 
          style={[styles.piecePreviewContainer, { bottom: insets.bottom }]}
          accessible={false}
        >
          <PiecePreview />
        </View>

        {/* Transparent gesture overlay for pieces */}
        <GestureDetector gesture={panGesture}>
          <View 
            style={[styles.gestureOverlay, { bottom: insets.bottom }]}
            accessible={false}
          />
        </GestureDetector>

        {/* Line Blaster Overlay (shown when active) */}
        <LineBlasterOverlay
          boardOffsetX={BOARD_OFFSET_X}
          boardOffsetY={BOARD_OFFSET_Y}
        />
      </View>
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
  gameContainer: {
    flex: 1,
  },
  boardContainer: {
    position: 'absolute',
  },
  piecePreviewContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  gestureOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 150, // Match PIECE_PREVIEW_HEIGHT
    backgroundColor: 'transparent',
  },
});

