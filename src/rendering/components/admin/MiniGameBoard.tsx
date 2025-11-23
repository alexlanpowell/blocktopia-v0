/**
 * Mini Game Board - Simplified board visualization for Admin Dashboard
 * Shows a compact 10x10 grid representation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BoardGrid } from '../../../utils/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../utils/theme';
import { GAME_CONFIG } from '../../../game/constants';

interface MiniGameBoardProps {
  board: BoardGrid;
  cellSize?: number;
  showLabels?: boolean;
}

export function MiniGameBoard({ board, cellSize = 8, showLabels = false }: MiniGameBoardProps) {
  const boardSize = GAME_CONFIG.BOARD_SIZE;
  const gap = 1;

  // Calculate board fill percentage
  let filledCells = 0;
  let totalCells = 0;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      totalCells++;
      if (board[y] && board[y][x] !== null && board[y][x] !== 0) {
        filledCells++;
      }
    }
  }
  const fillPercentage = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.header}>
          <Text style={styles.label}>Board Fill: {fillPercentage}%</Text>
        </View>
      )}
      <View style={styles.board}>
        {Array.from({ length: boardSize }).map((_, y) => (
          <View key={`row-${y}`} style={styles.row}>
            {Array.from({ length: boardSize }).map((_, x) => {
              const cellValue = board[y]?.[x];
              const isEmpty = cellValue === null || cellValue === 0;
              
              // Get color based on piece value
              const pieceIndex = typeof cellValue === 'number' ? cellValue % COLORS.pieces.length : 0;
              const pieceColors = COLORS.pieces[pieceIndex] || COLORS.pieces[0];

              return (
                <View
                  key={`cell-${x}-${y}`}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: isEmpty ? COLORS.ui.boardCell : pieceColors.start,
                      marginRight: gap,
                      marginBottom: gap,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 12,
    color: COLORS.ui.textSecondary,
    fontWeight: '600',
  },
  board: {
    backgroundColor: COLORS.ui.boardBackground,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 2,
  },
});

