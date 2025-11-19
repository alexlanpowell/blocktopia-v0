/**
 * Root Layout for Expo Router
 * Follows Apple HIG and Material Design principles
 */

import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#0f1419"
          translucent={Platform.OS === 'android'}
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f1419' },
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="game" />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

