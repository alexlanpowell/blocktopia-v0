/**
 * Action Button - Styled button for admin actions
 * Used in Admin Dashboard for testing tools and actions
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../utils/theme';

interface ActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  small?: boolean;
}

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  small = false,
}: ActionButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: COLORS.primary.cyan, color: COLORS.ui.text },
    danger: { backgroundColor: COLORS.accent.error, color: COLORS.ui.text },
    success: { backgroundColor: COLORS.accent.success, color: COLORS.ui.text },
    warning: { backgroundColor: COLORS.accent.warning, color: COLORS.ui.text },
  };

  const style = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: style.backgroundColor },
        disabled && styles.disabled,
        small && styles.small,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, { color: style.color }, small && styles.smallLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: 12,
  },
});

