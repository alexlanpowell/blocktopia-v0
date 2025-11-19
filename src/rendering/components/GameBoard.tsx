/**
 * GameBoard Component - Renders the 10x10 game grid using Skia
 * Optimized with React.memo and useMemo for 60 FPS performance
 */

import React, { useMemo, memo } from 'react';
import { Canvas, RoundedRect, Group, LinearGradient as SkiaLinearGradient, vec } from '@shopify/react-native-skia';
import { StyleSheet, Dimensions } from 'react-native';
import { useBoard, useDragState } from '../../store/gameStore';
import { GAME_CONFIG } from '../../game/constants';
import { COLORS, BORDER_RADIUS } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_PADDING = 20;
const BOARD_WIDTH = SCREEN_WIDTH - BOARD_PADDING * 2;
const CELL_SIZE = (BOARD_WIDTH - (GAME_CONFIG.BOARD_SIZE + 1) * GAME_CONFIG.CELL_GAP) / GAME_CONFIG.BOARD_SIZE;
const BOARD_HEIGHT = BOARD_WIDTH;

export const GameBoard = memo(function GameBoard() {
  const board = useBoard();
  const dragState = useDragState();
  const grid = board.getGrid();

  // Memoize board cells rendering for performance
  const boardCells = useMemo(() => {
    const cells: React.ReactElement[] = [];

    for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
      for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
        const cellX = x * (CELL_SIZE + GAME_CONFIG.CELL_GAP) + GAME_CONFIG.CELL_GAP;
        const cellY = y * (CELL_SIZE + GAME_CONFIG.CELL_GAP) + GAME_CONFIG.CELL_GAP;

        const cellValue = grid[y][x];
        const isEmpty = cellValue === null;

        // Determine cell color/gradient
        const emptyColor = COLORS.ui.boardCell;
        let gradientColors = null;
        let cellOpacity = 1;

        if (!isEmpty && cellValue !== null) {
          // Cell is filled - use gradient from theme
          gradientColors = COLORS.pieces[cellValue % COLORS.pieces.length];
        }

        // Check if this cell should be highlighted (drag preview)
        let highlightColor = null;
        if (
          dragState.isDragging &&
          dragState.targetPosition &&
          dragState.draggedPiece &&
          isEmpty
        ) {
          // Check if this cell is part of the drag preview
          const targetX = dragState.targetPosition.x;
          const targetY = dragState.targetPosition.y;

          for (const cell of dragState.draggedPiece.structure) {
            const previewX = targetX + cell.x;
            const previewY = targetY + cell.y;

            if (previewX === x && previewY === y) {
              // Show green highlight if can place, red if cannot
              highlightColor = dragState.canPlace ? COLORS.accent.success : COLORS.accent.error;
              cellOpacity = 0.6;
              break;
            }
          }
        }

        // Render cell with gradient or solid color
        if (highlightColor) {
          // Highlight cell
          cells.push(
            <RoundedRect
              key={`cell-${x}-${y}`}
              x={cellX}
              y={cellY}
              width={CELL_SIZE}
              height={CELL_SIZE}
              r={6}
              color={highlightColor}
              opacity={cellOpacity}
            />
          );
        } else if (gradientColors) {
          // Filled cell with gradient
          cells.push(
            <RoundedRect
              key={`cell-${x}-${y}`}
              x={cellX}
              y={cellY}
              width={CELL_SIZE}
              height={CELL_SIZE}
              r={6}
              opacity={cellOpacity}
            >
              <SkiaLinearGradient
                start={vec(0, 0)}
                end={vec(CELL_SIZE, CELL_SIZE)}
                colors={[gradientColors.start, gradientColors.end]}
              />
            </RoundedRect>
          );
        } else {
          // Empty cell
          cells.push(
            <RoundedRect
              key={`cell-${x}-${y}`}
              x={cellX}
              y={cellY}
              width={CELL_SIZE}
              height={CELL_SIZE}
              r={6}
              color={emptyColor}
              opacity={0.3}
            />
          );
        }
      }
    }

    return cells;
  }, [grid, dragState]);

  return (
    <Canvas style={styles.canvas}>
      <Group>
        {/* Background with gradient */}
        <RoundedRect
          x={0}
          y={0}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          r={BORDER_RADIUS.lg}
          opacity={0.8}
        >
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(BOARD_WIDTH, BOARD_HEIGHT)}
            colors={[COLORS.ui.boardBackground, COLORS.background.dark2]}
          />
        </RoundedRect>

        {/* Board cells */}
        {boardCells}
      </Group>
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
  },
});

export const BOARD_DIMENSIONS = {
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  cellSize: CELL_SIZE,
  cellGap: GAME_CONFIG.CELL_GAP,
  padding: BOARD_PADDING,
};

