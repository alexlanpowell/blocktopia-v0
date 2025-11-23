/**
 * Logs Tab - Enhanced error, performance, and analytics logging
 * Uses LogViewer component with sub-tabs for different log types
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LogViewer } from '../../components/admin/LogViewer';
import { COLORS, SPACING } from '../../../utils/theme';
import { errorTracker } from '../../../utils/ErrorTracker';
import { performanceMonitor } from '../../../utils/PerformanceMonitor';
import { enhancedAnalytics } from '../../../services/analytics/EnhancedAnalyticsService';
import { exportLogs, exportErrors } from '../../../utils/ExportUtils';

type LogType = 'errors' | 'performance' | 'analytics' | 'config';

export function LogsTab() {
  const [activeLogType, setActiveLogType] = useState<LogType>('errors');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportErrors = async () => {
    try {
      await exportErrors();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to export errors:', error);
      }
    }
  };

  const handleExportAll = async () => {
    try {
      await exportLogs();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to export logs:', error);
      }
    }
  };

  const handleClearErrors = () => {
    try {
      errorTracker.clearHistory();
      refresh();
    } catch (error) {
      if (__DEV__) console.error('Failed to clear errors:', error);
    }
  };

  const handleClearPerformance = () => {
    // Note: PerformanceMonitor doesn't have a clear method, but we can refresh
    refresh();
  };

  // Convert error reports to log entries with safety checks
  let errorLogs: any[] = [];
  try {
    const history = errorTracker.getErrorHistory();
    if (Array.isArray(history)) {
      errorLogs = history.map(err => ({
        severity: err.severity,
        timestamp: err.timestamp?.getTime?.() || Date.now(),
        context: err.context || 'Unknown',
        error: {
          message: err.error?.message || 'Unknown error',
          stack: err.error?.stack,
        },
        userAction: err.userAction,
        additionalData: err.additionalData,
      }));
    }
  } catch (error) {
    if (__DEV__) console.error('Failed to get error logs:', error);
    errorLogs = [];
  }

  // Get performance metrics with safety checks
  let perfSummary = 'No performance data available';
  let perfMetrics: any[] = [];
  try {
    if (performanceMonitor && typeof performanceMonitor.getSummary === 'function') {
      perfSummary = performanceMonitor.getSummary();
    }
    if (performanceMonitor && typeof performanceMonitor.getMetrics === 'function') {
      const metrics = performanceMonitor.getMetrics();
      perfMetrics = Array.isArray(metrics) ? metrics : [];
    }
  } catch (error) {
    if (__DEV__) console.error('Failed to get performance metrics:', error);
  }

  return (
    <View style={styles.container}>
      {/* Sub-tabs */}
      <View style={styles.subTabs}>
        {(['errors', 'performance', 'analytics', 'config'] as LogType[]).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.subTab, activeLogType === type && styles.subTabActive]}
            onPress={() => setActiveLogType(type)}
          >
            <Text
              style={[
                styles.subTabText,
                activeLogType === type && styles.subTabTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Errors Tab */}
      {activeLogType === 'errors' && (
        <LogViewer
          key={`errors-${refreshKey}`}
          logs={errorLogs}
          onClear={handleClearErrors}
          onExport={handleExportErrors}
          title="Error Logs"
          showSearch
          showFilter
        />
      )}

      {/* Performance Tab */}
      {activeLogType === 'performance' && (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.monospaceBox}>
              <Text style={styles.monospaceText}>{perfSummary}</Text>
            </View>
            {perfMetrics.length > 0 && (
              <View style={styles.metricsList}>
                {perfMetrics.slice(0, 20).map((metric, index) => (
                  <View key={index} style={styles.metricRow}>
                    <Text style={styles.metricName}>{metric.name}</Text>
                    <Text style={styles.metricDuration}>
                      {metric.duration ? `${metric.duration}ms` : 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Analytics Tab */}
      {activeLogType === 'analytics' && (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>User Segment</Text>
              <Text style={styles.analyticsValue}>
                {enhancedAnalytics.getUserSegment()}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Analytics events are tracked in the background. Use export to view full data.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Config Tab */}
      {activeLogType === 'config' && (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remote Config</Text>
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Remote config values are shown in the Overview tab. Use export to view full config.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
  },
  subTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.cyan,
  },
  subTabText: {
    color: COLORS.ui.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: COLORS.primary.cyan,
  },
  content: {
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
  monospaceBox: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: 8,
    padding: SPACING.md,
  },
  monospaceText: {
    fontFamily: 'monospace',
    color: COLORS.ui.text,
    fontSize: 11,
  },
  metricsList: {
    marginTop: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  metricName: {
    color: COLORS.ui.text,
    fontSize: 12,
  },
  metricDuration: {
    color: COLORS.primary.cyan,
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsCard: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  analyticsLabel: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  analyticsValue: {
    color: COLORS.primary.cyan,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: 8,
    padding: SPACING.lg,
  },
  emptyText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});

