/**
 * GameBoard Component - Renders the 10x10 game grid using Skia
 * Optimized with React.memo and useMemo for 60 FPS performance
 */

import React, { useMemo, memo } from 'react';
import { Canvas, RoundedRect, Group } from '@shopify/react-native-skia';
import { StyleSheet, Dimensions } from 'react-native';
import { useBoard, useDragState } from '../../store/gameStore';
import { GAME_CONFIG } from '../../game/constants';
import { PIECE_COLORS } from '../../utils/types';

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

        // Determine cell color
        let cellColor = '#2a2a3e'; // Empty cell background
        let cellOpacity = 1;

        if (!isEmpty && cellValue !== null) {
          // Cell is filled - use piece color
          cellColor = PIECE_COLORS[cellValue % PIECE_COLORS.length];
        }

        // Check if this cell should be highlighted (drag preview)
        let isHighlighted = false;
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
              isHighlighted = true;
              // Show green highlight if can place, red if cannot
              cellColor = dragState.canPlace ? '#4ECDC4' : '#FF6B6B';
              cellOpacity = 0.6;
              break;
            }
          }
        }

        cells.push(
          <RoundedRect
            key={`cell-${x}-${y}`}
            x={cellX}
            y={cellY}
            width={CELL_SIZE}
            height={CELL_SIZE}
            r={4}
            color={cellColor}
            opacity={cellOpacity}
          />
        );
      }
    }

    return cells;
  }, [grid, dragState]);

  return (
    <Canvas style={styles.canvas}>
      <Group>
        {/* Background */}
        <RoundedRect
          x={0}
          y={0}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          r={12}
          color="#1a1a2e"
        />

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

