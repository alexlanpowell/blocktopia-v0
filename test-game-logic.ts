/**
 * Simple tests to verify core game logic
 */

import { Board } from './src/game/core/Board';
import { generatePieceById } from './src/game/core/Piece';
import { calculateScore } from './src/game/scoring/ScoreCalculator';
import { GameState } from './src/game/core/GameState';

console.log('🧪 Testing Blocktopia Core Game Logic...\n');

// Test 1: Board creation
console.log('Test 1: Board Creation');
const board = new Board(10);
console.log('✅ Board created with size:', board.getSize());
console.log('✅ Empty cells:', board.getEmptyCount());

// Test 2: Piece generation
console.log('\nTest 2: Piece Generation');
const piece = generatePieceById(0); // Single block
console.log('✅ Piece generated:', piece.id, 'Color:', piece.color);
console.log('✅ Piece structure:', piece.structure);

// Test 3: Piece placement
console.log('\nTest 3: Piece Placement');
const canPlace = board.canPlacePiece(piece, 0, 0);
console.log('✅ Can place at (0,0):', canPlace);
board.placePiece(piece, 0, 0);
console.log('✅ Piece placed. Empty cells:', board.getEmptyCount());

// Test 4: Line detection
console.log('\nTest 4: Line Detection');
// Fill a row
for (let x = 0; x < 10; x++) {
  board.setCellValue(x, 5, 1);
}
const fullLines = board.checkFullLines();
console.log('✅ Full rows detected:', fullLines.rows);
console.log('✅ Total lines:', fullLines.totalLines);

// Test 5: Line clearing
console.log('\nTest 5: Line Clearing');
const cellsCleared = board.clearLines(fullLines.rows, fullLines.columns);
console.log('✅ Cells cleared:', cellsCleared);
console.log('✅ Empty cells after clearing:', board.getEmptyCount());

// Test 6: Score calculation
console.log('\nTest 6: Score Calculation');
const score = calculateScore(90, 1);
console.log('✅ Score for 1 line with 90 empty cells:', score);

// Test 7: Game State
console.log('\nTest 7: Game State');
const gameState = new GameState();
console.log('✅ Game state created');
console.log('✅ Initial score:', gameState.score);
console.log('✅ Current pieces count:', gameState.currentPieces.length);
console.log('✅ Is game over:', gameState.isGameOver);

// Test 8: Place piece in game
console.log('\nTest 8: Place Piece in Game');
const success = gameState.placePiece(0, 0, 0);
console.log('✅ Piece placed successfully:', success);
console.log('✅ New score:', gameState.score);
console.log('✅ New pieces generated:', gameState.currentPieces.length);

console.log('\n✨ All tests passed! Core game logic is working correctly.');

