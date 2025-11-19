/**
 * Core TypeScript type definitions for Blocktopia game
 */

/**
 * Represents a single cell in a piece structure
 */
export interface PieceCell {
  x: number;
  y: number;
}

/**
 * Represents a piece/block that can be placed on the board
 */
export interface Piece {
  id: number;
  structure: PieceCell[];
  color: string;
  width: number;
  height: number;
}

/**
 * Represents the game board grid state
 */
export type BoardGrid = (number | null)[][];

/**
 * Result of checking for full lines
 */
export interface FullLinesResult {
  rows: number[];
  columns: number[];
  totalLines: number;
}

/**
 * Game state interface
 */
export interface IGameState {
  board: BoardGrid;
  currentPieces: Piece[];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  canContinue: boolean;
}

/**
 * Position on the board
 */
export interface BoardPosition {
  x: number;
  y: number;
}

/**
 * Bounds of a piece
 */
export interface PieceBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Color palette for pieces
 */
export const PIECE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7B731', // Yellow
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9FF3', // Pink
  '#54A0FF', // Light Blue
  '#48DBFB', // Sky Blue
  '#FF6348', // Orange Red
  '#2ECC71', // Green
  '#3498DB', // Blue
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#F39C12', // Orange
  '#1ABC9C', // Turquoise
] as const;

