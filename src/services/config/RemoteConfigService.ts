/**
 * Remote Config Service - Phase 9
 * Manages dynamic app configuration and feature flags
 */

import { getSupabase } from '../backend/SupabaseClient';
import { useMonetizationStore } from '../../store/monetizationStore';
import { enhancedAnalytics } from '../analytics/EnhancedAnalyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_CONFIG = '@remote_config_cache';
const STORAGE_KEY_FLAGS = '@feature_flags_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface RemoteConfigValue {
  key: string;
  value: any;
}

interface FeatureFlag {
  key: string;
  is_enabled: boolean;
  rollout_percentage: number;
  min_app_version?: string;
}

class RemoteConfigService {
  private static instance: RemoteConfigService | null = null;
  private config: Map<string, any> = new Map();
  private flags: Map<string, FeatureFlag> = new Map();
  private lastFetchTime: number = 0;
  private initialized: boolean = false;

  // Default values
  private defaults: Record<string, any> = {
    ad_interstitial_frequency: 3,
    daily_reward_gems: 50,
    welcome_bonus_gems: 100,
    game_difficulty_multiplier: 1.0,
    iap_gem_pack_bonus_percent: 0,
  };

  private flagDefaults: Record<string, boolean> = {
    enable_ads: true,
    enable_new_shop_ui: true,
    enable_holiday_theme: false,
    maintenance_mode: false,
  };

  private constructor() {}

  static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load from cache first
      await this.loadFromCache();
      
      // Fetch fresh in background
      this.fetchConfig().catch(console.error);
      
      this.initialized = true;
      console.log('✅ Remote Config initialized');
    } catch (error) {
      console.error('Remote Config init failed:', error);
    }
  }

  /**
   * Fetch fresh config from Supabase
   */
  async fetchConfig(): Promise<void> {
    try {
      const supabase = getSupabase();
      
      // Fetch Config
      const { data: configData, error: configError } = await supabase
        .from('remote_config')
        .select('key, value');

      if (configError) throw configError;

      if (configData) {
        configData.forEach((item: RemoteConfigValue) => {
          this.config.set(item.key, item.value);
        });
      }

      // Fetch Flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*');

      if (flagsError) throw flagsError;

      if (flagsData) {
        flagsData.forEach((item: FeatureFlag) => {
          this.flags.set(item.key, item);
        });
      }

      this.lastFetchTime = Date.now();
      await this.saveToCache();
      
      console.log('🔄 Remote Config updated');
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
    }
  }

  /**
   * Get config value with type safety
   */
  getValue<T>(key: string): T {
    if (this.config.has(key)) {
      return this.config.get(key) as T;
    }
    return (this.defaults[key] ?? null) as T;
  }

  /**
   * Get number config
   */
  getNumber(key: string): number {
    const val = this.getValue<any>(key);
    return Number(val) || 0;
  }

  /**
   * Get string config
   */
  getString(key: string): string {
    return String(this.getValue(key));
  }

  /**
   * Get boolean config
   */
  getBoolean(key: string): boolean {
    return Boolean(this.getValue(key));
  }

  /**
   * Check if feature is enabled
   * Handles rollout percentage and app version checks
   */
  isFeatureEnabled(key: string): boolean {
    // 1. Check defaults if not found
    if (!this.flags.has(key)) {
      return this.flagDefaults[key] ?? false;
    }

    const flag = this.flags.get(key)!;

    // 2. Global switch
    if (!flag.is_enabled) return false;

    // 3. Rollout Percentage
    if (flag.rollout_percentage < 100) {
      const userId = useMonetizationStore.getState().user.userId;
      if (userId) {
        // Deterministic hash of userId + key to 0-100
        const hash = this.hashString(userId + key);
        if (hash > flag.rollout_percentage) {
          return false;
        }
      }
    }

    // 4. App Version check (simplified)
    if (flag.min_app_version) {
      // Implement version comparison logic here
      // For now assuming version is compatible
    }

    return true;
  }

  /**
   * Force refresh (e.g. for admin dashboard)
   */
  async forceRefresh(): Promise<void> {
    await this.fetchConfig();
  }

  // --- Cache Management ---

  private async loadFromCache(): Promise<void> {
    try {
      const [configStr, flagsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_CONFIG),
        AsyncStorage.getItem(STORAGE_KEY_FLAGS),
      ]);

      if (configStr) {
        const configObj = JSON.parse(configStr);
        Object.entries(configObj).forEach(([k, v]) => this.config.set(k, v));
      }

      if (flagsStr) {
        const flagsObj = JSON.parse(flagsStr);
        Object.entries(flagsObj).forEach(([k, v]) => this.flags.set(k, v as FeatureFlag));
      }
    } catch (e) {
      console.warn('Failed to load remote config cache');
    }
  }

  private async saveToCache(): Promise<void> {
    try {
      const configObj = Object.fromEntries(this.config);
      const flagsObj = Object.fromEntries(this.flags);
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configObj)),
        AsyncStorage.setItem(STORAGE_KEY_FLAGS, JSON.stringify(flagsObj)),
      ]);
    } catch (e) {
      console.warn('Failed to save remote config cache');
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }
}

export const remoteConfig = RemoteConfigService.getInstance();
export { RemoteConfigService };

