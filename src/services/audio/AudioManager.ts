/**
 * Audio Manager - Handles all sound effects and background music
 * Integrates with cosmetics system for music packs
 * Singleton pattern matching existing service architecture
 */

import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { analyticsService } from '../analytics/AnalyticsService';
import { performanceMonitor } from '../../utils/PerformanceMonitor';

// Type declaration for require (used for asset loading)
declare const require: {
  (path: string): any;
};

export enum SoundEffect {
  PIECE_PICKUP = 'piece_pickup',
  PIECE_PLACE = 'piece_place',
  PIECE_INVALID = 'piece_invalid',
  LINE_CLEAR = 'line_clear',
  MULTI_LINE_CLEAR = 'multi_line_clear',
  GAME_OVER = 'game_over',
  BUTTON_TAP = 'button_tap',
  POWER_UP_USE = 'power_up_use',
  PURCHASE_SUCCESS = 'purchase_success',
  GEM_COLLECT = 'gem_collect',
}

export enum MusicTrack {
  NONE = 'none',
  AMBIENT = 'ambient',
  DEFAULT_SALOON = 'default-saloon',
  ELECTRONIC = 'electronic',
}

class AudioManager {
  private static instance: AudioManager;
  private soundEffects: Map<SoundEffect, Sound> = new Map();
  private currentMusic: Sound | null = null;
  private musicVolume: number = 0.6;
  private sfxVolume: number = 0.8;
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;
  private currentTrack: MusicTrack = MusicTrack.NONE;
  private initialized: boolean = false;
  private isPaused: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      performanceMonitor.startMeasure('audio_initialization');

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Preload sound effects
      await this.preloadSoundEffects();

      this.initialized = true;

