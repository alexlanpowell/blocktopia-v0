/**
 * Main Game Screen - Integrates all components
 * Follows Apple HIG and Material Design principles
 */

import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GameBoard, BOARD_DIMENSIONS } from '../src/rendering/components/GameBoard';
import { PiecePreview } from '../src/rendering/components/PiecePreview';
import { HUD } from '../src/rendering/components/HUD';
import { PowerUpBar } from '../src/rendering/components/PowerUpBar';
import { LineBlasterOverlay } from '../src/rendering/components/LineBlasterOverlay';
import { DragPreview } from '../src/rendering/components/DragPreview';
import { GameBannerAd } from '../src/rendering/components/BannerAd';
import { useGestures } from '../src/rendering/hooks/useGestures';
import { COLORS } from '../src/utils/theme';
import { GAME_CONFIG } from '../src/game/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  // Calculate layout positions with safe areas
  const BOARD_OFFSET_X = (SCREEN_WIDTH - BOARD_DIMENSIONS.width) / 2;
  // Adjusted for reduced HUD top padding - logo is bigger but padding is reduced
  const BOARD_OFFSET_Y = Math.max(260, insets.top + 200); // Optimized for visibility and reachability
  const PIECE_PREVIEW_HEIGHT = 150;
  const PIECE_PREVIEW_Y = SCREEN_HEIGHT - PIECE_PREVIEW_HEIGHT - insets.bottom;

  // Extract primitive values from objects to pass to worklets (worklets cannot access objects)
  const boardWidth = BOARD_DIMENSIONS.width;
  const boardHeight = BOARD_DIMENSIONS.height;
  const cellSize = BOARD_DIMENSIONS.cellSize;
  const cellGap = BOARD_DIMENSIONS.cellGap;
  const boardSize = GAME_CONFIG.BOARD_SIZE;
  const pieceCount = GAME_CONFIG.PIECE_COUNT;

  const { panGesture } = useGestures({
    boardOffsetX: BOARD_OFFSET_X,
    boardOffsetY: BOARD_OFFSET_Y,
    piecePreviewY: PIECE_PREVIEW_Y,
    boardWidth,
    boardHeight,
    cellSize,
    cellGap,
    boardSize,
    pieceCount,
    screenWidth: SCREEN_WIDTH,
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
          pointerEvents="box-none"
        >
          <GameBoard />
        </View>

        {/* Banner Ad - Above piece preview */}
        <GameBannerAd />

        {/* Piece Preview at bottom - Wrapped with GestureDetector for drag functionality */}
        <GestureDetector gesture={panGesture}>
          <View 
            style={[styles.piecePreviewContainer, { bottom: insets.bottom }]}
            accessible={false}
            pointerEvents="auto"
          >
            <PiecePreview />
          </View>
        </GestureDetector>

        {/* Line Blaster Overlay (shown when active) */}
        <LineBlasterOverlay
          boardOffsetX={BOARD_OFFSET_X}
          boardOffsetY={BOARD_OFFSET_Y}
        />

        {/* Drag Preview - Shows piece following finger */}
        <DragPreview />
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
});

