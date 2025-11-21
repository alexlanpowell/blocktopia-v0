/**
 * Root Layout for Expo Router
 * Follows Apple HIG and Material Design principles
 * Initializes all monetization services
 */

import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, ActivityIndicator, AppState } from 'react-native';
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
import { useGameStore } from '../src/store/gameStore';
import { validateConfig } from '../src/services/backend/config';
import { remoteConfig } from '../src/services/config/RemoteConfigService';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setUser = useMonetizationStore(state => state.setUser);
  const loadFromBackend = useMonetizationStore(state => state.loadFromBackend);
  const loadHighScore = useGameStore(state => state.loadHighScore);
  const syncHighScore = useGameStore(state => state.syncHighScore);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      performanceMonitor.startMeasure('app_initialization');
      
      if (__DEV__) {
        console.log('🚀 Initializing Blocktopia...');
      }

      // Validate configuration
      const configValidation = validateConfig();
      if (!configValidation.valid && __DEV__) {
        console.warn('⚠️ Missing optional config:', configValidation.missing);
      }

      // Initialize core services in parallel where possible
      const initPromises: Promise<void>[] = [];

      // Initialize Supabase
      supabaseManager.initialize();

      // Initialize Auth Service
      initPromises.push(authService.initialize());

      // Initialize Analytics
      initPromises.push(analyticsService.initialize());

      // Initialize Remote Config
      initPromises.push(remoteConfig.initialize());

      // Initialize Audio Settings Storage (load from MMKV)
      const { audioSettingsStorage } = await import('../src/services/audio/AudioSettingsStorage');
      await audioSettingsStorage.loadSettings();

      // Initialize Audio Manager (preload SFX)
      const AudioManager = (await import('../src/services/audio/AudioManager')).default;
      initPromises.push(
        AudioManager.initialize().catch((error) => {
          if (__DEV__) {
            console.warn('Audio initialization failed:', error);
          }
          // Non-critical, continue app launch
        })
      );

      // Initialize Ad Manager (non-blocking)
      initPromises.push(
        adManager.initialize().catch((error) => {
          // Silent fail - non-critical for app startup
        })
      );

      // Wait for core services
      await Promise.all(initPromises);

      // Check for existing session
      const session = await supabaseManager.getSession();
      if (session) {
        const profile = await authService.getUserProfile();
        setUser(profile);
        
        // Check if user is anonymous
        const isAnonymous = await authService.isAnonymousUser();
        useMonetizationStore.getState().setAnonymous(isAnonymous);
        
        await loadFromBackend();

        // Load persistent high score
        const userId = profile?.id || null;
        await loadHighScore(userId);
        // Retry sync if there was an unsynced score
        await syncHighScore(userId);

        // Start default background music if enabled
        const { audioSettingsStorage } = await import('../src/services/audio/AudioSettingsStorage');
        const AudioManager = (await import('../src/services/audio/AudioManager')).default;
        const { MusicTrack } = await import('../src/services/audio/AudioManager');
        
        if (audioSettingsStorage.isMusicEnabled()) {
          const currentPack = audioSettingsStorage.getCurrentMusicPack();
          const musicTrackMap: Record<string, any> = {
            'none': MusicTrack.NONE,
            'ambient': MusicTrack.AMBIENT,
            'default-saloon': MusicTrack.DEFAULT_SALOON,
            'electronic': MusicTrack.ELECTRONIC,
          };
          const track = musicTrackMap[currentPack] || MusicTrack.DEFAULT_SALOON;
          
          AudioManager.playMusic(track).catch((err: any) => {
            if (__DEV__) console.warn('Failed to start music:', err);
          });
        }

        // Initialize RevenueCat with user ID (non-blocking)
        if (profile?.id) {
          try {
            await revenueCatService.initialize(profile.id);
            await premiumService.initialize();
          } catch (error) {
            // Silent fail - non-critical for app startup
          }
        }
      } else {
        // No existing session - auto-create anonymous account for tracking
        if (__DEV__) {
          console.log('🔄 Creating anonymous account...');
        }
        try {
          const anonymousResult = await authService.signInAnonymously();
          if (anonymousResult.success && anonymousResult.user) {
            const profile = await authService.getUserProfile();
            setUser(profile);
            
            // Mark as anonymous
            useMonetizationStore.getState().setAnonymous(true);
            
            await loadFromBackend();
            
            // Load persistent high score
            const userId = profile?.id || null;
            await loadHighScore(userId);
            
            // Mark as first launch for welcome message
            useMonetizationStore.getState().setFirstLaunch(true);
            
            // Start default background music if enabled
            const { audioSettingsStorage } = await import('../src/services/audio/AudioSettingsStorage');
            const AudioManager = (await import('../src/services/audio/AudioManager')).default;
            const { MusicTrack } = await import('../src/services/audio/AudioManager');
            
            if (audioSettingsStorage.isMusicEnabled()) {
              const currentPack = audioSettingsStorage.getCurrentMusicPack();
              const musicTrackMap: Record<string, any> = {
                'none': MusicTrack.NONE,
                'ambient': MusicTrack.AMBIENT,
                'default-saloon': MusicTrack.DEFAULT_SALOON,
                'electronic': MusicTrack.ELECTRONIC,
              };
              const track = musicTrackMap[currentPack] || MusicTrack.DEFAULT_SALOON;
              
              AudioManager.playMusic(track).catch((err: any) => {
                if (__DEV__) console.warn('Failed to start music:', err);
              });
            }
            
            // Initialize RevenueCat with anonymous user ID (non-blocking)
            if (profile?.id) {
              try {
                await revenueCatService.initialize(profile.id);
              } catch (error) {
                // Silent fail
              }
            }
          }
        } catch (error) {
          // Continue anyway - app can work without account (offline mode)
        }
      }

      // Listen to auth changes
      authService.onAuthStateChange(async (user) => {
        if (user) {
          const profile = await authService.getUserProfile();
          setUser(profile);
          
          // Check if user is anonymous
          const isAnonymous = await authService.isAnonymousUser();
          useMonetizationStore.getState().setAnonymous(isAnonymous);
          
          await loadFromBackend();
          analyticsService.logSignIn('session_restore');

          // Initialize/update RevenueCat for logged in user
          if (profile?.id && !revenueCatService.isInitialized()) {
            try {
              await revenueCatService.initialize(profile.id);
            } catch (error) {
              // Silent fail
            }
          }
        } else {
          useMonetizationStore.getState().reset();
        }
      });

      // Start analytics session
      enhancedAnalytics.startSession();
      
      // End performance measurement
      const initTime = performanceMonitor.endMeasure('app_initialization');
      
      if (__DEV__ && initTime !== null) {
        console.log(`✅ App initialized (${initTime}ms)`);
      } else if (__DEV__) {
        console.log('✅ App initialized');
      }
    } catch (err: any) {
      console.error('❌ App initialization error:', err);
      setError(err.message);
      performanceMonitor.endMeasure('app_initialization');
    } finally {
      setInitializing(false);
    }
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const AudioManager = (await import('../src/services/audio/AudioManager')).default;
      
      if (nextAppState === 'background') {
        // Pause music when app goes to background
        AudioManager.pauseMusic();
      } else if (nextAppState === 'active') {
        // Resume music when app comes back to foreground
        AudioManager.resumeMusic();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup audio resources
      import('../src/services/audio/AudioManager').then(({ default: AudioManager }) => {
        AudioManager.cleanup();
      });
    };
  }, []);

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
              <Stack.Screen 
                name="settings"
                options={{
                  presentation: Platform.OS === 'ios' ? 'modal' : 'card',
                }}
              />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="terms" />
            </Stack>
          </AppInitializer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

