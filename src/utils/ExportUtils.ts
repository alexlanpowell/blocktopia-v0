/**
 * Export Utils - Export logs and data for debugging
 * Used by Admin Dashboard to share diagnostic information
 */

import { Share } from 'react-native';
import { errorTracker } from './ErrorTracker';
import { performanceMonitor } from './PerformanceMonitor';
import { networkMonitor } from './NetworkMonitor';
import { getDeviceInfo } from './DeviceInfo';
import { enhancedAnalytics } from '../services/analytics/EnhancedAnalyticsService';
import { useMonetizationStore } from '../store/monetizationStore';
import { useGameStore } from '../store/gameStore';

export interface ExportData {
  timestamp: string;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
  errors: any[];
  performance: {
    summary: string;
    metrics: any[];
  };
  network: {
    calls: any[];
    stats: ReturnType<typeof networkMonitor.getStats>;
  };
  analytics?: {
    userSegment: string;
    recentEvents?: any[];
  };
  gameState?: {
    score: number;
    bestScore: number;
    isGameOver: boolean;
    boardFill?: number;
  };
  userState?: {
    userId: string | null;
    username: string | null;
    gems: number;
    isPremium: boolean;
    powerUps: Record<string, number>;
  };
}

/**
 * Export all diagnostic data as JSON
 */
export async function exportLogs(): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo();
    const errors = errorTracker.getErrorHistory();
    const perfSummary = performanceMonitor.getSummary();
    const perfMetrics = performanceMonitor.getMetrics();
    const networkCalls = networkMonitor.getCalls();
    const networkStats = networkMonitor.getStats();

    const data: ExportData = {
      timestamp: new Date().toISOString(),
      deviceInfo,
      errors,
      performance: {
        summary: perfSummary,
        metrics: perfMetrics,
      },
      network: {
        calls: networkCalls,
        stats: networkStats,
      },
      analytics: {
        userSegment: enhancedAnalytics.getUserSegment(),
      },
    };

    // Add game state if available
    try {
      const gameState = useGameStore.getState().gameState;
      if (gameState) {
        const board = gameState.board;
        let filledCells = 0;
        let totalCells = 0;
        for (let y = 0; y < board.length; y++) {
          for (let x = 0; x < board[y].length; x++) {
            totalCells++;
            if (board[y][x] !== 0) filledCells++;
          }
        }
        const boardFill = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

        data.gameState = {
          score: gameState.score,
          bestScore: gameState.bestScore,
          isGameOver: gameState.isGameOver,
          boardFill,
        };
      }
    } catch (error) {
      // Game state not available, skip
    }

    // Add user state if available
    try {
      const monetizationState = useMonetizationStore.getState();
      data.userState = {
        userId: monetizationState.user.userId,
        username: monetizationState.user.username,
        gems: monetizationState.gems,
        isPremium: monetizationState.isPremium,
        powerUps: {
          undo: monetizationState.powerUps.undo,
          hint: monetizationState.powerUps.hint,
          shuffle: monetizationState.powerUps.shuffle,
          lineBlaster: monetizationState.powerUps.lineBlaster,
        },
      };
    } catch (error) {
      // User state not available, skip
    }

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `blocktopia-debug-${Date.now()}.json`;

    // Share as text using React Native's Share API
    await Share.share({
      message: jsonString,
      title: 'Blocktopia Debug Data',
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[ExportUtils] Failed to export logs:', error);
    }
    throw error;
  }
}

/**
 * Export errors only
 */
export async function exportErrors(): Promise<void> {
  try {
    const errors = errorTracker.getErrorHistory();
    const data = {
      timestamp: new Date().toISOString(),
      errors,
      deviceInfo: getDeviceInfo(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    await Share.share({
      message: jsonString,
      title: 'Blocktopia Error Logs',
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[ExportUtils] Failed to export errors:', error);
    }
    throw error;
  }
}

