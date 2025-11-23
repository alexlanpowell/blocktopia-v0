/**
 * PiecePreview Component - Shows the 3 available pieces at the bottom
 * Optimized with React.memo for performance
 */

import React, { useMemo, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, Group, LinearGradient as SkiaLinearGradient, vec } from '@shopify/react-native-skia';
import { BlurView } from 'expo-blur';
import { useCurrentPieces, useGameStore, useDragState } from '../../store/gameStore';
import { Piece } from '../../utils/types';
import { GAME_CONFIG } from '../../game/constants';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PIECE_PREVIEW_HEIGHT = 150;
const PIECE_CONTAINER_WIDTH = SCREEN_WIDTH / 3;
const CELL_SIZE = 24;
const CELL_GAP = 2;

interface SinglePiecePreviewProps {
  piece: Piece;
  index: number;
  canBePlaced: boolean;
  isBeingDragged: boolean;
}

const SinglePiecePreview = memo(function SinglePiecePreview({ piece, index, canBePlaced, isBeingDragged }: SinglePiecePreviewProps) {
  const pieceCells = useMemo(() => {
    const cells: React.ReactElement[] = [];

    // DEFENSIVE CHECK: Ensure piece has valid structure
    if (!piece || !piece.structure || piece.structure.length === 0) {
      console.error('[PiecePreview] Invalid piece structure:', piece);
      return cells; // Return empty array
    }

    // Calculate piece bounds for centering
    const minX = Math.min(...piece.structure.map(cell => cell.x));
    const maxX = Math.max(...piece.structure.map(cell => cell.x));
    const minY = Math.min(...piece.structure.map(cell => cell.y));
    const maxY = Math.max(...piece.structure.map(cell => cell.y));

    const pieceWidth = (maxX - minX + 1) * (CELL_SIZE + CELL_GAP);
    const pieceHeight = (maxY - minY + 1) * (CELL_SIZE + CELL_GAP);

    // Center offset
    const offsetX = (PIECE_CONTAINER_WIDTH - pieceWidth) / 2;
    const offsetY = (PIECE_PREVIEW_HEIGHT - pieceHeight) / 2;

    // Get gradient colors for this piece
    const gradientColors = COLORS.pieces[piece.id % COLORS.pieces.length];

    // DEFENSIVE CHECK: Ensure gradient colors exist
    if (!gradientColors || !gradientColors.start || !gradientColors.end) {
      console.error('[PiecePreview] Invalid gradient colors for piece:', piece.id);
      return cells; // Return empty array to prevent invisible pieces
    }

    // Calculate opacity: dim if can't be placed, very dim if being dragged
    const opacity = isBeingDragged ? 0.2 : (canBePlaced ? 1 : 0.4);

    // Render each cell of the piece with gradient
    for (const cell of piece.structure) {
      const cellX = offsetX + (cell.x - minX) * (CELL_SIZE + CELL_GAP);
      const cellY = offsetY + (cell.y - minY) * (CELL_SIZE + CELL_GAP);

      cells.push(
        <Group key={`piece-${index}-cell-${cell.x}-${cell.y}`}>
          <RoundedRect
            x={cellX}
            y={cellY}
            width={CELL_SIZE}
            height={CELL_SIZE}
            r={6}
            opacity={opacity}
          >
            <SkiaLinearGradient
              start={vec(0, 0)}
              end={vec(CELL_SIZE, CELL_SIZE)}
              colors={[gradientColors.start, gradientColors.end]}
            />
          </RoundedRect>
        </Group>
      );
    }

    return cells;
  }, [piece, index, canBePlaced, isBeingDragged]);

  return (
    <View style={styles.pieceContainer}>
      <Canvas style={styles.pieceCanvas}>
        <Group>{pieceCells}</Group>
      </Canvas>
    </View>
  );
});

export const PiecePreview = memo(function PiecePreview() {
  const currentPieces = useCurrentPieces();
  const canPieceBePlaced = useGameStore(state => state.canPieceBePlaced);
  const dragState = useDragState();

  // DEFENSIVE CHECK: Don't render if pieces aren't initialized yet
  if (!currentPieces || currentPieces.length === 0) {
    console.warn('[PiecePreview] No pieces available yet, skipping render');
    return (
      <BlurView intensity={20} tint="dark" style={styles.container}>
        <View style={styles.innerContainer} />
      </BlurView>
    );
  }

  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      <View style={styles.innerContainer}>
        {currentPieces.map((piece, index) => {
          // Skip rendering if piece is invalid
          if (!piece || !piece.structure || piece.structure.length === 0) {
            console.warn('[PiecePreview] Skipping invalid piece at index:', index);
            return <View key={`piece-preview-empty-${index}`} style={styles.pieceContainer} />;
          }

          const canPlace = canPieceBePlaced(index);
          const isBeingDragged = dragState.isDragging && dragState.draggedPieceIndex === index;
          return (
            <SinglePiecePreview
              key={`piece-preview-${index}-${piece.id}`}
              piece={piece}
              index={index}
              canBePlaced={canPlace}
              isBeingDragged={isBeingDragged}
            />
          );
        })}
      </View>
    </BlurView>
  );
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
    backgroundColor: COLORS.ui.cardBackground,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  innerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  pieceContainer: {
    width: PIECE_CONTAINER_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceCanvas: {
    width: PIECE_CONTAINER_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
  },
});

