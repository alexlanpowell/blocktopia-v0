/**
 * GameState class managing the overall game state and logic
 * Adapted from Unity GameManager.cs and BoardManager.cs
 */

import { Board } from './Board';
import { generateRandomPiece } from './Piece';
import { calculateScore } from '../scoring/ScoreCalculator';
import { Piece, IGameState } from '../../utils/types';
import { GAME_CONFIG } from '../constants';

export class GameState {
  board: Board;
  currentPieces: Piece[];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  canContinue: boolean;

  constructor(bestScore: number = 0) {
    this.board = new Board(GAME_CONFIG.BOARD_SIZE);
    this.currentPieces = [];
    this.score = 0;
    this.bestScore = bestScore;
    this.isGameOver = false;
    this.canContinue = true;

    // Initialize with 3 random pieces
    this.generateNewPieces();
  }

  /**
   * Generate new pieces to fill the slots
   */
  private generateNewPieces(): void {
    this.currentPieces = [];
    for (let i = 0; i < GAME_CONFIG.PIECE_COUNT; i++) {
      this.currentPieces.push(generateRandomPiece());
    }
  }

  /**
   * Place a piece on the board at the given position
   * @param pieceIndex - Index of the piece in currentPieces array
   * @param x - X coordinate on board
   * @param y - Y coordinate on board
   * @returns true if placement was successful, false otherwise
   */
  placePiece(pieceIndex: number, x: number, y: number): boolean {
    // Validate piece index
    if (pieceIndex < 0 || pieceIndex >= this.currentPieces.length) {
      return false;
    }

    const piece = this.currentPieces[pieceIndex];

    // Check if piece can be placed
    if (!this.board.canPlacePiece(piece, x, y)) {
      return false;
    }

    // Place the piece
    this.board.placePiece(piece, x, y);

    // Remove the placed piece and add a new one
    this.replacePiece(pieceIndex);

    // Check for full lines and clear them
    this.handleLineClearing();

    // Check if all pieces are gone (generate new set)
    if (this.areAllPiecesPlaced()) {
      this.generateNewPieces();
    }

    // Check game over condition
    this.checkGameOver();

    return true;
  }

  /**
   * Replace a piece at given index with a new random piece
   */
  private replacePiece(index: number): void {
    if (index >= 0 && index < this.currentPieces.length) {
      this.currentPieces[index] = generateRandomPiece();
    }
  }

  /**
   * Check if all current pieces have been placed (all null or marked)
   * In our implementation, we replace pieces immediately, so this checks if we should generate a full new set
   */
  private areAllPiecesPlaced(): boolean {
    // This is called after replacing a piece, so we don't need this check
    // We'll keep the method for potential future use
    return false;
  }

  /**
   * Handle line clearing logic
   */
  private handleLineClearing(): void {
    const fullLines = this.board.checkFullLines();

    if (fullLines.totalLines > 0) {
      // Clear the lines
      this.board.clearLines(fullLines.rows, fullLines.columns);

      // Calculate and add score
      const emptyFields = this.board.getEmptyCount();
      const points = calculateScore(emptyFields, fullLines.totalLines);
      this.score += points;

      // Update best score
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
      }
    }
  }

  /**
   * Check if game is over (no pieces can be placed)
   */
  private checkGameOver(): void {
    const canPlace = this.board.canPlaceAnyPiece(this.currentPieces);

    if (!canPlace) {
      this.isGameOver = true;
    }
  }

  /**
   * Restart the game
   */
  restart(): void {
    this.board.reset();
    this.score = 0;
    this.isGameOver = false;
    this.canContinue = true;
    this.generateNewPieces();
  }

  /**
   * Continue after game over (after watching rewarded ad)
   * Clears 3-5 random rows/columns to give player another chance
   */
  continue(): void {
    if (!this.canContinue) {
      console.warn('Cannot continue - already used');
      return;
    }

    console.log('Continuing game after rewarded ad...');

    // Mark continue as used
    this.canContinue = false;
    this.isGameOver = false;

    // Clear 3-5 random rows or columns to give player space
    const linesToClear = 3 + Math.floor(Math.random() * 3); // 3-5 lines
    let linesCleared = 0;

    // Try to clear random rows and columns
    for (let i = 0; i < linesToClear && linesCleared < linesToClear; i++) {
      const clearRow = Math.random() > 0.5;
      
      if (clearRow) {
        // Clear a random row
        const rowIndex = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
        if (this.board.hasFilledCells(rowIndex, true)) {
          this.board.clearRow(rowIndex);
          linesCleared++;
        }
      } else {
        // Clear a random column
        const colIndex = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
        if (this.board.hasFilledCells(colIndex, false)) {
          this.board.clearColumn(colIndex);
          linesCleared++;
        }
      }
    }

    console.log(`Cleared ${linesCleared} lines for continue`);
    
    // Don't award points for continue clears
    // Check if game is still playable
    this.checkGameOver();
  }

  /**
   * Get current game state as plain object (for serialization)
   */
  toJSON(): IGameState {
    return {
      board: this.board.getGrid(),
      currentPieces: this.currentPieces,
      score: this.score,
      bestScore: this.bestScore,
      isGameOver: this.isGameOver,
      canContinue: this.canContinue,
    };
  }

  /**
   * Get piece at index
   */
  getPiece(index: number): Piece | null {
    if (index >= 0 && index < this.currentPieces.length) {
      return this.currentPieces[index];
    }
    return null;
  }

  /**
   * Get all valid placement positions for a piece
   */
  getValidPlacements(pieceIndex: number): Array<{ x: number; y: number }> {
    const piece = this.getPiece(pieceIndex);
    if (!piece) {
      return [];
    }

    return this.board.getValidPlacements(piece);
  }

  /**
   * Check if a specific piece can be placed anywhere
   */
  canPieceBePlaced(pieceIndex: number): boolean {
    const piece = this.getPiece(pieceIndex);
    if (!piece) {
      return false;
    }

    return this.board.canPlaceAnyPiece([piece]);
  }
}

