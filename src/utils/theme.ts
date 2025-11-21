/**
 * Modern Theme System for Blocktopia
 * World-class color palette and design tokens
 */

export const COLORS = {
  // Background gradients
  background: {
    dark1: '#0a0e27',
    dark2: '#1a1f3a',
    dark3: '#2a1f3a',
  },
  
  // Primary colors with glow
  primary: {
    cyan: '#00f5ff',
    cyanGlow: 'rgba(0, 245, 255, 0.5)',
    purple: '#b24bf3',
    purpleGlow: 'rgba(178, 75, 243, 0.5)',
    gold: '#ffd700',
  },
  
  // Accent colors
  accent: {
    success: '#00ff88',
    warning: '#ff6b35',
    error: '#ff3b5c',
    gold: '#ffd700',
    info: '#00a8ff',
  },
  
  // Piece gradients
  pieces: [
    { start: '#00f5ff', end: '#0080ff' }, // Cyan
    { start: '#b24bf3', end: '#7b2cbf' }, // Purple
    { start: '#ff6ec7', end: '#ff1493' }, // Pink
    { start: '#ff6b35', end: '#ff4500' }, // Orange
    { start: '#ffd700', end: '#ffa500' }, // Yellow
    { start: '#00ff88', end: '#00c853' }, // Green
  ],
  
  // UI elements
  ui: {
    cardBackground: 'rgba(42, 47, 74, 0.6)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    boardCell: '#2a2a3e',
    boardBackground: 'rgba(26, 31, 58, 0.8)',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  glow: {
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    color: '#ffffff', // White text for visibility on dark backgrounds
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    color: '#ffffff', // White text for visibility on dark backgrounds
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  h4: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  score: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
};

export const ANIMATION = {
  quick: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

