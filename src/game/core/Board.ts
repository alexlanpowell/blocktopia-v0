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
   * Set the board state (for game state restoration)
   */
  setGrid(newGrid: BoardGrid): void {
    // Validate grid dimensions
    if (!newGrid || !Array.isArray(newGrid) || newGrid.length !== this.size) {
      if (__DEV__) {
        console.error('[Board] Invalid grid dimensions for setGrid');
      }
      return;
    }

    // Validate each row
    for (let y = 0; y < newGrid.length; y++) {
      if (!Array.isArray(newGrid[y]) || newGrid[y].length !== this.size) {
        if (__DEV__) {
          console.error(`[Board] Invalid row ${y} dimensions`);
        }
        return;
      }
    }

    this.grid = newGrid;
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
    try {
      // Validate inputs
      if (!piece || !piece.structure || !Array.isArray(piece.structure)) {
        if (__DEV__) {
          console.error('Invalid piece in canPlacePiece:', piece);
        }
        return false;
      }

      if (!this.grid || !Array.isArray(this.grid)) {
        if (__DEV__) {
          console.error('Invalid grid in canPlacePiece');
        }
        return false;
      }

      // Check if all cells of the piece are within bounds and empty
      for (const cell of piece.structure) {
        if (!cell || typeof cell.x !== 'number' || typeof cell.y !== 'number') {
          if (__DEV__) {
            console.error('Invalid cell in piece structure:', cell);
          }
          return false;
        }

        const targetX = x + cell.x;
        const targetY = y + cell.y;

        // Check bounds
        if (!this.isInBounds(targetX, targetY)) {
          return false;
        }

        // Check if cell is empty
        if (this.grid[targetY] && this.grid[targetY][targetX] !== null) {
          return false;
        }
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Error in canPlacePiece:', error);
      }
      return false;
    }
  }

  /**
   * Check if coordinates are within board bounds
   */
  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  /**
   * Find the best snap position for a piece near the given grid coordinates
   * Implements magnetic snapping with configurable tolerance
   * @param gridX - Floating point grid X position
   * @param gridY - Floating point grid Y position
   * @param piece - The piece to place
   * @param tolerance - Maximum distance for snapping (in grid cells, default 0.4)
   * @returns Best valid snap position or null if no valid position within tolerance
   */
  findBestSnapPosition(
    gridX: number,
    gridY: number,
    piece: Piece,
    tolerance: number = 0.4
  ): { x: number; y: number } | null {
    // Get candidate positions (floor and ceil of current position)
    const candidates = [
      { x: Math.floor(gridX), y: Math.floor(gridY) },
      { x: Math.ceil(gridX), y: Math.floor(gridY) },
      { x: Math.floor(gridX), y: Math.ceil(gridY) },
      { x: Math.ceil(gridX), y: Math.ceil(gridY) },
    ];

    // Find closest valid position within tolerance
    let bestPosition: { x: number; y: number } | null = null;
    let minDistance = tolerance;

    for (const candidate of candidates) {
      // Check if piece can be placed at this position
      if (!this.canPlacePiece(piece, candidate.x, candidate.y)) {
        continue;
      }

      // Calculate Euclidean distance from current position
      const dx = Math.abs(gridX - candidate.x);
      const dy = Math.abs(gridY - candidate.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update best if closer and within tolerance
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = candidate;
      }
    }

    return bestPosition;
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

  /**
   * Check if a row or column has any filled cells
   * Used for continue feature to find clearable lines
   */
  hasFilledCells(index: number, isRow: boolean): boolean {
    if (isRow) {
      // Check row
      if (index < 0 || index >= this.size) return false;
      for (let x = 0; x < this.size; x++) {
        if (this.grid[index][x] !== null) {
          return true;
        }
      }
    } else {
      // Check column
      if (index < 0 || index >= this.size) return false;
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][index] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Clear a specific row
   * Used for continue feature
   */
  clearRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.size) return;
    for (let x = 0; x < this.size; x++) {
      this.grid[rowIndex][x] = null;
    }
  }

  /**
   * Clear a specific column
   * Used for continue feature
   */
  clearColumn(colIndex: number): void {
    if (colIndex < 0 || colIndex >= this.size) return;
    for (let y = 0; y < this.size; y++) {
      this.grid[y][colIndex] = null;
    }
  }
}

