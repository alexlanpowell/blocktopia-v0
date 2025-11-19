/**
 * HUD Component - Display score, best score, and controls
 * Follows Apple HIG and Material Design principles
 * Optimized with React.memo for performance
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useScore, useBestScore, useIsGameOver, useGameStore } from '../../store/gameStore';

export const HUD = memo(function HUD() {
  const score = useScore();
  const bestScore = useBestScore();
  const isGameOver = useIsGameOver();
  const restartGame = useGameStore(state => state.restartGame);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Restart button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={restartGame}
          activeOpacity={0.7}
          accessibilityLabel="Restart game"
          accessibilityRole="button"
          accessibilityHint="Restarts the current game"
        >
          <Text style={styles.buttonText}>↻</Text>
        </TouchableOpacity>

        {/* Score display */}
        <View style={styles.scoreContainer} accessible={true} accessibilityLabel={`Current score: ${score}`}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        {/* Best score display */}
        <View style={styles.scoreContainer} accessible={true} accessibilityLabel={`Best score: ${bestScore}`}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.bestScoreValue}>{bestScore}</Text>
        </View>
      </View>

      {/* Game over overlay */}
      {isGameOver && (
        <View style={styles.gameOverOverlay} accessible={true} accessibilityLabel="Game over screen">
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle} accessibilityRole="header">Game Over!</Text>
            <Text style={styles.gameOverScore}>Score: {score}</Text>
            {score === bestScore && score > 0 && (
              <Text style={styles.newBestText} accessibilityLiveRegion="polite">
                🎉 New Best Score!
              </Text>
            )}
            <TouchableOpacity 
              style={styles.restartButton} 
              onPress={restartGame}
              activeOpacity={0.8}
              accessibilityLabel="Play again"
              accessibilityRole="button"
              accessibilityHint="Starts a new game"
            >
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: Platform.OS === 'android' ? 0.5 : 0,
  },
  scoreValue: {
    fontSize: 24,
    color: '#4ECDC4',
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  bestScoreValue: {
    fontSize: 24,
    color: '#F7B731',
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameOverCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 280,
    maxWidth: '90%',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '500',
  },
  newBestText: {
    fontSize: 18,
    color: '#F7B731',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: Platform.OS === 'ios' ? 25 : 20,
    marginTop: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#ffffff',
    letterSpacing: Platform.OS === 'android' ? 0.5 : 0,
  },
});

