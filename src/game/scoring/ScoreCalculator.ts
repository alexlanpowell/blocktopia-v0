/**
 * Score calculation logic for Blocktopia
 * Formula adapted from Unity GameManager.cs
 */

import { GAME_CONFIG } from '../constants';

/**
 * Calculate score for cleared lines
 * Formula: (BOARD_SIZE + emptyFields/5) * linesCleared + comboBonus
 * Combo bonus: basePoints * (linesCleared / 3.0 - 0.333)
 *
 * @param emptyFields - Number of empty cells on the board after clearing
 * @param linesCleared - Total number of lines cleared (rows + columns)
 * @param boardSize - Size of the board (default: 10)
 * @returns Calculated score points
 */
export function calculateScore(
  emptyFields: number,
  linesCleared: number,
  boardSize: number = GAME_CONFIG.BOARD_SIZE
): number {
  if (linesCleared === 0) {
    return 0;
  }

  // Base points calculation
  const basePoints = (boardSize + emptyFields / 5) * linesCleared;

  // Combo bonus for clearing multiple lines
  const comboBonus = basePoints * (linesCleared / 3.0 - 0.333);

  // Return floor value (integer score)
  return Math.floor(basePoints + comboBonus);
}

/**
 * Calculate score with detailed breakdown (for debugging/analytics)
 */
export function calculateScoreDetailed(
  emptyFields: number,
  linesCleared: number,
  boardSize: number = GAME_CONFIG.BOARD_SIZE
): {
  total: number;
  basePoints: number;
  comboBonus: number;
  multiplier: number;
} {
  if (linesCleared === 0) {
    return {
      total: 0,
      basePoints: 0,
      comboBonus: 0,
      multiplier: 1,
    };
  }

  const basePoints = (boardSize + emptyFields / 5) * linesCleared;
  const multiplier = linesCleared / 3.0 - 0.333;
  const comboBonus = basePoints * multiplier;
  const total = Math.floor(basePoints + comboBonus);

  return {
    total,
    basePoints,
    comboBonus,
    multiplier,
  };
}

