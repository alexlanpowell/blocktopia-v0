/**
 * Confirm Dialog - Modal confirmation dialog
 * Used for destructive actions in Admin Dashboard
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../utils/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  const confirmColor = variant === 'danger' ? COLORS.accent.error : COLORS.accent.warning;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blur}>
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: confirmColor }]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blur: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  container: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    minWidth: 280,
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.ui.text,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
  },
  cancelText: {
    color: COLORS.ui.text,
    fontWeight: '600',
  },
  confirmText: {
    color: COLORS.ui.text,
    fontWeight: '600',
  },
});

