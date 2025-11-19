/**
 * Board class managing the game grid
 * Logic adapted from Unity BoardManager.cs
 */

import { BoardGrid, Piece, FullLinesResult, BoardPosition } from '../../utils/types';
import { GAME_CONFIG } from '../constants';

export class Board {
  private grid: BoardGrid;
  private readonly size: number;

  constructor(size: number = GAME_CONFIG.BOARD_SIZE) {
    this.size = size;
    this.grid = this.createEmptyGrid();
  }

  /**
   * Create an empty grid
   */
  private createEmptyGrid(): BoardGrid {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(null));
  }

  /**
   * Get the current board state
   */
  getGrid(): BoardGrid {
    return this.grid;
  }

  /**
   * Get board size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Check if a piece can be placed at the given position
   * Adapted from Unity's IsInRange() and IsEmpty()
   */
  canPlacePiece(piece: Piece, x: number, y: number): boolean {
    // Check if all cells of the piece are within bounds and empty
    for (const cell of piece.structure) {
      const targetX = x + cell.x;
      const targetY = y + cell.y;

      // Check bounds
      if (!this.isInBounds(targetX, targetY)) {
        return false;
      }

      // Check if cell is empty
      if (this.grid[targetY][targetX] !== null) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if coordinates are within board bounds
   */
  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  /**
   * Place a piece on the board at the given position
   * @param piece - The piece to place
   * @param x - X coordinate (column)
   * @param y - Y coordinate (row)
   * @param pieceId - ID to mark cells with (defaults to piece.id)
   */
  placePiece(piece: Piece, x: number, y: number, pieceId?: number): void {
    const id = pieceId !== undefined ? pieceId : piece.id;

    for (const cell of piece.structure) {
      const targetX = x + cell.x;
      const targetY = y + cell.y;

      if (this.isInBounds(targetX, targetY)) {
        this.grid[targetY][targetX] = id;
      }
    }
  }

  /**
   * Check for full lines (rows and columns)
   * Adapted from Unity's CheckVLine() and CheckHLine()
   */
  checkFullLines(): FullLinesResult {
    const rows: number[] = [];
    const columns: number[] = [];

    // Check all rows
    for (let y = 0; y < this.size; y++) {
      if (this.isRowFull(y)) {
        rows.push(y);
      }
    }

    // Check all columns
    for (let x = 0; x < this.size; x++) {
      if (this.isColumnFull(x)) {
        columns.push(x);
      }
    }

    return {
      rows,
      columns,
      totalLines: rows.length + columns.length,
    };
  }

  /**
   * Check if a row is completely filled
   */
  private isRowFull(y: number): boolean {
    for (let x = 0; x < this.size; x++) {
      if (this.grid[y][x] === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a column is completely filled
   */
  private isColumnFull(x: number): boolean {
    for (let y = 0; y < this.size; y++) {
      if (this.grid[y][x] === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clear specified lines (rows and columns)
   * @returns Number of cells cleared
   */
  clearLines(rows: number[], columns: number[]): number {
    let cellsCleared = 0;

    // Clear rows
    for (const y of rows) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] !== null) {
          this.grid[y][x] = null;
          cellsCleared++;
        }
      }
    }

    // Clear columns (avoid double-counting intersections)
    for (const x of columns) {
      for (let y = 0; y < this.size; y++) {
        // Only clear if not already cleared by row clearing
        if (this.grid[y][x] !== null) {
          this.grid[y][x] = null;
          cellsCleared++;
        }
      }
    }

    return cellsCleared;
  }

  /**
   * Get count of empty cells
   */
  getEmptyCount(): number {
    let count = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] === null) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Check if any of the given pieces can be placed anywhere on the board
   * Used for game over detection
   */
  canPlaceAnyPiece(pieces: Piece[]): boolean {
    for (const piece of pieces) {
      if (this.canPlacePieceAnywhere(piece)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a piece can be placed anywhere on the board
   */
  private canPlacePieceAnywhere(piece: Piece): boolean {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.canPlacePiece(piece, x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all valid placement positions for a piece
   */
  getValidPlacements(piece: Piece): BoardPosition[] {
    const validPositions: BoardPosition[] = [];

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.canPlacePiece(piece, x, y)) {
          validPositions.push({ x, y });
        }
      }
    }

    return validPositions;
  }

  /**
   * Reset the board to empty state
   */
  reset(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * Clone the board (deep copy)
   */
  clone(): Board {
    const newBoard = new Board(this.size);
    newBoard.grid = this.grid.map(row => [...row]);
    return newBoard;
  }

  /**
   * Get cell value at position
   */
  getCellValue(x: number, y: number): number | null {
    if (!this.isInBounds(x, y)) {
      return null;
    }
    return this.grid[y][x];
  }

  /**
   * Set cell value at position
   */
  setCellValue(x: number, y: number, value: number | null): void {
    if (this.isInBounds(x, y)) {
      this.grid[y][x] = value;
    }
  }
}

