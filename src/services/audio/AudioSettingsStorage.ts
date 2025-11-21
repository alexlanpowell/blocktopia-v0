/**
 * Audio Settings Storage
 * Manages persistent audio settings using MMKV (local-first) + Supabase (cloud sync)
 * Follows existing service architecture patterns
 */

import { MMKV } from 'react-native-mmkv';
import { getSupabase } from '../backend/SupabaseClient';
import { useMonetizationStore } from '../../store/monetizationStore';
import AudioManager from './AudioManager';

export interface AudioSettings {
  musicVolume: number; // 0.0 - 1.0
  sfxVolume: number; // 0.0 - 1.0
  musicEnabled: boolean;
  sfxEnabled: boolean;
  currentMusicPack: string; // Cosmetic ID
}

const DEFAULT_SETTINGS: AudioSettings = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
  musicEnabled: true,
  sfxEnabled: true,
  currentMusicPack: 'default-saloon',
};

class AudioSettingsStorage {
  private static instance: AudioSettingsStorage;
  private storage: MMKV;
  private syncDebounceTimer: NodeJS.Timeout | null = null;
  private readonly SYNC_DEBOUNCE_MS = 500;

  private constructor() {
    this.storage = new MMKV({ id: 'audio-settings' });
  }

  static getInstance(): AudioSettingsStorage {
    if (!AudioSettingsStorage.instance) {
      AudioSettingsStorage.instance = new AudioSettingsStorage();
    }
    return AudioSettingsStorage.instance;
  }

  /**
   * Load settings from MMKV and apply to AudioManager
   */
  async loadSettings(): Promise<AudioSettings> {
    const settings: AudioSettings = {
      musicVolume: this.storage.getNumber('music_volume') ?? DEFAULT_SETTINGS.musicVolume,
      sfxVolume: this.storage.getNumber('sfx_volume') ?? DEFAULT_SETTINGS.sfxVolume,
      musicEnabled: this.storage.getBoolean('music_enabled') ?? DEFAULT_SETTINGS.musicEnabled,
      sfxEnabled: this.storage.getBoolean('sfx_enabled') ?? DEFAULT_SETTINGS.sfxEnabled,
      currentMusicPack:
        this.storage.getString('current_music_pack') ?? DEFAULT_SETTINGS.currentMusicPack,
    };

    // Apply to AudioManager
    AudioManager.setInitialSettings({
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
      musicEnabled: settings.musicEnabled,
      sfxEnabled: settings.sfxEnabled,
    });

    // Try to load from Supabase (non-blocking)
    this.loadFromSupabase().catch(() => {
      // Silent fail - local settings are primary
    });

    return settings;
  }

  /**
   * Save settings to MMKV and sync to Supabase
   */
  async saveSettings(settings: Partial<AudioSettings>): Promise<void> {
    // Save to MMKV (synchronous, instant)
    if (settings.musicVolume !== undefined) {
      this.storage.set('music_volume', settings.musicVolume);
      AudioManager.setMusicVolume(settings.musicVolume);
    }

    if (settings.sfxVolume !== undefined) {
      this.storage.set('sfx_volume', settings.sfxVolume);
      AudioManager.setSfxVolume(settings.sfxVolume);
    }

    if (settings.musicEnabled !== undefined) {
      this.storage.set('music_enabled', settings.musicEnabled);
      AudioManager.setMusicEnabled(settings.musicEnabled);
    }

    if (settings.sfxEnabled !== undefined) {
      this.storage.set('sfx_enabled', settings.sfxEnabled);
      AudioManager.setSfxEnabled(settings.sfxEnabled);
    }

    if (settings.currentMusicPack !== undefined) {
      this.storage.set('current_music_pack', settings.currentMusicPack);
    }

    // Debounced sync to Supabase
    this.debouncedSyncToSupabase();
  }

  /**
   * Get current settings from MMKV
   */
  getSettings(): AudioSettings {
    return {
      musicVolume: this.storage.getNumber('music_volume') ?? DEFAULT_SETTINGS.musicVolume,
      sfxVolume: this.storage.getNumber('sfx_volume') ?? DEFAULT_SETTINGS.sfxVolume,
      musicEnabled: this.storage.getBoolean('music_enabled') ?? DEFAULT_SETTINGS.musicEnabled,
      sfxEnabled: this.storage.getBoolean('sfx_enabled') ?? DEFAULT_SETTINGS.sfxEnabled,
      currentMusicPack:
        this.storage.getString('current_music_pack') ?? DEFAULT_SETTINGS.currentMusicPack,
    };
  }

