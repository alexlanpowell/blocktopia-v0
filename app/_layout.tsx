/**
 * Root Layout for Expo Router
 * Follows Apple HIG and Material Design principles
 * Initializes all monetization services
 */

import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, Image, AppState } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation, runOnJS } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { supabaseManager } from '../src/services/backend/SupabaseClient';
import { authService } from '../src/services/auth/AuthService';
import { analyticsService } from '../src/services/analytics/AnalyticsService';
import { enhancedAnalytics } from '../src/services/analytics/EnhancedAnalyticsService';
import { performanceMonitor } from '../src/utils/PerformanceMonitor';
// Import AudioManager for SYNCHRONOUS cleanup on unmount (prevents native crash)
import AudioManager from '../src/services/audio/AudioManager';
import { audioSettingsStorage } from '../src/services/audio/AudioSettingsStorage';
// DON'T import native modules here - lazy load to prevent crashes before React Native is ready:
// - adManager (Google Mobile Ads)
// - revenueCatService (RevenueCat)
// - premiumService (uses RevenueCat)
import { useMonetizationStore } from '../src/store/monetizationStore';
import { useGameStore } from '../src/store/gameStore';
import { validateConfig } from '../src/services/backend/config';

function LoadingSplash() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  React.useEffect(() => {
    // Store references to prevent multiple animation loops
    const scaleAnim = scale;
    const opacityAnim = opacity;
    
    // Gentle pulse animation
    scaleAnim.value = withRepeat(
      withTiming(1.05, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Gentle fade animation
    opacityAnim.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Cleanup: SYNCHRONOUSLY cancel animations and reset to stable values
    return () => {
      try {
        cancelAnimation(scaleAnim);
        cancelAnimation(opacityAnim);
        // Set to stable values to prevent any pending UI updates
        scaleAnim.value = 1;
        opacityAnim.value = 1;
      } catch (error) {
        // Ignore animation cleanup errors during hot reload
      }
    };
  }, []); // Empty deps - only run once on mount

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#0f1419' 
    }}>
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../assets/logo-full.png')}
          style={{
            width: 320,
            height: 100,
            resizeMode: 'contain',
          }}
        />
      </Animated.View>
    </View>
  );
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useSharedValue(1);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);
  // Track if component is unmounting to stop all new operations
  const isUnmountingRef = React.useRef(false);
  // Track auth listener unsubscribe function for cleanup
  const authUnsubscribeRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    isUnmountingRef.current = false;
    initializeApp();
    
    return () => {
      isUnmountingRef.current = true;
      isMountedRef.current = false;
      
      // Stop audio immediately
      try { AudioManager.forceStopImmediate(); } catch (e) {}
      
      // Clear audio settings pending timers
      try { audioSettingsStorage.cleanup(); } catch (e) {}
      
      // Cancel splash animation
      try {
        cancelAnimation(splashOpacity);
      } catch (e) {}
      
      // Cleanup auth listener
      if (authUnsubscribeRef.current) {
        try {
          authUnsubscribeRef.current();
          authUnsubscribeRef.current = null;
        } catch (e) {}
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      performanceMonitor.startMeasure('app_initialization');
      
      if (__DEV__) {
        console.log('🚀 Initializing Blocktopia...');
      }

      // Validate configuration (dev only)
      if (__DEV__) {
        const configValidation = validateConfig();
        if (!configValidation.valid) {
          console.warn('⚠️ Missing optional config:', configValidation.missing);
        }
      }

      // Initialize Supabase synchronously (required for auth)
      supabaseManager.initialize();

      // WAIT for auth/session checks AND user data to load before showing home screen
      // This prevents flickering between "Sign In" → "Guest" → actual username
      await Promise.all([
        authService.initialize(),
        (async () => {
          // Guard: Don't start if unmounting
          if (isUnmountingRef.current) return;
          
          // Check for existing session
          const session = await supabaseManager.getSession();
          
          // Only update state if component is still mounted
          if (!isMountedRef.current || isUnmountingRef.current) return;
          
          if (session) {
            const [profile, isAnonymous] = await Promise.all([
              authService.getUserProfile(),
              authService.isAnonymousUser()
            ]);
            
            // Check again before updating state
            if (!isMountedRef.current || isUnmountingRef.current) return;
            
            // Use direct store access to avoid stale closures
            useMonetizationStore.getState().setUser(profile);
            useMonetizationStore.getState().setAnonymous(isAnonymous);
            
            // CRITICAL: Wait for user data to load before showing home screen
            const userId = profile?.id || null;
            try {
              await useMonetizationStore.getState().loadFromBackend();
              // Background tasks that don't block UI
              Promise.all([
                useGameStore.getState().loadHighScore(userId),
                useGameStore.getState().syncHighScore(userId)
              ]).catch(err => {
                if (__DEV__) console.warn('Background sync failed:', err);
              });
            } catch (err) {
              if (__DEV__) console.warn('Failed to load user data:', err);
              // Continue anyway - app can work with default state
            }

          } else {
            // No existing session - auto-create anonymous account
            if (__DEV__) {
              console.log('🔄 Creating anonymous account...');
            }
            try {
              const anonymousResult = await authService.signInAnonymously();
              
              // Check if still mounted
              if (!isMountedRef.current || isUnmountingRef.current) return;
              
              if (anonymousResult.success && anonymousResult.user) {
                const profile = await authService.getUserProfile();
                
                // Final mount check before state updates
                if (!isMountedRef.current || isUnmountingRef.current) return;
                
                // Use direct store access to avoid stale closures
                useMonetizationStore.getState().setUser(profile);
                useMonetizationStore.getState().setAnonymous(true);
                useMonetizationStore.getState().setFirstLaunch(true);
                
                // CRITICAL: Wait for user data to load before showing home screen
                const userId = profile?.id || null;
                try {
                  await useMonetizationStore.getState().loadFromBackend();
                  // Background task that doesn't block UI
                  useGameStore.getState().loadHighScore(userId).catch(err => {
                    if (__DEV__) console.warn('Failed to load high score:', err);
                  });
                } catch (err) {
                  if (__DEV__) console.warn('Failed to load user data:', err);
                  // Continue anyway - app can work with default state
                }
              }
            } catch (error) {
              if (__DEV__) console.warn('Anonymous signin failed:', error);
            }
          }
        })()
      ]).catch(err => {
        if (__DEV__) console.warn('Auth initialization failed:', err);
        // Continue anyway - app can work offline
      });

      // Listen to auth changes and capture unsubscribe function
      authUnsubscribeRef.current = authService.onAuthStateChange(async (user) => {
        // Check if mounted before processing
        if (!isMountedRef.current || isUnmountingRef.current) return;
        
        if (user) {
          const [profile, isAnonymous] = await Promise.all([
            authService.getUserProfile(),
            authService.isAnonymousUser()
          ]);
          
          // Check again after async operations
          if (!isMountedRef.current || isUnmountingRef.current) return;
          
          // Use direct store access to avoid stale closures
          useMonetizationStore.getState().setUser(profile);
          useMonetizationStore.getState().setAnonymous(isAnonymous);
          
          // Load backend data in background (non-blocking)
          useMonetizationStore.getState().loadFromBackend().catch(err => {
            if (__DEV__) console.warn('Backend loading failed:', err);
          });
          analyticsService.logSignIn('session_restore');

          /*
          // Initialize/update RevenueCat for logged in user (lazy-loaded)
          if (profile?.id) {
            try {
              const { revenueCatService } = await import('../src/services/iap/RevenueCatService');
              if (!revenueCatService.isInitialized()) {
              await revenueCatService.initialize(profile.id);
              }
            } catch (error) {
              // Silent fail
              if (__DEV__) {
                console.warn('RevenueCat initialization failed (logged in):', error);
              }
            }
          }
          */
        } else {
          // Check if mounted before resetting
          if (!isMountedRef.current || isUnmountingRef.current) return;
          useMonetizationStore.getState().reset();
        }
      });

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


  // Deferred initialization of non-critical services (after first render)
  useEffect(() => {
    if (!initializing) {
      // Defer analytics initialization to improve startup time
      requestAnimationFrame(() => {
        // Guard: Don't start if unmounting
        if (isUnmountingRef.current) return;
        
        analyticsService.initialize().catch((err) => {
          if (__DEV__) console.warn('Deferred analytics init failed:', err);
        });
        enhancedAnalytics.startSession();
      });

      // Defer audio initialization (2 seconds delay for better startup)
      const audioTimer = setTimeout(async () => {
        if (isUnmountingRef.current) return;
        
        try {
          const { audioSettingsStorage } = await import('../src/services/audio/AudioSettingsStorage');
          await audioSettingsStorage.loadSettings();
          const AudioManager = (await import('../src/services/audio/AudioManager')).default;
          await AudioManager.initialize();
          if (audioSettingsStorage.isMusicEnabled()) {
            const { MusicTrack } = await import('../src/services/audio/AudioManager');
            const currentPack = audioSettingsStorage.getCurrentMusicPack();
            const musicTrackMap: Record<string, any> = {
              'none': MusicTrack.NONE,
              'default-saloon': MusicTrack.DEFAULT_SALOON,
            };
            const track = musicTrackMap[currentPack] || MusicTrack.DEFAULT_SALOON;
            if (track && track !== undefined && Object.values(MusicTrack).includes(track)) {
              await AudioManager.playMusic(track);
            }
          }
        } catch (error) {
          if (__DEV__) console.warn('Deferred audio init failed:', error);
        }
      }, 2000);

      // Defer remote config loading (1 second delay)
      const configTimer = setTimeout(async () => {
        // Guard: Don't start if unmounting
        if (isUnmountingRef.current) return;
        
        const { remoteConfig } = await import('../src/services/config/RemoteConfigService');
        remoteConfig.initialize().catch((err) => {
          if (__DEV__) console.warn('Deferred remote config init failed:', err);
        });
      }, 1000);

      return () => {
        clearTimeout(audioTimer);
        clearTimeout(configTimer);
      };
    }
  }, [initializing]);

  // Smooth fade-out animation when initialization completes
  useEffect(() => {
    if (!initializing && showSplash) {
      splashOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease)
      }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setShowSplash)(false);
        }
      });
    }
  }, [initializing, showSplash]);

  const splashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  if (error) {
    console.error('Initialization error:', error);
  }

  return (
    <>
      {children}

      {showSplash && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: '#0f1419',
            },
            splashAnimatedStyle,
          ]}
          pointerEvents={initializing ? 'auto' : 'none'}
        >
          <LoadingSplash />
        </Animated.View>
      )}
    </>
  );
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

