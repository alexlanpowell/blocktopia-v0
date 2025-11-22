/**
 * Audio Controls Component
 * Beautiful audio settings UI following Apple HIG and Material Design
 * Provides separate controls for music and sound effects
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { audioSettingsStorage } from '../../services/audio/AudioSettingsStorage';
import { SoundEffect } from '../../services/audio/AudioManager';

export function AudioControls() {
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const settings = audioSettingsStorage.getSettings();
    setMusicVolume(settings.musicVolume);
    setSfxVolume(settings.sfxVolume);
    setMusicEnabled(settings.musicEnabled);
    setSfxEnabled(settings.sfxEnabled);
  }, []);

  // Music toggle handler
  const handleMusicToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Play sound (dynamic import)
    import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    }).catch(() => {});
    
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    await audioSettingsStorage.setMusicEnabled(newValue);
  }, [musicEnabled]);

  // SFX toggle handler
  const handleSfxToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Play sound before disabling (if currently enabled) (dynamic import)
    if (sfxEnabled) {
      import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
        AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
      }).catch(() => {});
    }
    
    const newValue = !sfxEnabled;
    setSfxEnabled(newValue);
    await audioSettingsStorage.setSfxEnabled(newValue);
  }, [sfxEnabled]);

  // Music volume handler - VISUAL FEEDBACK ONLY (while dragging)
  const handleMusicVolumeChange = useCallback((value: number) => {
    setMusicVolume(value);
    // Just update AudioManager volume in real-time for immediate feedback (dynamic import)
    import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
      AudioManager.setMusicVolume(value);
    }).catch(() => {});
  }, []);

  // Music volume complete - SAVE & LOG (when released)
  const handleMusicVolumeComplete = useCallback(async (value: number) => {
    // Save to storage (triggers analytics)
    await audioSettingsStorage.setMusicVolume(value);
    // Play test sound (dynamic import)
    if (sfxEnabled) {
      import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
        AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP, 0.5);
      }).catch(() => {});
    }
  }, [sfxEnabled]);

  // SFX volume handler - VISUAL FEEDBACK ONLY (while dragging)
  const handleSfxVolumeChange = useCallback((value: number) => {
    setSfxVolume(value);
    // Just update AudioManager volume in real-time for immediate feedback (dynamic import)
    import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
      AudioManager.setSfxVolume(value);
    }).catch(() => {});
  }, []);

  // SFX volume complete - SAVE & LOG (when released)
  const handleSfxVolumeComplete = useCallback(async (value: number) => {
    // Save to storage (triggers analytics)
    await audioSettingsStorage.setSfxVolume(value);
    // Play test sound (dynamic import)
    import('../../services/audio/AudioManager').then(({ default: AudioManager }) => {
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP, 0.5);
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      {/* Music Controls */}
      <View style={styles.controlCard}>
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
          <View style={styles.controlRow}>
            {/* Toggle Button */}
            <TouchableOpacity
              onPress={handleMusicToggle}
              style={styles.toggleButton}
              activeOpacity={0.7}
              accessibilityLabel={musicEnabled ? 'Disable music' : 'Enable music'}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={musicEnabled 
                  ? [COLORS.primary.cyan, COLORS.primary.purple]
                  : [COLORS.ui.textSecondary, COLORS.ui.textSecondary]
                }
                style={styles.toggleGradient}
              >
                <Text style={styles.toggleIcon}>
                  {musicEnabled ? '🎵' : '🔇'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Label */}
            <Text style={styles.label}>Music</Text>

            {/* Volume Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={musicVolume}
                onValueChange={handleMusicVolumeChange}
                onSlidingComplete={handleMusicVolumeComplete}
                minimumTrackTintColor={COLORS.primary.cyan}
                maximumTrackTintColor={COLORS.ui.cardBorder}
                thumbTintColor={COLORS.primary.cyan}
                disabled={!musicEnabled}
                accessibilityLabel="Music volume"
                accessibilityRole="adjustable"
              />
            </View>

            {/* Percentage */}
            <Text style={[styles.percentage, !musicEnabled && styles.disabled]}>
              {Math.round(musicVolume * 100)}%
            </Text>
          </View>
        </BlurView>
      </View>

      {/* SFX Controls */}
      <View style={styles.controlCard}>
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
          <View style={styles.controlRow}>
            {/* Toggle Button */}
            <TouchableOpacity
              onPress={handleSfxToggle}
              style={styles.toggleButton}
              activeOpacity={0.7}
              accessibilityLabel={sfxEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={sfxEnabled 
                  ? [COLORS.accent.success, COLORS.primary.cyan]
                  : [COLORS.ui.textSecondary, COLORS.ui.textSecondary]
                }
                style={styles.toggleGradient}
              >
                <Text style={styles.toggleIcon}>
                  {sfxEnabled ? '🔊' : '🔇'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Label */}
            <Text style={styles.label}>Sound Effects</Text>

            {/* Volume Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={sfxVolume}
                onValueChange={handleSfxVolumeChange}
                onSlidingComplete={handleSfxVolumeComplete}
                minimumTrackTintColor={COLORS.accent.success}
                maximumTrackTintColor={COLORS.ui.cardBorder}
                thumbTintColor={COLORS.accent.success}
                disabled={!sfxEnabled}
                accessibilityLabel="Sound effects volume"
                accessibilityRole="adjustable"
              />
            </View>

            {/* Percentage */}
            <Text style={[styles.percentage, !sfxEnabled && styles.disabled]}>
              {Math.round(sfxVolume * 100)}%
            </Text>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  controlCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardBlur: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  toggleButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  toggleGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '600',
    color: COLORS.ui.text,
    minWidth: 100,
  },
  sliderContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ui.text,
    minWidth: 40,
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.5,
  },
});

