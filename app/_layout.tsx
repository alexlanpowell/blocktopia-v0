/**
 * Root Layout for Expo Router
 * Follows Apple HIG and Material Design principles
 * Initializes all monetization services
 */

import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { supabaseManager } from '../src/services/backend/SupabaseClient';
import { authService } from '../src/services/auth/AuthService';
import { analyticsService } from '../src/services/analytics/AnalyticsService';
import { enhancedAnalytics } from '../src/services/analytics/EnhancedAnalyticsService';
import { performanceMonitor } from '../src/utils/PerformanceMonitor';
import { adManager } from '../src/services/ads/AdManager';
import { revenueCatService } from '../src/services/iap/RevenueCatService';
import { premiumService } from '../src/services/subscription/PremiumService';
import { useMonetizationStore } from '../src/store/monetizationStore';
import { validateConfig } from '../src/services/backend/config';
import { remoteConfig } from '../src/services/config/RemoteConfigService';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setUser = useMonetizationStore(state => state.setUser);
  const loadFromBackend = useMonetizationStore(state => state.loadFromBackend);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      performanceMonitor.startMeasure('app_initialization');
      console.log('🚀 Initializing Blocktopia monetization system...');

      // Validate configuration
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        console.warn('⚠️ Missing config:', configValidation.missing);
        // Don't block app for missing optional configs
      }

      // Initialize Supabase
      supabaseManager.initialize();
      console.log('✅ Supabase initialized');

      // Initialize Auth Service
      await authService.initialize();
      console.log('✅ Auth service initialized');

      // Initialize Analytics
      await analyticsService.initialize();
      console.log('✅ Analytics initialized');

      // Initialize Remote Config
      await remoteConfig.initialize();
      console.log('✅ Remote Config initialized');

      // Initialize Ad Manager
      try {
        await adManager.initialize();
        console.log('✅ AdMob initialized');
      } catch (error) {
        console.warn('⚠️ AdMob initialization failed (non-blocking):', error);
        // Non-blocking - app can continue without ads
      }

      // Check for existing session
      const session = await supabaseManager.getSession();
      if (session) {
        console.log('✅ Found existing session');
        const profile = await authService.getUserProfile();
        setUser(profile);
        await loadFromBackend();

        // Initialize RevenueCat with user ID
        if (profile?.id) {
          try {
            await revenueCatService.initialize(profile.id);
            console.log('✅ RevenueCat initialized');
            
            // Initialize Premium Service
            await premiumService.initialize();
            console.log('✅ PremiumService initialized');
          } catch (error) {
            console.warn('⚠️ RevenueCat initialization failed (non-blocking):', error);
          }
        }
      }

      // Listen to auth changes
      authService.onAuthStateChange(async (user) => {
        if (user) {
          const profile = await authService.getUserProfile();
          setUser(profile);
          await loadFromBackend();
          analyticsService.logSignIn('session_restore');

          // Initialize/update RevenueCat for logged in user
          if (profile?.id && !revenueCatService.isInitialized()) {
            try {
              await revenueCatService.initialize(profile.id);
            } catch (error) {
              console.warn('RevenueCat init failed:', error);
            }
          }
        } else {
          useMonetizationStore.getState().reset();
        }
      });

      console.log('✅ App initialization complete');
      
      // Start analytics session
      enhancedAnalytics.startSession();
      
      // End performance measurement
      performanceMonitor.endMeasure('app_initialization');
    } catch (err: any) {
      console.error('❌ App initialization error:', err);
      setError(err.message);
      performanceMonitor.endMeasure('app_initialization');
    } finally {
      setInitializing(false);
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1419' }}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (error) {
    // Log error but don't block app
    console.error('Initialization error:', error);
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppInitializer>
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
          </AppInitializer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

