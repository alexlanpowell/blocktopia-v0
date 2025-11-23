/**
 * Monetization Store - Zustand
 * Centralized state management for all monetization features
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getSupabase, supabaseManager } from '../services/backend/SupabaseClient';
import { authService, type UserProfile } from '../services/auth/AuthService';
import { optimizationService } from '../services/optimization/OptimizationService';

// Power-Up Types
export enum PowerUpType {
  MAGIC_WAND = 'magic_wand',
  PIECE_SWAP = 'piece_swap',
  UNDO_MOVE = 'undo_move',
  LINE_BLASTER = 'line_blaster',
}

// Cosmetic Types
export enum CosmeticType {
  BLOCK_SKIN = 'block_skin',
  BOARD_THEME = 'board_theme',
  MUSIC_PACK = 'music_pack',
  PARTICLE_EFFECT = 'particle_effect',
}

// Power-Up Inventory
interface PowerUpsInventory {
  [PowerUpType.MAGIC_WAND]: number;
  [PowerUpType.PIECE_SWAP]: number;
  [PowerUpType.UNDO_MOVE]: number;
  [PowerUpType.LINE_BLASTER]: number;
}

// Active Cosmetics
interface ActiveCosmetics {
  [CosmeticType.BLOCK_SKIN]: string;
  [CosmeticType.BOARD_THEME]: string;
  [CosmeticType.MUSIC_PACK]: string | null;
  [CosmeticType.PARTICLE_EFFECT]: string | null;
}

// User State
interface UserState {
  userId: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
}

// Ad State
interface AdState {
  adFreePurchased: boolean;
  canShowInterstitial: boolean;
  lastInterstitialTimestamp: number;
  interstitialGameCount: number;
  interstitialFrequency: number; // Show every N games
}

// Daily Reward State
interface DailyRewardState {
  lastClaimedGems: string | null; // ISO date string
  lastClaimedPowerUps: string | null; // ISO date string
  streak: number;
}

// Monetization Store Interface
interface MonetizationStore {
  // User State
  user: UserState;
  
  // Currency
  gems: number;
  
  // Premium Status
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  
  // Ad State
  adState: AdState;
  
  // Daily Rewards
  dailyReward: DailyRewardState;
  
  // Power-Ups
  powerUps: PowerUpsInventory;
  
  // Cosmetics
  ownedCosmetics: string[];
  activeCosmetics: ActiveCosmetics;
  
  // Initialization
  initialized: boolean;
  firstLaunch: boolean;
  
  // Actions - User
  setUser: (profile: UserProfile | null) => void;
  setAnonymous: (isAnonymous: boolean) => void;
  setFirstLaunch: (isFirstLaunch: boolean) => void;
  
  // Actions - Currency
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  setGems: (amount: number) => void;
  
  // Actions - Premium
  setPremium: (status: boolean) => void;
  setPremiumStatus: (status: boolean, expiresAt?: Date) => void;
  checkPremiumExpiry: () => void;
  
  // Actions - Daily Rewards
  setDailyRewardClaimed: (type: 'gems' | 'powerups', streak: number) => void;
  
  // Actions - Ads
  setAdFreePurchased: (purchased: boolean) => void;
  incrementInterstitialCount: () => void;
  resetInterstitialCount: () => void;
  shouldShowInterstitial: () => boolean;
  
  // Actions - Power-Ups
  addPowerUp: (type: PowerUpType, quantity: number) => void;
  usePowerUp: (type: PowerUpType) => boolean;
  setPowerUpQuantity: (type: PowerUpType, quantity: number) => void;
  
  // Actions - Cosmetics
  unlockCosmetic: (id: string) => void;
  setActiveCosmetic: (type: CosmeticType, id: string) => void;
  
  // Actions - Sync
  syncWithBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;
  
  // Actions - Reset
  reset: () => void;
}

// Initial State
const initialUserState: UserState = {
  userId: null,
  email: null,
  username: null,
  avatar_url: null,
  bio: null,
  isAuthenticated: false,
  isAnonymous: false,
};

const initialAdState: AdState = {
  adFreePurchased: false,
  canShowInterstitial: true,
  lastInterstitialTimestamp: 0,
  interstitialGameCount: 0,
  interstitialFrequency: 3, // Default: show every 3 games
};

const initialDailyRewardState: DailyRewardState = {
  lastClaimedGems: null,
  lastClaimedPowerUps: null,
  streak: 0,
};

const initialPowerUps: PowerUpsInventory = {
  [PowerUpType.MAGIC_WAND]: 0,
  [PowerUpType.PIECE_SWAP]: 0,
  [PowerUpType.UNDO_MOVE]: 0,
  [PowerUpType.LINE_BLASTER]: 0,
};

const initialActiveCosmetics: ActiveCosmetics = {
  [CosmeticType.BLOCK_SKIN]: 'default',
  [CosmeticType.BOARD_THEME]: 'default',
  [CosmeticType.MUSIC_PACK]: null,
  [CosmeticType.PARTICLE_EFFECT]: null,
};

/**
 * Monetization Store
 */
