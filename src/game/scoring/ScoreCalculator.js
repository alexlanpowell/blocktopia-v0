"use strict";
/**
 * Score calculation logic for Blocktopia
 * Formula adapted from Unity GameManager.cs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
exports.calculateScoreDetailed = calculateScoreDetailed;
const constants_1 = require("../constants");
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
function calculateScore(emptyFields, linesCleared, boardSize = constants_1.GAME_CONFIG.BOARD_SIZE) {
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
function calculateScoreDetailed(emptyFields, linesCleared, boardSize = constants_1.GAME_CONFIG.BOARD_SIZE) {
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
