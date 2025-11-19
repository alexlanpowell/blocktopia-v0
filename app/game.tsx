/**
 * Main Game Screen - Integrates all components
 * Follows Apple HIG and Material Design principles
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameBoard, BOARD_DIMENSIONS } from '../src/rendering/components/GameBoard';
import { PiecePreview } from '../src/rendering/components/PiecePreview';
import { HUD } from '../src/rendering/components/HUD';
import { useGestures } from '../src/rendering/hooks/useGestures';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  // Calculate layout positions with safe areas
  const BOARD_OFFSET_X = (SCREEN_WIDTH - BOARD_DIMENSIONS.width) / 2;
  const BOARD_OFFSET_Y = Math.max(150, insets.top + 80); // Ensure enough space for HUD
  const PIECE_PREVIEW_HEIGHT = 150;
  const PIECE_PREVIEW_Y = SCREEN_HEIGHT - PIECE_PREVIEW_HEIGHT - insets.bottom;

  const onPiecePlaced = useCallback(() => {
    // TODO: Add haptic feedback here in Phase 2
    // TODO: Add sound effects in Phase 2
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
        backgroundColor="#0f1419"
        translucent={Platform.OS === 'android'}
      />
      <GestureDetector gesture={panGesture}>
        <View style={styles.gameContainer}>
          {/* HUD (Score, Restart, Game Over) */}
          <HUD />

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
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
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

