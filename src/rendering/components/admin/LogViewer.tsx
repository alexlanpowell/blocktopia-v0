/**
 * Log Viewer - Enhanced log display with search and filtering
 * Used in Admin Dashboard for viewing errors, performance, and analytics
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../utils/theme';

interface LogEntry {
  severity?: string;
  timestamp: number;
  context?: string;
  error?: { message: string; stack?: string };
  message?: string;
  [key: string]: any;
}

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
  onExport?: () => void;
  title?: string;
  showSearch?: boolean;
  showFilter?: boolean;
}

export function LogViewer({
  logs,
  onClear,
  onExport,
  title = 'Logs',
  showSearch = true,
  showFilter = true,
}: LogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  // Filter logs based on search and severity
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Severity filter
      if (severityFilter && log.severity !== severityFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const contextMatch = log.context?.toLowerCase().includes(query);
        const messageMatch = log.error?.message?.toLowerCase().includes(query) ||
                            log.message?.toLowerCase().includes(query);
        return contextMatch || messageMatch;
      }

      return true;
    });
  }, [logs, searchQuery, severityFilter]);

  // Get unique severities for filter
  const severities = useMemo(() => {
    const unique = new Set<string>();
    logs.forEach(log => {
      if (log.severity) unique.add(log.severity);
    });
    return Array.from(unique);
  }, [logs]);

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title} ({filteredLogs.length})</Text>
        <View style={styles.actions}>
          {onExport && (
            <TouchableOpacity style={styles.actionButton} onPress={onExport}>
              <Text style={styles.actionText}>Export</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={onClear}
          >
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          placeholderTextColor={COLORS.ui.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {showFilter && severities.length > 0 && (
        <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !severityFilter && styles.filterChipActive]}
            onPress={() => setSeverityFilter(null)}
          >
            <Text style={[styles.filterText, !severityFilter && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {severities.map(severity => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterChip,
                severityFilter === severity && styles.filterChipActive,
              ]}
              onPress={() => setSeverityFilter(severityFilter === severity ? null : severity)}
            >
              <Text
                style={[
                  styles.filterText,
                  severityFilter === severity && styles.filterTextActive,
                ]}
              >
                {severity.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No logs found</Text>
          </View>
        ) : (
          filteredLogs.map((log, index) => {
            const isExpanded = expandedLogs.has(index);
            const severity = log.severity || 'info';
            const severityColor =
              severity === 'critical'
                ? COLORS.accent.error
                : severity === 'high'
                ? COLORS.accent.warning
                : COLORS.primary.cyan;

            return (
              <TouchableOpacity
                key={index}
                style={styles.logRow}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logHeaderLeft}>
                    {log.severity && (
                      <Text style={[styles.severityBadge, { color: severityColor }]}>
                        {log.severity.toUpperCase()}
                      </Text>
                    )}
                    <Text style={styles.timestamp}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  {log.error?.stack && (
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  )}
                </View>
                {log.context && (
                  <Text style={styles.logContext}>{log.context}</Text>
                )}
                <Text style={styles.logMessage}>
                  {log.error?.message || log.message || 'No message'}
                </Text>
                {isExpanded && log.error?.stack && (
                  <Text style={styles.stackTrace}>{log.error.stack}</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.ui.text,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.primary.cyan,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  clearButton: {
    backgroundColor: COLORS.accent.error,
  },
  actionText: {
    color: COLORS.ui.text,
    fontSize: 12,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.cyan,
    borderColor: COLORS.primary.cyan,
  },
  filterText: {
    color: COLORS.ui.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.ui.text,
  },
  logsContainer: {
    flex: 1,
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.ui.textSecondary,
    fontSize: 14,
  },
  logRow: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  severityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.ui.textSecondary,
  },
  expandIcon: {
    fontSize: 10,
    color: COLORS.ui.textSecondary,
  },
  logContext: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ui.text,
    marginBottom: SPACING.xs,
  },
  logMessage: {
    fontSize: 12,
    color: COLORS.ui.textSecondary,
    lineHeight: 16,
  },
  stackTrace: {
    fontSize: 10,
    color: COLORS.ui.textSecondary,
    fontFamily: 'monospace',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background.dark1,
    borderRadius: BORDER_RADIUS.sm,
  },
});

