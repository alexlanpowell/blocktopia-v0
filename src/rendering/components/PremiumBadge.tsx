/**
 * Premium Badge Component - Displays premium crown indicator
 * Shows in header and throughout app for premium users
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useIsPremium } from '../../store/monetizationStore';

export function PremiumBadge() {
  const isPremium = useIsPremium();

  if (!isPremium) {
    return null;
  }

  return <Text style={styles.badge}>👑</Text>;
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 20,
    marginLeft: 4,
  },
});

