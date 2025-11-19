/**
 * Product Catalog - IAP Product Definitions
 * Defines all purchasable items: gem packs, power-ups, subscriptions, cosmetics
 */

export enum ProductType {
  CONSUMABLE = 'consumable',
  NON_CONSUMABLE = 'non_consumable',
  SUBSCRIPTION = 'subscription',
}

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number; // USD
  gems?: number; // For gem packs
  bonus?: number; // Bonus gems
  period?: string; // For subscriptions (P1M, P1Y)
  features?: string[]; // For subscriptions
  savings?: string; // Marketing text
  bestValue?: boolean;
  premiumOnly?: boolean;
}

// ============================================================================
// GEM PACKS
// ============================================================================

export const GEM_PACKS: Record<string, Product> = {
  GEMS_100: {
    id: 'com.blocktopia.gems100',
    type: ProductType.CONSUMABLE,
    name: 'Starter Gems',
    description: '100 gems for power-ups',
    price: 0.99,
    gems: 100,
  },
  GEMS_500: {
    id: 'com.blocktopia.gems500',
    type: ProductType.CONSUMABLE,
    name: 'Gem Pack',
    description: '500 gems to power up your game',
    price: 4.99,
    gems: 500,
  },
  GEMS_1200: {
    id: 'com.blocktopia.gems1200',
    type: ProductType.CONSUMABLE,
    name: 'Popular Gem Pack',
    description: '1200 gems + 200 bonus',
    price: 9.99,
    gems: 1200,
    bonus: 200,
    bestValue: true,
  },
  GEMS_3000: {
    id: 'com.blocktopia.gems3000',
    type: ProductType.CONSUMABLE,
    name: 'Mega Gem Pack',
    description: '3000 gems + 1000 bonus',
    price: 19.99,
    gems: 3000,
    bonus: 1000,
  },
  GEMS_10000: {
    id: 'com.blocktopia.gems10000',
    type: ProductType.CONSUMABLE,
    name: 'Ultimate Gem Pack',
    description: '10000 gems + 5000 bonus',
    price: 49.99,
    gems: 10000,
    bonus: 5000,
  },
};

// ============================================================================
// SPECIAL PURCHASES
// ============================================================================

export const SPECIAL_PRODUCTS: Record<string, Product> = {
  REMOVE_ADS: {
    id: 'com.blocktopia.removeads',
    type: ProductType.NON_CONSUMABLE,
    name: 'Remove Ads',
    description: 'Enjoy Blocktopia ad-free forever',
    price: 2.99,
  },
};

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const SUBSCRIPTIONS: Record<string, Product> = {
  PREMIUM_MONTHLY: {
    id: 'com.blocktopia.premium.monthly',
    type: ProductType.SUBSCRIPTION,
    name: 'Premium Monthly',
    description: 'All premium benefits',
    price: 4.99,
    period: 'P1M',
    features: [
      '✨ Ad-free experience',
      '🎁 3 free power-ups daily',
      '🎨 Exclusive themes',
      '💎 50 gems daily',
      '☁️ Cloud save',
      '💬 Priority support',
    ],
  },
  PREMIUM_YEARLY: {
    id: 'com.blocktopia.premium.yearly',
    type: ProductType.SUBSCRIPTION,
    name: 'Premium Yearly',
    description: 'Best value - Save 33%',
    price: 39.99,
    period: 'P1Y',
    savings: 'Save 33%',
    bestValue: true,
    features: [
      '✨ Ad-free experience',
      '🎁 3 free power-ups daily',
      '🎨 Exclusive themes',
      '💎 50 gems daily',
      '☁️ Cloud save',
      '💬 Priority support',
      '🏆 Exclusive badge',
    ],
  },
};

// ============================================================================
// POWER-UP PRICING (can be purchased with gems or USD)
// ============================================================================

export const POWER_UP_PRICES = {
  magic_wand: { gems: 100, usd: 0.99 },
  piece_swap: { gems: 100, usd: 0.99 },
  undo_move: { gems: 200, usd: 1.99 },
  line_blaster: { gems: 200, usd: 1.99 },
};

// ============================================================================
// COSMETIC PRICING (can be purchased with gems or USD)
// ============================================================================

export const COSMETIC_PRICES = {
  // Block Skins
  BLOCK_GRADIENT: { id: 'block_gradient', gems: 150, usd: 0.99 },
  BLOCK_NEON: { id: 'block_neon', gems: 300, usd: 1.99 },
  BLOCK_GLASS: { id: 'block_glass', gems: 300, usd: 1.99, premiumOnly: true },
  BLOCK_METALLIC: { id: 'block_metallic', gems: 300, usd: 1.99, premiumOnly: true },
  BLOCK_ANIMATED: { id: 'block_animated', gems: 500, usd: 2.99, premiumOnly: true },
  
  // Board Themes
  THEME_DARK: { id: 'theme_dark', gems: 300, usd: 1.99 },
  THEME_NEON_CITY: { id: 'theme_neon_city', gems: 500, usd: 2.99, premiumOnly: true },
  THEME_OCEAN: { id: 'theme_ocean', gems: 750, usd: 4.99, premiumOnly: true },
  THEME_SPACE: { id: 'theme_space', gems: 750, usd: 4.99, premiumOnly: true },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all products as a flat array
 */
export function getAllProducts(): Product[] {
  return [
    ...Object.values(GEM_PACKS),
    ...Object.values(SPECIAL_PRODUCTS),
    ...Object.values(SUBSCRIPTIONS),
  ];
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return getAllProducts().find(product => product.id === id);
}

/**
 * Get all gem pack products
 */
export function getGemPacks(): Product[] {
  return Object.values(GEM_PACKS);
}

/**
 * Get all subscription products
 */
export function getSubscriptions(): Product[] {
  return Object.values(SUBSCRIPTIONS);
}

/**
 * Get all special products
 */
export function getSpecialProducts(): Product[] {
  return Object.values(SPECIAL_PRODUCTS);
}

/**
 * Calculate total gems for a gem pack (including bonus)
 */
export function getTotalGems(product: Product): number {
  if (!product.gems) return 0;
  return product.gems + (product.bonus || 0);
}

/**
 * Get best value gem pack
 */
export function getBestValueGemPack(): Product | undefined {
  return Object.values(GEM_PACKS).find(pack => pack.bestValue);
}

/**
 * Calculate gems per dollar for a gem pack
 */
export function getGemsPerDollar(product: Product): number {
  if (!product.gems || !product.price) return 0;
  const totalGems = getTotalGems(product);
  return totalGems / product.price;
}

/**
 * Get power-up price in gems
 */
export function getPowerUpGemsPrice(powerUpType: string): number {
  const prices = POWER_UP_PRICES as any;
  return prices[powerUpType]?.gems || 0;
}

/**
 * Get power-up price in USD
 */
export function getPowerUpUSDPrice(powerUpType: string): number {
  const prices = POWER_UP_PRICES as any;
  return prices[powerUpType]?.usd || 0;
}

/**
 * Get cosmetic price
 */
export function getCosmeticPrice(cosmeticId: string): { gems: number; usd: number; premiumOnly?: boolean } | undefined {
  const prices = COSMETIC_PRICES as any;
  return prices[cosmeticId];
}

/**
 * Check if cosmetic requires premium
 */
export function isCosmeticPremiumOnly(cosmeticId: string): boolean {
  const price = getCosmeticPrice(cosmeticId);
  return price?.premiumOnly || false;
}

