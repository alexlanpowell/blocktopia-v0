/**
 * GameState class managing the overall game state and logic
 * Adapted from Unity GameManager.cs and BoardManager.cs
 */

import { Board } from './Board';
import { generateRandomPiece } from './Piece';
import { calculateScore } from '../scoring/ScoreCalculator';
import { Piece, IGameState, BoardGrid } from '../../utils/types';
import { SoundEffect } from '../../services/audio/AudioManager';
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
  private async handleLineClearing(): Promise<void> {
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

      // Play appropriate sound based on lines cleared (dynamic import)
      try {
        const AudioManager = (await import('../../services/audio/AudioManager')).default;
        if (fullLines.totalLines >= 4) {
          AudioManager.playSoundEffect(SoundEffect.MULTI_LINE_CLEAR);
        } else {
          AudioManager.playSoundEffect(SoundEffect.LINE_CLEAR);
        }
      } catch (error) {
        // Silent fail - audio is non-critical
      }
    }
  }

  /**
   * Check if game is over (no pieces can be placed)
   */
  private async checkGameOver(): Promise<void> {
    const canPlace = this.board.canPlaceAnyPiece(this.currentPieces);

    if (!canPlace && !this.isGameOver) {
      this.isGameOver = true;
      // Play game over sound (dynamic import)
      try {
        const AudioManager = (await import('../../services/audio/AudioManager')).default;
        AudioManager.playSoundEffect(SoundEffect.GAME_OVER);
      } catch (error) {
        // Silent fail - audio is non-critical
      }
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
   * Continue after game over (after watching rewarded ad - "Extra Try")
   * Clears 4 random rows to give player another chance
   */
  continue(): void {
    if (!this.canContinue) {
      if (__DEV__) {
        console.warn('Cannot continue - already used');
      }
      return;
    }

    if (__DEV__) {
      console.log('Extra Try activated after rewarded ad...');
    }

    // Mark continue as used
    this.canContinue = false;
    this.isGameOver = false;

    // Clear exactly 4 random rows to give player space
    const rowsToClear = 4;
    let rowsCleared = 0;

    // Try to clear 4 random rows
    const attemptedRows = new Set<number>();
    
    while (rowsCleared < rowsToClear && attemptedRows.size < GAME_CONFIG.BOARD_SIZE) {
      const rowIndex = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      
      // Skip if we already tried this row
      if (attemptedRows.has(rowIndex)) {
        continue;
      }
      
      attemptedRows.add(rowIndex);
      
      // Clear the row if it has any filled cells
      if (this.board.hasFilledCells(rowIndex, true)) {
        this.board.clearRow(rowIndex);
        rowsCleared++;
      }
    }

    if (__DEV__) {
      console.log(`Extra Try: Cleared ${rowsCleared} rows`);
    }
    
    // Don't award points for extra try clears
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
      try {
        if (!this.currentPieces || !Array.isArray(this.currentPieces)) {
          if (__DEV__) {
            console.error('currentPieces is not a valid array');
          }
          return null;
        }
        
        if (index >= 0 && index < this.currentPieces.length) {
          const piece = this.currentPieces[index];
          // Validate piece structure
          if (piece && piece.structure && Array.isArray(piece.structure)) {
            return piece;
          }
          if (__DEV__) {
            console.error('Invalid piece at index:', index, piece);
          }
          return null;
        }
        return null;
      } catch (error) {
        if (__DEV__) {
          console.error('Error in getPiece:', error);
        }
        return null;
      }
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
    try {
      // Validate board exists
      if (!this.board) {
        if (__DEV__) {
          console.error('Board is null in canPieceBePlaced');
        }
        return false;
      }

      const piece = this.getPiece(pieceIndex);
      if (!piece) {
        return false;
      }

      // Validate piece structure exists
      if (!piece.structure || !Array.isArray(piece.structure) || piece.structure.length === 0) {
        if (__DEV__) {
          console.error('Invalid piece structure:', piece);
        }
        return false;
      }

      return this.board.canPlaceAnyPiece([piece]);
    } catch (error) {
      if (__DEV__) {
        console.error('Error in canPieceBePlaced:', error);
      }
      return false;
    }
  }

  /**
   * Serialize game state for storage
   */
  serialize(): {
    board: BoardGrid;
    currentPieces: Piece[];
    score: number;
    bestScore: number;
    isGameOver: boolean;
    canContinue: boolean;
    timestamp: number;
  } {
    return {
      board: this.board.getGrid(),
      currentPieces: this.currentPieces,
      score: this.score,
      bestScore: this.bestScore,
      isGameOver: this.isGameOver,
      canContinue: this.canContinue,
      timestamp: Date.now(),
    };
  }

  /**
   * Restore from serialized state
   */
  static deserialize(data: {
    board: BoardGrid;
    currentPieces: Piece[];
    score: number;
    bestScore: number;
    isGameOver: boolean;
    canContinue: boolean;
  }): GameState {
    const gameState = new GameState(data.bestScore);
    
    // Restore board
    gameState.board.setGrid(data.board);
    
    // Restore pieces
    gameState.currentPieces = data.currentPieces;
    
    // Restore score and state
    gameState.score = data.score;
    gameState.isGameOver = data.isGameOver;
    gameState.canContinue = data.canContinue;
    
    return gameState;
  }
}

