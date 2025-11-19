"use strict";
/**
 * Piece class representing a block piece in Blocktopia
 * Adapted from Unity Block.cs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPiece = generateRandomPiece;
exports.generatePieceById = generatePieceById;
exports.calculatePieceBounds = calculatePieceBounds;
exports.getPieceFirstCell = getPieceFirstCell;
exports.arePiecesEqual = arePiecesEqual;
exports.clonePiece = clonePiece;
const constants_1 = require("../constants");
const types_1 = require("../../utils/types");
/**
 * Generate a random piece from available shapes
 */
function generateRandomPiece() {
    const randomIndex = Math.floor(Math.random() * constants_1.GAME_CONFIG.SHAPE_COUNT);
    return generatePieceById(randomIndex);
}
/**
 * Generate a piece by its shape ID
 */
function generatePieceById(id) {
    if (id < 0 || id >= constants_1.PIECE_SHAPES.length) {
        throw new Error(`Invalid piece ID: ${id}. Must be between 0 and ${constants_1.PIECE_SHAPES.length - 1}`);
    }
    const structure = constants_1.PIECE_SHAPES[id];
    const bounds = calculatePieceBounds(structure);
    const color = types_1.PIECE_COLORS[id % types_1.PIECE_COLORS.length];
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
function calculatePieceBounds(structure) {
    if (structure.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    }
    let minX = structure[0].x;
    let maxX = structure[0].x;
    let minY = structure[0].y;
    let maxY = structure[0].y;
    for (const cell of structure) {
        if (cell.x < minX)
            minX = cell.x;
        if (cell.x > maxX)
            maxX = cell.x;
        if (cell.y < minY)
            minY = cell.y;
        if (cell.y > maxY)
            maxY = cell.y;
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
function getPieceFirstCell(piece) {
    if (piece.structure.length === 0) {
        return { x: 0, y: 0 };
    }
    return piece.structure[0];
}
/**
 * Check if two pieces are the same shape
 */
function arePiecesEqual(piece1, piece2) {
    return piece1.id === piece2.id;
}
/**
 * Clone a piece (create a deep copy)
 */
function clonePiece(piece) {
    return {
        ...piece,
        structure: [...piece.structure.map(cell => ({ ...cell }))],
    };
}
