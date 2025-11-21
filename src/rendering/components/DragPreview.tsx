/**
 * DragPreview Component - Shows dragged piece following finger/cursor
 * Provides visual feedback during drag operations
 * Follows Apple HIG and Material Design principles
 */

import React, { useMemo, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, Group, LinearGradient as SkiaLinearGradient, vec } from '@shopify/react-native-skia';
import { useDragState } from '../../store/gameStore';
import { COLORS } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_CELL_SIZE = 28;
const PREVIEW_CELL_GAP = 2;

export const DragPreview = memo(function DragPreview() {
  const dragState = useDragState();

  // Calculate preview position and cells
  const previewCells = useMemo(() => {
    if (!dragState.isDragging || !dragState.draggedPiece || !dragState.dragPosition) {
      return null;
    }

    const cells: React.ReactElement[] = [];
    const piece = dragState.draggedPiece;

    // Calculate piece bounds for centering
    const minX = Math.min(...piece.structure.map(cell => cell.x));
    const maxX = Math.max(...piece.structure.map(cell => cell.x));
    const minY = Math.min(...piece.structure.map(cell => cell.y));
    const maxY = Math.max(...piece.structure.map(cell => cell.y));

    const pieceWidth = (maxX - minX + 1) * (PREVIEW_CELL_SIZE + PREVIEW_CELL_GAP);
    const pieceHeight = (maxY - minY + 1) * (PREVIEW_CELL_SIZE + PREVIEW_CELL_GAP);

    // Center the preview on the drag position
    // If touchOffset exists, apply it to maintain precise finger tracking
    const offsetX = dragState.touchOffset?.x || 0;
    const offsetY = dragState.touchOffset?.y || 0;
    const previewX = dragState.dragPosition.x - pieceWidth / 2 - offsetX;
    const previewY = dragState.dragPosition.y - pieceHeight / 2 - offsetY;

    // Get gradient colors for this piece
    const gradientColors = COLORS.pieces[piece.id % COLORS.pieces.length];

    // Determine colors based on placement validity
    // Green glow when piece can be placed (snapped), dim when invalid
    const canPlaceColors = dragState.canPlace
      ? ['#00FF88', '#00DD66'] // Bright green glow for valid snap
      : [gradientColors.start, gradientColors.end]; // Normal colors
    
    const opacity = dragState.canPlace ? 1.0 : 0.5;

    // Render each cell of the piece
    for (const cell of piece.structure) {
      const cellX = previewX + (cell.x - minX) * (PREVIEW_CELL_SIZE + PREVIEW_CELL_GAP);
      const cellY = previewY + (cell.y - minY) * (PREVIEW_CELL_SIZE + PREVIEW_CELL_GAP);

      cells.push(
        <Group key={`preview-cell-${cell.x}-${cell.y}`}>
          <RoundedRect
            x={cellX}
            y={cellY}
            width={PREVIEW_CELL_SIZE}
            height={PREVIEW_CELL_SIZE}
            r={6}
            opacity={opacity}
          >
            <SkiaLinearGradient
              start={vec(0, 0)}
              end={vec(PREVIEW_CELL_SIZE, PREVIEW_CELL_SIZE)}
              colors={canPlaceColors}
            />
          </RoundedRect>
        </Group>
      );
    }

    return cells;
  }, [dragState]);

  if (!dragState.isDragging || !previewCells) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <Group>{previewCells}</Group>
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  canvas: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

