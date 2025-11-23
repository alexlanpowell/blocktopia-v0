/**
 * Overview Tab - Real-time dashboard with key metrics
 * Shows app info, user summary, game summary, system health, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { StatCard } from '../../components/admin/StatCard';
import { ActionButton } from '../../components/admin/ActionButton';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../utils/theme';
import { getDeviceInfo } from '../../../utils/DeviceInfo';
import { useMonetizationStore } from '../../../store/monetizationStore';
import { useGameStore } from '../../../store/gameStore';
import { errorTracker } from '../../../utils/ErrorTracker';
import { performanceMonitor } from '../../../utils/PerformanceMonitor';
import { networkMonitor } from '../../../utils/NetworkMonitor';
import { exportLogs } from '../../../utils/ExportUtils';

interface OverviewTabProps {
  onRefresh?: () => void;
}

export function OverviewTab({ onRefresh }: OverviewTabProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  const user = useMonetizationStore(state => state.user);
  const gems = useMonetizationStore(state => state.gems);
  const isPremium = useMonetizationStore(state => state.isPremium);
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.getScore());
  const bestScore = useGameStore(state => state.getBestScore());
  const isGameOver = useGameStore(state => state.isGameOver());

  // Load device info with error handling
  useEffect(() => {
    try {
      const info = getDeviceInfo();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to get device info:', error);
      setDeviceInfo({
        appVersion: 'Error',
        sdkVersion: 'Error',
        buildType: 'Error',
        newArchEnabled: false,
      });
    }
  }, []);

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

  // Get error count from last hour with safety checks
  const recentErrors = React.useMemo(() => {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const history = errorTracker.getErrorHistory();
      if (Array.isArray(history)) {
        return history.filter(err => err.timestamp >= oneHourAgo).length;
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to get error history:', error);
    }
    return 0;
  }, [refreshing]);

  // Get network stats with safety checks
  const networkStats = React.useMemo(() => {
    try {
      if (networkMonitor && typeof networkMonitor.getStats === 'function') {
        return networkMonitor.getStats();
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to get network stats:', error);
    }
    return {
      totalCalls: 0,
      successRate: 0,
      averageDuration: 0,
      failedCalls: 0,
    };
  }, [refreshing]);

  // Defensive check: if device info or user data hasn't loaded yet, show loading state
  if (!deviceInfo || !user.userId) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading...</Text>
          <Text style={styles.loadingText}>Please wait while we fetch your data.</Text>
        </View>
      </ScrollView>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
    onRefresh?.();
  };

  const handleExportLogs = async () => {
    try {
      await exportLogs();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to export logs:', error);
      }
    }
  };

  const handleClearCache = () => {
    // Clear caches (implement based on what needs clearing)
    errorTracker.clearHistory();
    networkMonitor.clearHistory();
    setShowClearCacheDialog(false);
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Version" value={deviceInfo.appVersion} />
          <StatCard label="SDK" value={deviceInfo.sdkVersion} />
          <StatCard label="Build" value={deviceInfo.buildType} />
          <StatCard
            label="New Arch"
            value={deviceInfo.newArchEnabled ? 'Enabled' : 'Disabled'}
            color={deviceInfo.newArchEnabled ? COLORS.accent.success : COLORS.accent.warning}
          />
        </View>
      </View>

      {/* User Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Summary</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Username"
            value={user?.username || user?.userId || 'Guest'}
            icon="👤"
          />
          <StatCard label="Gems" value={gems} icon="💎" color={COLORS.accent.gold} />
          <StatCard
            label="Premium"
            value={isPremium ? 'Yes' : 'No'}
            color={isPremium ? COLORS.accent.success : COLORS.ui.textSecondary}
          />
          <StatCard
            label="Auth"
            value={user?.isAnonymous ? 'Anonymous' : 'Authenticated'}
          />
        </View>
      </View>

      {/* Game Summary */}
      {gameState && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Summary</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Score" value={score} icon="🎯" />
            <StatCard label="Best Score" value={bestScore} icon="🏆" />
            <StatCard label="Board Fill" value={`${boardFill}%`} icon="📊" />
            <StatCard
              label="Status"
              value={isGameOver ? 'Game Over' : 'Playing'}
              color={isGameOver ? COLORS.accent.error : COLORS.accent.success}
            />
          </View>
        </View>
      )}

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Errors (1h)"
            value={recentErrors}
            color={recentErrors > 0 ? COLORS.accent.error : COLORS.accent.success}
          />
          <StatCard
            label="Network Success"
            value={`${networkStats.successRate}%`}
            color={
              networkStats.successRate >= 95
                ? COLORS.accent.success
                : networkStats.successRate >= 80
                ? COLORS.accent.warning
                : COLORS.accent.error
            }
          />
          <StatCard
            label="Avg Latency"
            value={`${networkStats.avgDuration}ms`}
            color={
              networkStats.avgDuration < 500
                ? COLORS.accent.success
                : networkStats.avgDuration < 1000
                ? COLORS.accent.warning
                : COLORS.accent.error
            }
          />
          <StatCard label="Total Calls" value={networkStats.total} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            label="Export Logs"
            icon="📤"
            onPress={handleExportLogs}
            variant="primary"
            small
          />
          <ActionButton
            label="Clear Cache"
            icon="🗑️"
            onPress={() => setShowClearCacheDialog(true)}
            variant="warning"
            small
          />
        </View>
      </View>
    </ScrollView>

    {/* Confirmation Dialogs - Outside ScrollView */}
    {showClearCacheDialog && (
      <ConfirmDialog
        visible={showClearCacheDialog}
        title="Clear Cache"
        message="This will clear error logs and network history. Continue?"
        onConfirm={handleClearCache}
        onCancel={() => setShowClearCacheDialog(false)}
        variant="warning"
      />
    )}
  </>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    marginTop: SPACING.sm,
  },
});

