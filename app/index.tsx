/**
 * Main Menu / Index Screen
 * Follows Apple HIG and Material Design principles
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">Blocktopia</Text>
        <Text style={styles.subtitle}>Block Puzzle Game</Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push('/game')}
          activeOpacity={0.7}
          accessibilityLabel="Start playing Blocktopia"
          accessibilityRole="button"
          accessibilityHint="Navigates to the game screen"
        >
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionText} accessibilityRole="header">
            How to Play:
          </Text>
          <Text style={styles.instructionDetail}>
            • Drag pieces from bottom to grid
          </Text>
          <Text style={styles.instructionDetail}>
            • Fill rows or columns to clear them
          </Text>
          <Text style={styles.instructionDetail}>
            • Game ends when no pieces fit
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 500,
    width: '100%',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 52 : 48,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#4ECDC4',
    marginBottom: 10,
    letterSpacing: Platform.OS === 'android' ? 0.5 : 0,
  },
  subtitle: {
    fontSize: 20,
    color: '#888',
    marginBottom: 60,
    fontWeight: '400',
  },
  playButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: Platform.OS === 'ios' ? 30 : 25,
    marginBottom: 40,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#ffffff',
    letterSpacing: Platform.OS === 'android' ? 0.5 : 0,
  },
  instructions: {
    backgroundColor: '#2a2a3e',
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    lineHeight: 20,
  },
});

