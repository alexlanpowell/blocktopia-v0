/**
 * Settings Screen Route
 * Full-screen settings page
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SettingsScreen } from '../src/rendering/screens/SettingsScreen';

export default function SettingsRoute() {
  return (
    <View style={styles.container}>
      <SettingsScreen
        visible={true}
        onClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

