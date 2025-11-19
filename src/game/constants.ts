/**
 * Game configuration constants for Blocktopia
 * Adapted from Unity Block Blast game
 */

import { PieceCell } from '../utils/types';

export const GAME_CONFIG = {
  BOARD_SIZE: 10,
  PIECE_COUNT: 3,
  SHAPE_COUNT: 18,
  CELL_SIZE: 32,
  CELL_GAP: 3,
  TARGET_FPS: 60,
  ANIMATION_DURATION: 0.25,
} as const;

/**
 * All 18 piece shapes (adapted from Unity prefabs)
 * Each shape is defined by its cell coordinates relative to origin (0,0)
 */
export const PIECE_SHAPES: PieceCell[][] = [
  // 1. Single block
  [{ x: 0, y: 0 }],

  // 2. H-line 2 (horizontal 2 blocks)
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],

  // 3. H-line 3 (horizontal 3 blocks)
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],

  // 4. H-line 4 (horizontal 4 blocks)
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],

  // 5. H-line 5 (horizontal 5 blocks)
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
  ],

  // 6. V-line 2 (vertical 2 blocks)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ],

  // 7. V-line 3 (vertical 3 blocks)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
  ],

  // 8. V-line 4 (vertical 4 blocks)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
  ],

  // 9. V-line 5 (vertical 5 blocks)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
  ],

  // 10. Square 2x2
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],

  // 11. Square 3x3
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ],

  // 12. L shape (bottom-left)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],

  // 13. J shape (bottom-right, mirrored L)
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ],

  // 14. T shape
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
  ],

  // 15. Reverse T (upside down T)
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],

  // 16. S shape (zigzag)
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],

  // 17. Plus/Cross shape
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],

  // 18. Small L (2x2 corner)
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
];

/**
 * Validate that we have exactly 18 shapes
 */
if (PIECE_SHAPES.length !== GAME_CONFIG.SHAPE_COUNT) {
  throw new Error(
    `Expected ${GAME_CONFIG.SHAPE_COUNT} piece shapes, but got ${PIECE_SHAPES.length}`
  );
}

