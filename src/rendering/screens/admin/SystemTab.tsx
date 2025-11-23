/**
 * System Tab - Device info, storage inspector, and network monitor
 * Shows system information, MMKV storage, and API call tracking
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatCard } from '../../components/admin/StatCard';
import { ActionButton } from '../../components/admin/ActionButton';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../utils/theme';
import { getDeviceInfo, formatDeviceInfo } from '../../../utils/DeviceInfo';
import { storageInspector } from '../../../utils/StorageInspector';
import { networkMonitor } from '../../../utils/NetworkMonitor';
import { supabaseManager } from '../../../services/backend/SupabaseClient';

type SubTab = 'device' | 'storage' | 'network';

export function SystemTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('device');
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [storageInfo, setStorageInfo] = useState<any[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [networkCalls, setNetworkCalls] = useState(() => {
    try {
      if (networkMonitor && typeof networkMonitor.getRecentCalls === 'function') {
        const calls = networkMonitor.getRecentCalls(50);
        return Array.isArray(calls) ? calls : [];
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to get network calls:', error);
    }
    return [];
  });
  const [showClearStorageDialog, setShowClearStorageDialog] = useState(false);
  const [showClearNetworkDialog, setShowClearNetworkDialog] = useState(false);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

  const refreshData = () => {
    try {
      setDeviceInfo(getDeviceInfo());
    } catch (error) {
      if (__DEV__) console.error('Failed to get device info:', error);
    }
    
    if (activeSubTab === 'storage') {
      try {
        const storageIds = storageInspector.getKnownStorageIds();
        setStorageInfo(storageIds.map(id => ({
          id,
          keyCount: storageInspector.getAllKeys(id).length,
          size: storageInspector.getStorageSize(id),
        })));
      } catch (error) {
        if (__DEV__) console.error('Failed to get storage info:', error);
      }
    }
    
    if (activeSubTab === 'network') {
      try {
        if (networkMonitor && typeof networkMonitor.getRecentCalls === 'function') {
          const calls = networkMonitor.getRecentCalls(50);
          if (Array.isArray(calls)) {
            setNetworkCalls(calls);
          }
        }
      } catch (error) {
        if (__DEV__) console.error('Failed to get network calls:', error);
      }
    }
  };

  const handleSelectStorage = (storageId: string) => {
    setSelectedStorage(storageId);
    setStorageKeys(storageInspector.getAllKeys(storageId));
  };

  const handleClearStorage = (storageId: string) => {
    storageInspector.clearAll(storageId);
    refreshData();
    setShowClearStorageDialog(false);
  };

  const handleClearNetwork = () => {
    networkMonitor.clearHistory();
    refreshData();
    setShowClearNetworkDialog(false);
  };

  let networkStats = { totalCalls: 0, successRate: 0, averageDuration: 0, failedCalls: 0 };
  try {
    if (networkMonitor && typeof networkMonitor.getStats === 'function') {
      networkStats = networkMonitor.getStats();
    }
  } catch (error) {
    if (__DEV__) console.error('Failed to get network stats:', error);
  }
  
  const supabaseConnected = supabaseManager.isInitialized();

  return (
    <View style={styles.container}>
      {/* Sub-tabs */}
      <View style={styles.subTabs}>
        {(['device', 'storage', 'network'] as SubTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.subTab, activeSubTab === tab && styles.subTabActive]}
            onPress={() => setActiveSubTab(tab)}
          >
            <Text
              style={[
                styles.subTabText,
                activeSubTab === tab && styles.subTabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Device Info Tab */}
        {activeSubTab === 'device' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Platform" value={deviceInfo.platform} />
              <StatCard label="OS Version" value={deviceInfo.osVersion} />
              <StatCard label="App Version" value={deviceInfo.appVersion} />
              <StatCard label="SDK Version" value={deviceInfo.sdkVersion} />
              <StatCard label="Build Type" value={deviceInfo.buildType} />
              <StatCard
                label="New Arch"
                value={deviceInfo.newArchEnabled ? 'Enabled' : 'Disabled'}
                color={
                  deviceInfo.newArchEnabled
                    ? COLORS.accent.success
                    : COLORS.accent.warning
                }
              />
              <StatCard label="JS Engine" value={deviceInfo.jsEngine} />
              {deviceInfo.deviceModel && (
                <StatCard label="Device" value={deviceInfo.deviceModel} />
              )}
              {deviceInfo.bundleId && (
                <StatCard label="Bundle ID" value={deviceInfo.bundleId} />
              )}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{formatDeviceInfo(deviceInfo)}</Text>
            </View>
          </View>
        )}

        {/* Storage Inspector Tab */}
        {activeSubTab === 'storage' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage Inspector</Text>
            <StatCard
              label="Supabase Connected"
              value={supabaseConnected ? 'Yes' : 'No'}
              color={supabaseConnected ? COLORS.accent.success : COLORS.accent.error}
            />
            {storageInfo.map(storage => (
              <TouchableOpacity
                key={storage.id}
                style={styles.storageItem}
                onPress={() => handleSelectStorage(storage.id)}
              >
                <View style={styles.storageHeader}>
                  <Text style={styles.storageId}>{storage.id}</Text>
                  <Text style={styles.storageSize}>
                    {storage.keyCount} keys • {storage.size} bytes
                  </Text>
                </View>
                {selectedStorage === storage.id && (
                  <View style={styles.storageKeys}>
                    {storageKeys.length === 0 ? (
                      <Text style={styles.emptyText}>No keys</Text>
                    ) : (
                      storageKeys.map(key => (
                        <View key={key} style={styles.keyRow}>
                          <Text style={styles.keyName}>{key}</Text>
                          <Text style={styles.keyValue}>
                            {JSON.stringify(storageInspector.getValue(storage.id, key))}
                          </Text>
                        </View>
                      ))
                    )}
                    <ActionButton
                      label="Clear Storage"
                      onPress={() => {
                        setSelectedStorage(storage.id);
                        setShowClearStorageDialog(true);
                      }}
                      variant="danger"
                      small
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Network Monitor Tab */}
        {activeSubTab === 'network' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Monitor</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Total Calls" value={networkStats.total} />
              <StatCard
                label="Success Rate"
                value={`${networkStats.successRate}%`}
                color={
                  networkStats.successRate >= 95
                    ? COLORS.accent.success
                    : networkStats.successRate >= 80
                    ? COLORS.accent.warning
                    : COLORS.accent.error
                }
              />
              <StatCard label="Avg Duration" value={`${networkStats.avgDuration}ms`} />
              <StatCard label="Failed" value={networkStats.failed} />
            </View>
            <View style={styles.actionsGrid}>
              <ActionButton
                label="Clear History"
                onPress={() => setShowClearNetworkDialog(true)}
                variant="warning"
                small
              />
            </View>
            <View style={styles.networkCalls}>
              {networkCalls.length === 0 ? (
                <Text style={styles.emptyText}>No network calls</Text>
              ) : (
                networkCalls.map(call => (
                  <View key={call.id} style={styles.networkCall}>
                    <View style={styles.networkCallHeader}>
                      <Text style={styles.networkMethod}>{call.method}</Text>
                      <Text
                        style={[
                          styles.networkStatus,
                          { color: call.success ? COLORS.accent.success : COLORS.accent.error },
                        ]}
                      >
                        {call.success ? '✓' : '✗'}
                      </Text>
                    </View>
                    <Text style={styles.networkTable}>{call.table}</Text>
                    <Text style={styles.networkDuration}>{call.duration}ms</Text>
                    {call.error && (
                      <Text style={styles.networkError}>{call.error}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        visible={showClearStorageDialog}
        title="Clear Storage"
        message={`This will clear all data in "${selectedStorage}". This cannot be undone. Continue?`}
        onConfirm={() => selectedStorage && handleClearStorage(selectedStorage)}
        onCancel={() => setShowClearStorageDialog(false)}
        variant="danger"
      />
      <ConfirmDialog
        visible={showClearNetworkDialog}
        title="Clear Network History"
        message="This will clear all network call history. Continue?"
        onConfirm={handleClearNetwork}
        onCancel={() => setShowClearNetworkDialog(false)}
        variant="warning"
      />
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
    fontSize: 12,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoBox: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoText: {
    color: COLORS.ui.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  storageItem: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageId: {
    color: COLORS.ui.text,
    fontSize: 14,
    fontWeight: '600',
  },
  storageSize: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
  },
  storageKeys: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.cardBorder,
  },
  keyRow: {
    marginBottom: SPACING.sm,
  },
  keyName: {
    color: COLORS.ui.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  keyValue: {
    color: COLORS.ui.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  networkCalls: {
    marginTop: SPACING.md,
  },
  networkCall: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  networkCallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkMethod: {
    color: COLORS.primary.cyan,
    fontSize: 12,
    fontWeight: '600',
  },
  networkStatus: {
    fontSize: 14,
  },
  networkTable: {
    color: COLORS.ui.text,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  networkDuration: {
    color: COLORS.ui.textSecondary,
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  networkError: {
    color: COLORS.accent.error,
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  emptyText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    padding: SPACING.md,
  },
});

