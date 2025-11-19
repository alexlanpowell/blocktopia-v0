/**
 * Piece class representing a block piece in Blocktopia
 * Adapted from Unity Block.cs
 */

import { Piece, PieceCell, PieceBounds } from '../../utils/types';
import { PIECE_SHAPES, GAME_CONFIG } from '../constants';
import { PIECE_COLORS } from '../../utils/types';

/**
 * Generate a random piece from available shapes
 */
export function generateRandomPiece(): Piece {
  const randomIndex = Math.floor(Math.random() * GAME_CONFIG.SHAPE_COUNT);
  return generatePieceById(randomIndex);
}

/**
 * Generate a piece by its shape ID
 */
export function generatePieceById(id: number): Piece {
  if (id < 0 || id >= PIECE_SHAPES.length) {
    throw new Error(`Invalid piece ID: ${id}. Must be between 0 and ${PIECE_SHAPES.length - 1}`);
  }

  const structure = PIECE_SHAPES[id];
  const bounds = calculatePieceBounds(structure);
  const color = PIECE_COLORS[id % PIECE_COLORS.length];

  return {
    id,
    structure,
    color,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * Calculate the bounds (width, height) of a piece
 */
export function calculatePieceBounds(structure: PieceCell[]): PieceBounds {
  if (structure.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = structure[0].x;
  let maxX = structure[0].x;
  let minY = structure[0].y;
  let maxY = structure[0].y;

  for (const cell of structure) {
    if (cell.x < minX) minX = cell.x;
    if (cell.x > maxX) maxX = cell.x;
    if (cell.y < minY) minY = cell.y;
    if (cell.y > maxY) maxY = cell.y;
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Get the first cell coordinates of a piece (top-left)
 */
export function getPieceFirstCell(piece: Piece): PieceCell {
  if (piece.structure.length === 0) {
    return { x: 0, y: 0 };
  }

  return piece.structure[0];
}

/**
 * Check if two pieces are the same shape
 */
export function arePiecesEqual(piece1: Piece, piece2: Piece): boolean {
  return piece1.id === piece2.id;
}

/**
 * Clone a piece (create a deep copy)
 */
export function clonePiece(piece: Piece): Piece {
  return {
    ...piece,
    structure: [...piece.structure.map(cell => ({ ...cell }))],
  };
}

