/**
 * Cosmetic Catalog - Defines all available cosmetics
 * Block skins, board themes, particle effects, music packs
 */

import { CosmeticType } from '../../store/monetizationStore';

export interface Cosmetic {
  id: string;
  type: CosmeticType;
  name: string;
  description: string;
  price: number; // In gems
  isPremium: boolean; // Premium-only
  isDefault: boolean; // Free for everyone
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  preview: string; // Emoji or asset reference
  colors?: string[]; // Color palette for themes
}

// Block Skins
export const BLOCK_SKINS: Cosmetic[] = [
  {
    id: 'default',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Classic',
    description: 'The original block style',
    price: 0,
    isPremium: false,
    isDefault: true,
    rarity: 'common',
    preview: '🟦',
  },
  {
    id: 'neon',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Neon',
    description: 'Vibrant glowing blocks',
    price: 500,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '✨',
    colors: ['#00ffff', '#ff00ff', '#ffff00'],
  },
  {
    id: 'crystal',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Crystal',
    description: 'Shimmering crystal blocks',
    price: 1000,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '💎',
    colors: ['#a8dadc', '#457b9d', '#1d3557'],
  },
  {
    id: 'gold',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Gold Rush',
    description: 'Luxurious golden blocks',
    price: 1500,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🟨',
    colors: ['#ffd700', '#ffed4e', '#ffc107'],
  },
  {
    id: 'rainbow',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Rainbow',
    description: 'Colorful rainbow blocks',
    price: 800,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '🌈',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
  },
  {
    id: 'shadow',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Shadow',
    description: 'Dark mysterious blocks',
    price: 600,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '⬛',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
  },
  {
    id: 'fire',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Fire',
    description: 'Blazing hot blocks',
    price: 1200,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '🔥',
    colors: ['#ff4500', '#ff6347', '#ff8c00'],
  },
  {
    id: 'ice',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Ice',
    description: 'Frozen crystal blocks',
    price: 1200,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '❄️',
    colors: ['#b0e0e6', '#87ceeb', '#4682b4'],
  },
  {
    id: 'galaxy',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Galaxy',
    description: 'Cosmic space blocks',
    price: 2000,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🌌',
    colors: ['#2e1a47', '#4a3f7a', '#6b5b95'],
  },
  {
    id: 'retro',
    type: CosmeticType.BLOCK_SKIN,
    name: 'Retro',
    description: '8-bit pixel art blocks',
    price: 700,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '🕹️',
    colors: ['#00ff00', '#ff00ff', '#00ffff'],
  },
];

// Board Themes
export const BOARD_THEMES: Cosmetic[] = [
  {
    id: 'default',
    type: CosmeticType.BOARD_THEME,
    name: 'Classic',
    description: 'The original dark theme',
    price: 0,
    isPremium: false,
    isDefault: true,
    rarity: 'common',
    preview: '⬛',
    colors: ['#1a1a2e', '#16213e'],
  },
  {
    id: 'light',
    type: CosmeticType.BOARD_THEME,
    name: 'Light Mode',
    description: 'Bright and clean',
    price: 300,
    isPremium: false,
    isDefault: false,
    rarity: 'common',
    preview: '⬜',
    colors: ['#f5f5f5', '#e0e0e0'],
  },
  {
    id: 'ocean',
    type: CosmeticType.BOARD_THEME,
    name: 'Ocean',
    description: 'Deep blue waters',
    price: 600,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '🌊',
    colors: ['#006994', '#004f6f', '#003b54'],
  },
  {
    id: 'sunset',
    type: CosmeticType.BOARD_THEME,
    name: 'Sunset',
    description: 'Warm evening colors',
    price: 800,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '🌅',
    colors: ['#ff6b6b', '#ee5a6f', '#f4a261'],
  },
  {
    id: 'forest',
    type: CosmeticType.BOARD_THEME,
    name: 'Forest',
    description: 'Natural green tones',
    price: 600,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '🌲',
    colors: ['#2d4a2c', '#3d5a3c', '#4a6a49'],
  },
  {
    id: 'midnight',
    type: CosmeticType.BOARD_THEME,
    name: 'Midnight',
    description: 'Premium dark theme',
    price: 1000,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🌙',
    colors: ['#0a0a1a', '#15152a', '#1f1f3a'],
  },
  {
    id: 'cyberpunk',
    type: CosmeticType.BOARD_THEME,
    name: 'Cyberpunk',
    description: 'Futuristic neon theme',
    price: 1500,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🤖',
    colors: ['#0d0221', '#0f084b', '#26408b'],
  },
];

