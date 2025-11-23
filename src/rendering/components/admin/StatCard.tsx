/**
 * Stat Card - Reusable metric display component
 * Used in Admin Dashboard to show key metrics
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../utils/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  onPress?: () => void;
  subtitle?: string;
}

export function StatCard({ label, value, icon, color, onPress, subtitle }: StatCardProps) {
  const content = (
    <View style={[styles.container, onPress && styles.pressable]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.content}>
        <Text style={[styles.label, { backgroundColor: 'transparent' }]}>{label}</Text>
        <Text style={[styles.value, color && { color }, { backgroundColor: 'transparent' }]}>
          {value !== undefined && value !== null ? String(value) : 'N/A'}
        </Text>
        {subtitle && <Text style={[styles.subtitle, { backgroundColor: 'transparent' }]}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42, 47, 74, 1)',
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    minWidth: 150,
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  pressable: {
    opacity: 1,
  },
  icon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary.cyan,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.ui.textSecondary,
    marginTop: SPACING.sm,
  },
});

