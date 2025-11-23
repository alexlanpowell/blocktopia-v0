/**
 * Game Tab - Game state inspector and testing tools
 * Shows live game board, pieces, stats, and provides testing actions
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MiniGameBoard } from '../../components/admin/MiniGameBoard';
import { StatCard } from '../../components/admin/StatCard';
import { ActionButton } from '../../components/admin/ActionButton';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../utils/theme';
import { useGameStore } from '../../../store/gameStore';
import { GAME_CONFIG } from '../../../game/constants';

export function GameTab() {
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.getScore());
  const bestScore = useGameStore(state => state.getBestScore());
  const isGameOver = useGameStore(state => state.isGameOver());
  const currentPieces = useGameStore(state => state.getCurrentPieces());
  const restartGame = useGameStore(state => state.restartGame);

  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [scoreInput, setScoreInput] = useState('');

  // Calculate board fill percentage
  const boardFill = React.useMemo(() => {
    if (!gameState?.board) return 0;
    const board = gameState.board;
    let filledCells = 0;
    let totalCells = 0;
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y]?.length || 0; x++) {
        totalCells++;
        if (board[y]?.[x] !== null && board[y]?.[x] !== 0) {
          filledCells++;
        }
      }
    }
    return totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
  }, [gameState?.board]);

  const handleRestart = () => {
    restartGame();
    setShowRestartDialog(false);
  };

  const handleSetScore = () => {
    const newScore = parseInt(scoreInput, 10);
    if (!isNaN(newScore) && newScore >= 0) {
      // Note: This would require exposing a setScore method in gameStore
      // For now, just show a message
      if (__DEV__) {
        console.log('Set score to:', newScore);
      }
      setScoreInput('');
    }
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No active game</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Game State Visualization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Board</Text>
        <View style={styles.boardContainer}>
          <MiniGameBoard board={gameState.board} cellSize={12} showLabels />
        </View>
      </View>

      {/* Game Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Score" value={score} icon="🎯" />
          <StatCard label="Best Score" value={bestScore} icon="🏆" />
          <StatCard label="Board Fill" value={`${boardFill}%`} icon="📊" />
          <StatCard
            label="Status"
            value={isGameOver ? 'Game Over' : 'Playing'}
            color={isGameOver ? COLORS.accent.error : COLORS.accent.success}
          />
          <StatCard label="Pieces Remaining" value={currentPieces.length} icon="🧩" />
        </View>
      </View>

      {/* Current Pieces */}
      {currentPieces.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Pieces ({currentPieces.length})</Text>
          {currentPieces.map((piece, index) => (
            <View key={`piece-${index}-${piece.id || 'unknown'}`} style={styles.pieceInfo}>
              <Text style={styles.pieceLabel}>
                Piece {index + 1}: {piece.structure?.length || 0} cells
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Testing Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Tools</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            label="Restart Game"
            icon="🔄"
            onPress={() => setShowRestartDialog(true)}
            variant="warning"
            small
          />
        </View>
      </View>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showRestartDialog}
        title="Restart Game"
        message="This will restart the current game. Continue?"
        onConfirm={handleRestart}
        onCancel={() => setShowRestartDialog(false)}
        variant="warning"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  boardContainer: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  pieceInfo: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pieceLabel: {
    color: COLORS.ui.text,
    fontSize: 12,
  },
  emptyText: {
    color: COLORS.ui.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