export const useMonetizationStore = create<MonetizationStore>()(
  immer((set, get) => ({
    // Initial State
    user: initialUserState,
    gems: 0,
    isPremium: false,
    premiumExpiresAt: null,
    adState: initialAdState,
    dailyReward: initialDailyRewardState,
    powerUps: initialPowerUps,
    ownedCosmetics: ['default'], // Default cosmetics are always owned
    activeCosmetics: initialActiveCosmetics,
    initialized: false,
    firstLaunch: false,

    // User Actions
    setUser: (profile: UserProfile | null) => {
      set(state => {
        if (profile) {
          state.user = {
            userId: profile.id,
            email: profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            isAuthenticated: true,
            isAnonymous: state.user.isAnonymous,
          };
          state.gems = profile.gems || 0;
          state.isPremium = profile.premium_status || false;
          state.premiumExpiresAt = profile.premium_expires_at
            ? new Date(profile.premium_expires_at)
            : null;
        } else {
          state.user = initialUserState;
        }
      });
    },

    setAnonymous: (isAnonymous: boolean) => {
      set(state => {
        state.user.isAnonymous = isAnonymous;
      });
    },

    setFirstLaunch: (isFirstLaunch: boolean) => {
      set(state => {
        state.firstLaunch = isFirstLaunch;
      });
    },

    // Currency Actions
    addGems: (amount: number) => {
      set(state => {
        state.gems += amount;
      });
    },

    spendGems: (amount: number) => {
      const currentGems = get().gems;
      if (currentGems < amount) {
        return false;
      }

      set(state => {
        state.gems -= amount;
      });

      return true;
    },

    setGems: (amount: number) => {
      set(state => {
        state.gems = amount;
      });
    },

    // Premium Actions
    setPremium: (status: boolean) => {
      set(state => {
        state.isPremium = status;
        
        // If premium, disable ads
        if (status) {
          state.adState.adFreePurchased = true;
        }
      });
    },

    setPremiumStatus: (status: boolean, expiresAt?: Date) => {
      set(state => {
        state.isPremium = status;
        state.premiumExpiresAt = expiresAt || null;
        
        // If premium, disable ads
        if (status) {
          state.adState.adFreePurchased = true;
        }
      });
    },

    checkPremiumExpiry: () => {
      const { isPremium, premiumExpiresAt } = get();
      
      if (isPremium && premiumExpiresAt) {
        const now = new Date();
        if (now >= premiumExpiresAt) {
          set(state => {
            state.isPremium = false;
            state.premiumExpiresAt = null;
          });
        }
      }
    },

    // Daily Reward Actions
    setDailyRewardClaimed: (type: 'gems' | 'powerups', streak: number) => {
      set(state => {
        const now = new Date().toISOString();
        if (type === 'gems') {
          state.dailyReward.lastClaimedGems = now;
        } else {
          state.dailyReward.lastClaimedPowerUps = now;
        }
        state.dailyReward.streak = streak;
      });
    },

    // Ad Actions
    setAdFreePurchased: (purchased: boolean) => {
      set(state => {
        state.adState.adFreePurchased = purchased;
      });
    },

    incrementInterstitialCount: () => {
      set(state => {
        state.adState.interstitialGameCount += 1;
      });
    },

    resetInterstitialCount: () => {
      set(state => {
        state.adState.interstitialGameCount = 0;
        state.adState.lastInterstitialTimestamp = Date.now();
      });
    },

    shouldShowInterstitial: () => {
      const { adState, isPremium } = get();
      
      // Don't show if premium or ad-free
      if (isPremium || adState.adFreePurchased) {
        return false;
      }
      
      // Get optimized frequency (Remote Config + A/B Test)
      const optimizedFrequency = optimizationService.getOptimizedValue(
        'ad_interstitial_frequency',
        adState.interstitialFrequency
      );

      // Check frequency
      return adState.interstitialGameCount >= optimizedFrequency;
    },

    // Power-Up Actions
    addPowerUp: (type: PowerUpType, quantity: number) => {
      set(state => {
        state.powerUps[type] += quantity;
      });
    },

    usePowerUp: (type: PowerUpType) => {
      const quantity = get().powerUps[type];
      
      if (quantity <= 0) {
        return false;
      }

      set(state => {
        state.powerUps[type] -= 1;
      });

      return true;
    },

    setPowerUpQuantity: (type: PowerUpType, quantity: number) => {
      set(state => {
        state.powerUps[type] = quantity;
      });
    },

    // Cosmetic Actions
    unlockCosmetic: (id: string) => {
      set(state => {
        if (!state.ownedCosmetics.includes(id)) {
          state.ownedCosmetics.push(id);
        }
      });
    },

    setActiveCosmetic: (type: CosmeticType, id: string) => {
      set(state => {
        state.activeCosmetics[type] = id;
      });
    },

    // Sync Actions
    syncWithBackend: async () => {
      const { user } = get();
      if (!user.userId) return;

      try {
        const supabase = getSupabase();

        // Sync gems
        await supabaseManager
          .from('profiles')
          .update({
            gems: get().gems,
            premium_status: get().isPremium,
            premium_expires_at: get().premiumExpiresAt?.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.userId);

        // Sync power-ups
        const powerUpUpdates = Object.entries(get().powerUps).map(
          ([type, quantity]) => ({
            user_id: user.userId,
            power_up_type: type,
            quantity,
            updated_at: new Date().toISOString(),
          })
        );

        await supabaseManager
          .from('power_ups_inventory')
          .upsert(powerUpUpdates);

        // Sync active cosmetics and daily rewards
        // Import audio settings storage dynamically to avoid circular dependency
        const { audioSettingsStorage } = await import('../services/audio/AudioSettingsStorage');
        const audioSettings = audioSettingsStorage.getSettings();

        await supabaseManager
          .from('user_settings')
          .update({
            active_block_skin: get().activeCosmetics[CosmeticType.BLOCK_SKIN],
            active_board_theme: get().activeCosmetics[CosmeticType.BOARD_THEME],
            active_music_pack: get().activeCosmetics[CosmeticType.MUSIC_PACK],
            active_particle_effect: get().activeCosmetics[CosmeticType.PARTICLE_EFFECT],
            ad_free: get().adState.adFreePurchased,
            last_daily_gems_claim: get().dailyReward.lastClaimedGems,
            last_daily_powerups_claim: get().dailyReward.lastClaimedPowerUps,
            daily_reward_streak: get().dailyReward.streak,
            music_volume: audioSettings.musicVolume,
            sfx_volume: audioSettings.sfxVolume,
            music_enabled: audioSettings.musicEnabled,
            sfx_enabled: audioSettings.sfxEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.userId);

        console.log('✅ Monetization data synced to backend');
      } catch (error) {
        console.error('Error syncing to backend:', error);
      }
    },

    loadFromBackend: async () => {
      try {
        const profile = await authService.getUserProfile();
        if (!profile) return;

        const supabase = getSupabase();

        // Load profile data
        get().setUser(profile);

        // Load power-ups
        const { data: powerUps } = await supabaseManager
          .from('power_ups_inventory')
          .select('*')
          .eq('user_id', profile.id);

        if (powerUps) {
          powerUps.forEach(pu => {
            get().setPowerUpQuantity(pu.power_up_type as PowerUpType, pu.quantity);
          });
        }

        // Load cosmetics
        const { data: cosmetics } = await supabaseManager
          .from('cosmetics_owned')
          .select('cosmetic_id')
          .eq('user_id', profile.id);

        if (cosmetics) {
          set(state => {
            state.ownedCosmetics = ['default', ...cosmetics.map(c => c.cosmetic_id)];
          });
        }

        // Load settings
        const { data: settings } = await supabaseManager
          .from('user_settings')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        if (settings) {
          set(state => {
            state.activeCosmetics[CosmeticType.BLOCK_SKIN] = settings.active_block_skin;
            state.activeCosmetics[CosmeticType.BOARD_THEME] = settings.active_board_theme;
            state.activeCosmetics[CosmeticType.MUSIC_PACK] = settings.active_music_pack;
            state.activeCosmetics[CosmeticType.PARTICLE_EFFECT] = settings.active_particle_effect;
            state.adState.adFreePurchased = settings.ad_free || false;
            
            // Load daily reward data
            state.dailyReward.lastClaimedGems = settings.last_daily_gems_claim;
            state.dailyReward.lastClaimedPowerUps = settings.last_daily_powerups_claim;
            state.dailyReward.streak = settings.daily_reward_streak || 0;
          });

          // Load audio settings (non-blocking)
          const { audioSettingsStorage } = await import('../services/audio/AudioSettingsStorage');
          if (settings.music_volume !== null || settings.sfx_volume !== null || 
              settings.music_enabled !== null || settings.sfx_enabled !== null) {
            await audioSettingsStorage.saveSettings({
              musicVolume: settings.music_volume ?? undefined,
              sfxVolume: settings.sfx_volume ?? undefined,
              musicEnabled: settings.music_enabled ?? undefined,
              sfxEnabled: settings.sfx_enabled ?? undefined,
            });
          }
        }

        set(state => {
          state.initialized = true;
        });

        console.log('✅ Monetization data loaded from backend');
      } catch (error) {
        console.error('Error loading from backend:', error);
      }
    },

    // Reset
    reset: () => {
      set({
        user: initialUserState,
        gems: 0,
        isPremium: false,
        premiumExpiresAt: null,
        adState: initialAdState,
        dailyReward: initialDailyRewardState,
        powerUps: initialPowerUps,
        ownedCosmetics: ['default'],
        activeCosmetics: initialActiveCosmetics,
        initialized: false,
        firstLaunch: false,
      });
    },
  }))
);

// Selector hooks for performance optimization
export const useUser = () => useMonetizationStore(state => state.user);
export const useGems = () => useMonetizationStore(state => state.gems);
export const useIsPremium = () => useMonetizationStore(state => state.isPremium);
export const usePowerUps = () => useMonetizationStore(state => state.powerUps);
export const useOwnedCosmetics = () => useMonetizationStore(state => state.ownedCosmetics);
export const useActiveCosmetics = () => useMonetizationStore(state => state.activeCosmetics);
export const useAdState = () => useMonetizationStore(state => state.adState);
export const useDailyReward = () => useMonetizationStore(state => state.dailyReward);

