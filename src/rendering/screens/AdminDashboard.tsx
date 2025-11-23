/**
 * Admin Dashboard - Production-Grade Debugging & Testing Tool
 * Comprehensive admin panel with 5 major tabs: Overview, Game, User, System, Logs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Modal } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { OverviewTab } from './admin/OverviewTab';
import { GameTab } from './admin/GameTab';
import { UserTab } from './admin/UserTab';
import { SystemTab } from './admin/SystemTab';
import { LogsTab } from './admin/LogsTab';

interface AdminDashboardProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'game' | 'user' | 'system' | 'logs';

// Error Boundary to catch any crashes in Admin Dashboard
class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background.dark1 }}>
          <Text style={{ color: 'red', fontSize: 18, marginBottom: 10 }}>
            Dashboard Error
          </Text>
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 20, padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export function AdminDashboard({ visible, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [, setTick] = useState(0);

  // Auto-refresh Overview tab every 2 seconds when visible
  useEffect(() => {
    if (!visible || activeTab !== 'overview') return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [visible, activeTab]);

  const handleRefresh = () => {
    setTick(t => t + 1);
  };

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'user', label: 'User', icon: '👤' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'logs', label: 'Logs', icon: '📋' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onRefresh={handleRefresh} />;
      case 'game':
        return <GameTab />;
      case 'user':
        return <UserTab />;
      case 'system':
        return <SystemTab />;
      case 'logs':
        return <LogsTab />;
      default:
        return <OverviewTab onRefresh={handleRefresh} />;
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🔧 Admin Dashboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.content}>{renderTabContent()}</View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
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
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
    backgroundColor: COLORS.ui.cardBackground,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.cyan,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    color: COLORS.ui.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary.cyan,
  },
  content: {
    flex: 1,
  },
});
