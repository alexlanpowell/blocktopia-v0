/**
 * Admin Dashboard - Phase 9
 * Internal tool for monitoring, config management, and debugging
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { remoteConfig } from '../../services/config/RemoteConfigService';
import { errorTracker } from '../../utils/ErrorTracker';
import { performanceMonitor } from '../../utils/PerformanceMonitor';
import { enhancedAnalytics } from '../../services/analytics/EnhancedAnalyticsService';
import { useMonetizationStore } from '../../store/monetizationStore';

interface AdminDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export function AdminDashboard({ visible, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'errors' | 'perf' | 'analytics'>('config');
  const [configKeys, setConfigKeys] = useState<string[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [perfSummary, setPerfSummary] = useState<string>('');
  
  // Local state for refreshing UI
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  useEffect(() => {
    if (visible) {
      refreshData();
    }
  }, [visible, activeTab]);

  const refreshData = async () => {
    // Refresh config
    await remoteConfig.fetchConfig(); // Pull latest
    // In a real app we'd inspect the internal map, but for now we'll just mock some known keys
    // or expose a method to get all keys. 
    // Since `config` is private in RemoteConfigService, we'd ideally add a getter.
    // For this demo, we'll just check the default keys we know exist.
    setConfigKeys([
      'ad_interstitial_frequency',
      'daily_reward_gems',
      'welcome_bonus_gems',
      'enable_ads', 
      'enable_new_shop_ui'
    ]);

    // Refresh errors
    setErrorLogs(errorTracker.getErrorHistory());

    // Refresh perf
    setPerfSummary(performanceMonitor.getSummary());
  };

  const renderConfigTab = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.sectionTitle}>Remote Config & Flags</Text>
      {configKeys.map(key => {
        const val = remoteConfig.getValue(key);
        const isFlag = key.startsWith('enable_');
        
        return (
          <View key={key} style={styles.configRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.configKey}>{key}</Text>
              <Text style={styles.configValue}>{JSON.stringify(val)}</Text>
            </View>
            {isFlag && (
              <Switch
                value={Boolean(val)}
                onValueChange={() => {
                  // In a real admin dash, this would update the backend via API
                  alert('Editing config is read-only in this client view. Update via Supabase dashboard.');
                }}
              />
            )}
          </View>
        );
      })}
      <TouchableOpacity style={styles.actionButton} onPress={refreshData}>
        <Text style={styles.actionButtonText}>Refresh Config</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderErrorsTab = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.sectionTitle}>Error Logs ({errorLogs.length})</Text>
      {errorLogs.map((log, i) => (
        <View key={i} style={styles.logRow}>
          <View style={styles.logHeader}>
            <Text style={[styles.severityBadge, { 
              color: log.severity === 'critical' ? COLORS.accent.error : COLORS.accent.warning 
            }]}>{log.severity.toUpperCase()}</Text>
            <Text style={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
          </View>
          <Text style={styles.logContext}>{log.context}</Text>
          <Text style={styles.logMessage}>{log.error.message}</Text>
        </View>
      ))}
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: COLORS.accent.error }]} 
        onPress={() => {
          errorTracker.clearHistory();
          refreshData();
        }}
      >
        <Text style={styles.actionButtonText}>Clear Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPerfTab = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <Text style={styles.monospaceText}>{perfSummary}</Text>
      <TouchableOpacity style={styles.actionButton} onPress={refreshData}>
        <Text style={styles.actionButtonText}>Refresh Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.sectionTitle}>Analytics Session</Text>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>User Segment</Text>
        <Text style={styles.statValue}>{enhancedAnalytics.getUserSegment()}</Text>
      </View>
      {/* Add more analytics debug info here */}
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔧 Admin Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {['config', 'errors', 'perf', 'analytics'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === 'config' && renderConfigTab()}
          {activeTab === 'errors' && renderErrorsTab()}
          {activeTab === 'perf' && renderPerfTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 20 : SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
    backgroundColor: COLORS.ui.cardBackground,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.ui.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    color: COLORS.primary.cyan,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.cyan,
  },
  tabText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary.cyan,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.ui.cardBackground,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  configKey: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  configValue: {
    color: COLORS.primary.gold,
    fontWeight: 'bold',
  },
  logRow: {
    padding: SPACING.md,
    backgroundColor: COLORS.ui.cardBackground,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.warning,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  severityBadge: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  timestamp: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
  },
  logContext: {
    color: COLORS.ui.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  logMessage: {
    color: COLORS.ui.textSecondary,
  },
  monospaceText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.ui.text,
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary.cyan,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  actionButtonText: {
    color: COLORS.ui.text,
    fontWeight: 'bold',
  },
  statCard: {
    backgroundColor: COLORS.ui.cardBackground,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statLabel: {
    color: COLORS.ui.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  statValue: {
    color: COLORS.primary.gold,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