// Particle Effects
export const PARTICLE_EFFECTS: Cosmetic[] = [
  {
    id: 'none',
    type: CosmeticType.PARTICLE_EFFECT,
    name: 'None',
    description: 'No particle effects',
    price: 0,
    isPremium: false,
    isDefault: true,
    rarity: 'common',
    preview: '🚫',
  },
  {
    id: 'sparkles',
    type: CosmeticType.PARTICLE_EFFECT,
    name: 'Sparkles',
    description: 'Magical sparkle effects',
    price: 500,
    isPremium: false,
    isDefault: false,
    rarity: 'rare',
    preview: '✨',
  },
  {
    id: 'confetti',
    type: CosmeticType.PARTICLE_EFFECT,
    name: 'Confetti',
    description: 'Celebration particles',
    price: 700,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '🎉',
  },
  {
    id: 'fireworks',
    type: CosmeticType.PARTICLE_EFFECT,
    name: 'Fireworks',
    description: 'Explosive effects',
    price: 1000,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🎆',
  },
];

// Music Packs (future implementation)
export const MUSIC_PACKS: Cosmetic[] = [
  {
    id: 'none',
    type: CosmeticType.MUSIC_PACK,
    name: 'Silence',
    description: 'No background music',
    price: 0,
    isPremium: false,
    isDefault: true,
    rarity: 'common',
    preview: '🔇',
  },
  {
    id: 'lo-fi',
    type: CosmeticType.MUSIC_PACK,
    name: 'Lo-Fi Beats',
    description: 'Chill study music',
    price: 800,
    isPremium: false,
    isDefault: false,
    rarity: 'epic',
    preview: '🎵',
  },
  {
    id: 'electronic',
    type: CosmeticType.MUSIC_PACK,
    name: 'Electronic',
    description: 'Upbeat EDM tracks',
    price: 1000,
    isPremium: true,
    isDefault: false,
    rarity: 'legendary',
    preview: '🎧',
  },
];

// Helper Functions
export function getAllCosmetics(): Cosmetic[] {
  return [...BLOCK_SKINS, ...BOARD_THEMES, ...PARTICLE_EFFECTS, ...MUSIC_PACKS];
}

export function getCosmeticsByType(type: CosmeticType): Cosmetic[] {
  switch (type) {
    case CosmeticType.BLOCK_SKIN:
      return BLOCK_SKINS;
    case CosmeticType.BOARD_THEME:
      return BOARD_THEMES;
    case CosmeticType.PARTICLE_EFFECT:
      return PARTICLE_EFFECTS;
    case CosmeticType.MUSIC_PACK:
      return MUSIC_PACKS;
    default:
      return [];
  }
}

export function getCosmeticById(id: string): Cosmetic | undefined {
  return getAllCosmetics().find(c => c.id === id);
}

export function getPremiumCosmetics(): Cosmetic[] {
  return getAllCosmetics().filter(c => c.isPremium);
}

export function getFreeCosmetics(): Cosmetic[] {
  return getAllCosmetics().filter(c => !c.isPremium);
}

export function getCosmeticsByRarity(rarity: Cosmetic['rarity']): Cosmetic[] {
  return getAllCosmetics().filter(c => c.rarity === rarity);
}

// Get display info
export function getRarityColor(rarity: Cosmetic['rarity']): string {
  const colors = {
    common: '#9e9e9e',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800',
  };
  return colors[rarity];
}

export function getRarityLabel(rarity: Cosmetic['rarity']): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