      const initTime = performanceMonitor.endMeasure('audio_initialization');
      if (__DEV__ && initTime !== null) {
        console.log(`✅ Audio initialized (${initTime}ms)`);
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      // Non-critical, continue without audio
    }
  }

  /**
   * Get sound map with optional file loading (graceful degradation)
   */
  private getSoundMap(): Partial<Record<SoundEffect, any>> {
    const sounds: Partial<Record<SoundEffect, any>> = {};
    
    // Try to load each sound effect, silently skip if file doesn't exist
    // MISSING ASSETS: Commented out to prevent build/runtime errors
    // try { sounds[SoundEffect.PIECE_PICKUP] = require('../../../assets/sounds/piece_pickup.mp3'); } catch {} 
    try { sounds[SoundEffect.PIECE_PLACE] = require('../../../assets/sounds/piece_place.mp3'); } catch {}
    // try { sounds[SoundEffect.PIECE_INVALID] = require('../../../assets/sounds/piece_invalid.mp3'); } catch {} 
    try { sounds[SoundEffect.LINE_CLEAR] = require('../../../assets/sounds/line_clear.mp3'); } catch {}
    try { sounds[SoundEffect.MULTI_LINE_CLEAR] = require('../../../assets/sounds/multi_line_clear.mp3'); } catch {}
    try { sounds[SoundEffect.GAME_OVER] = require('../../../assets/sounds/game_over.mp3'); } catch {}
    try { sounds[SoundEffect.BUTTON_TAP] = require('../../../assets/sounds/button_tap.mp3'); } catch {}
    try { sounds[SoundEffect.POWER_UP_USE] = require('../../../assets/sounds/power_up.mp3'); } catch {}
    try { sounds[SoundEffect.PURCHASE_SUCCESS] = require('../../../assets/sounds/purchase.mp3'); } catch {}
    // try { sounds[SoundEffect.GEM_COLLECT] = require('../../../assets/sounds/gem.mp3'); } catch {} 
    
    return sounds;
  }

  /**
   * Preload all sound effects for zero-latency playback
   */
  private async preloadSoundEffects(): Promise<void> {
    const soundMap = this.getSoundMap();

    const loadPromises = Object.entries(soundMap).map(async ([effect, source]) => {
      if (!source) return; // Skip if file doesn't exist
      
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: this.sfxVolume,
          shouldPlay: false,
        });
        this.soundEffects.set(effect as SoundEffect, sound);
      } catch (error) {
        // Graceful degradation - log but don't fail
        if (__DEV__) {
          console.warn(`Failed to load sound effect ${effect}:`, error);
        }
      }
    });

    await Promise.all(loadPromises);
    
    if (__DEV__) {
      const loadedCount = this.soundEffects.size;
      console.log(`🔊 Loaded ${loadedCount}/10 sound effects`);
    }
  }

  /**
   * Play a sound effect
   */
  async playSoundEffect(
    effect: SoundEffect,
    volumeMultiplier: number = 1.0
  ): Promise<void> {
    if (!this.isSfxEnabled || !this.initialized) return;

    const sound = this.soundEffects.get(effect);
    if (!sound) {
      if (__DEV__) {
        // Only warn for non-missing effects (optional check logic could be added)
        // console.warn(`Sound effect ${effect} not found`);
      }
      return;
    }

    try {
      // Reset to start and set volume
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(this.sfxVolume * volumeMultiplier);
      await sound.playAsync();
    } catch (error) {
      // Silent fail - audio errors shouldn't break the game
      if (__DEV__) {
        console.error(`Failed to play sound effect ${effect}:`, error);
      }
    }
  }

  /**
   * Get music source with optional file loading (graceful degradation)
   */
  private getMusicSource(track: MusicTrack): any | null {
    if (track === MusicTrack.NONE) return null;
    
    try {
      switch (track) {
        case MusicTrack.AMBIENT:
          return require('../../../assets/music/ambient.mp3');
        case MusicTrack.DEFAULT_SALOON:
          return require('../../../assets/music/default-saloon.mp3');
        case MusicTrack.ELECTRONIC:
          return require('../../../assets/music/electronic.mp3');
        default:
          return null;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn(`Music file not found for track ${track}`);
      }
      return null;
    }
  }

  /**
   * Play background music (loops automatically)
   */
  async playMusic(track: MusicTrack): Promise<void> {
    // Defensive check: validate track parameter
    if (!track || track === undefined) {
      console.error('[AudioManager] Invalid music track provided:', track);
      return;
    }
    
    if (track === MusicTrack.NONE || !this.isMusicEnabled) {
      await this.stopMusic();
      return;
    }

    // If already playing this track, do nothing
    if (this.currentTrack === track && this.currentMusic && !this.isPaused) {
      return;
    }

    // Stop current music
    await this.stopMusic();

    const source = this.getMusicSource(track);
    if (!source) {
      if (__DEV__) {
        console.warn(`Cannot play music: ${track} file not found`);
      }
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume: this.musicVolume,
      });

      this.currentMusic = sound;
      this.currentTrack = track;
      this.isPaused = false;

      await sound.playAsync();

      // Analytics
      analyticsService.logEvent('audio_music_track_changed', {
        track,
        source: 'user_action',
      });
    } catch (error) {
      console.error(`Failed to play music track ${track}:`, error);
      this.currentMusic = null;
      this.currentTrack = MusicTrack.NONE;
    }
  }

  /**
   * Stop background music
   */
  async stopMusic(): Promise<void> {
    if (!this.currentMusic) return;

    try {
      await this.currentMusic.stopAsync();
      await this.currentMusic.unloadAsync();
      this.currentMusic = null;
      this.currentTrack = MusicTrack.NONE;
      this.isPaused = false;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to stop music:', error);
      }
    }
  }

  /**
   * Pause music (for app backgrounding)
   */
  async pauseMusic(): Promise<void> {
    if (!this.currentMusic || this.isPaused) return;

    try {
      await this.currentMusic.pauseAsync();
      this.isPaused = true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to pause music:', error);
      }
    }
  }

  /**
   * Resume music (for app foregrounding)
   */
  async resumeMusic(): Promise<void> {
    if (!this.currentMusic || !this.isPaused || !this.isMusicEnabled) return;

    try {
      await this.currentMusic.playAsync();
      this.isPaused = false;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to resume music:', error);
      }
    }
  }


  /**
   * Set music volume (0.0 - 1.0)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic && !this.isPaused) {
      this.currentMusic.setVolumeAsync(this.musicVolume).catch(() => {
        // Silent fail
      });
    }

    // Analytics
    analyticsService.logEvent('audio_music_volume_changed', {
      volume: this.musicVolume,
    });
  }

  /**
   * Set SFX volume (0.0 - 1.0)
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));

    // Update all loaded sound effects
    this.soundEffects.forEach(sound => {
      sound.setVolumeAsync(this.sfxVolume).catch(() => {
        // Silent fail
      });
    });

    // Analytics
    analyticsService.logEvent('audio_sfx_volume_changed', {
      volume: this.sfxVolume,
    });
  }

  /**
   * Enable/disable music
   */
  setMusicEnabled(enabled: boolean): void {
    this.isMusicEnabled = enabled;

    if (!enabled) {
      this.stopMusic();
    } else if (this.currentTrack !== MusicTrack.NONE) {
      // Resume current track if it was playing
      this.playMusic(this.currentTrack);
    }

    // Analytics
    analyticsService.logEvent('audio_music_toggled', {
      enabled: this.isMusicEnabled,
    });
  }

  /**
   * Enable/disable sound effects
   */
  setSfxEnabled(enabled: boolean): void {
    this.isSfxEnabled = enabled;

    // Analytics
    analyticsService.logEvent('audio_sfx_toggled', {
      enabled: this.isSfxEnabled,
    });
  }

  /**
   * Get current music volume
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get current SFX volume
   */
  getSfxVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Check if music is enabled
   */
  isMusicOn(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Check if SFX is enabled
   */
  isSfxOn(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Get currently playing track
   */
  getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  /**
   * Set initial settings (called from storage on load)
   */
  setInitialSettings(settings: {
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
  }): void {
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
    this.isMusicEnabled = settings.musicEnabled;
    this.isSfxEnabled = settings.sfxEnabled;
  }

  /**
   * Cleanup audio resources
   */
  async cleanup(): Promise<void> {
    await this.stopMusic();

    const unloadPromises = Array.from(this.soundEffects.values()).map(sound =>
      sound.unloadAsync().catch(() => {
        // Silent fail
      })
    );

    await Promise.all(unloadPromises);
    this.soundEffects.clear();
    this.initialized = false;
  }
}

export default AudioManager.getInstance();