  /**
   * Get music volume
   */
  getMusicVolume(): number {
    return this.storage.getNumber('music_volume') ?? DEFAULT_SETTINGS.musicVolume;
  }

  /**
   * Get SFX volume
   */
  getSfxVolume(): number {
    return this.storage.getNumber('sfx_volume') ?? DEFAULT_SETTINGS.sfxVolume;
  }

  /**
   * Check if music is enabled
   */
  isMusicEnabled(): boolean {
    return this.storage.getBoolean('music_enabled') ?? DEFAULT_SETTINGS.musicEnabled;
  }

  /**
   * Check if SFX is enabled
   */
  isSfxEnabled(): boolean {
    return this.storage.getBoolean('sfx_enabled') ?? DEFAULT_SETTINGS.sfxEnabled;
  }

  /**
   * Get current music pack ID
   */
  getCurrentMusicPack(): string {
    return this.storage.getString('current_music_pack') ?? DEFAULT_SETTINGS.currentMusicPack;
  }

  /**
   * Set music volume
   */
  async setMusicVolume(volume: number): Promise<void> {
    await this.saveSettings({ musicVolume: volume });
  }

  /**
   * Set SFX volume
   */
  async setSfxVolume(volume: number): Promise<void> {
    await this.saveSettings({ sfxVolume: volume });
  }

  /**
   * Set music enabled
   */
  async setMusicEnabled(enabled: boolean): Promise<void> {
    await this.saveSettings({ musicEnabled: enabled });
  }

  /**
   * Set SFX enabled
   */
  async setSfxEnabled(enabled: boolean): Promise<void> {
    await this.saveSettings({ sfxEnabled: enabled });
  }

  /**
   * Set current music pack
   */
  async setCurrentMusicPack(packId: string): Promise<void> {
    await this.saveSettings({ currentMusicPack: packId });
  }

  /**
   * Load settings from Supabase (non-blocking)
   */
  private async loadFromSupabase(): Promise<void> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;
      if (!userId) return;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('user_settings')
        .select('music_volume, sfx_volume, music_enabled, sfx_enabled')
        .eq('user_id', userId)
        .single();

      if (error || !data) return;

      // Merge Supabase settings with local (Supabase takes precedence if exists)
      const settings: Partial<AudioSettings> = {};

      if (data.music_volume !== null) {
        settings.musicVolume = parseFloat(data.music_volume);
      }
      if (data.sfx_volume !== null) {
        settings.sfxVolume = parseFloat(data.sfx_volume);
      }
      if (data.music_enabled !== null) {
        settings.musicEnabled = data.music_enabled;
      }
      if (data.sfx_enabled !== null) {
        settings.sfxEnabled = data.sfx_enabled;
      }

      if (Object.keys(settings).length > 0) {
        await this.saveSettings(settings);
      }
    } catch (error) {
      // Silent fail - local settings are primary
      if (__DEV__) {
        console.warn('Failed to load audio settings from Supabase:', error);
      }
    }
  }

  /**
   * Sync settings to Supabase (debounced)
   */
  private debouncedSyncToSupabase(): void {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    this.syncDebounceTimer = setTimeout(() => {
      this.syncToSupabase().catch(() => {
        // Silent fail
      });
    }, this.SYNC_DEBOUNCE_MS);
  }

  /**
   * Sync settings to Supabase
   */
  private async syncToSupabase(): Promise<void> {
    try {
      const store = useMonetizationStore.getState();
      const userId = store.user.userId;
      if (!userId) return;

      const settings = this.getSettings();
      const supabase = getSupabase();

      await supabase
        .from('user_settings')
        .update({
          music_volume: settings.musicVolume,
          sfx_volume: settings.sfxVolume,
          music_enabled: settings.musicEnabled,
          sfx_enabled: settings.sfxEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (__DEV__) {
        console.log('✅ Audio settings synced to Supabase');
      }
    } catch (error) {
      // Silent fail - local settings are primary
      if (__DEV__) {
        console.warn('Failed to sync audio settings to Supabase:', error);
      }
    }
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }
}

export const audioSettingsStorage = AudioSettingsStorage.getInstance();
export { AudioSettingsStorage };

