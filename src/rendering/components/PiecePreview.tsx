/**
 * PiecePreview Component - Shows the 3 available pieces at the bottom
 * Optimized with React.memo for performance
 */

import React, { useMemo, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect, Group } from '@shopify/react-native-skia';
import { useCurrentPieces, useGameStore } from '../../store/gameStore';
import { Piece } from '../../utils/types';
import { GAME_CONFIG } from '../../game/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PIECE_PREVIEW_HEIGHT = 150;
const PIECE_CONTAINER_WIDTH = SCREEN_WIDTH / 3;
const CELL_SIZE = 24;
const CELL_GAP = 2;

interface SinglePiecePreviewProps {
  piece: Piece;
  index: number;
  canBePlaced: boolean;
}

const SinglePiecePreview = memo(function SinglePiecePreview({ piece, index, canBePlaced }: SinglePiecePreviewProps) {
  const pieceCells = useMemo(() => {
    const cells: React.ReactElement[] = [];

    // Calculate piece bounds for centering
    const minX = Math.min(...piece.structure.map(cell => cell.x));
    const maxX = Math.max(...piece.structure.map(cell => cell.x));
    const minY = Math.min(...piece.structure.map(cell => cell.y));
    const maxY = Math.max(...piece.structure.map(cell => cell.y));

    const pieceWidth = (maxX - minX + 1) * (CELL_SIZE + CELL_GAP);
    const pieceHeight = (maxY - minY + 1) * (CELL_SIZE + CELL_GAP);

    // Center offset
    const offsetX = (PIECE_CONTAINER_WIDTH - pieceWidth) / 2;
    const offsetY = (PIECE_PREVIEW_HEIGHT - pieceHeight) / 2;

    // Render each cell of the piece
    for (const cell of piece.structure) {
      const cellX = offsetX + (cell.x - minX) * (CELL_SIZE + CELL_GAP);
      const cellY = offsetY + (cell.y - minY) * (CELL_SIZE + CELL_GAP);

      cells.push(
        <RoundedRect
          key={`piece-${index}-cell-${cell.x}-${cell.y}`}
          x={cellX}
          y={cellY}
          width={CELL_SIZE}
          height={CELL_SIZE}
          r={4}
          color={piece.color}
          opacity={canBePlaced ? 1 : 0.4}
        />
      );
    }

    return cells;
  }, [piece, index, canBePlaced]);

  return (
    <View style={styles.pieceContainer}>
      <Canvas style={styles.pieceCanvas}>
        <Group>{pieceCells}</Group>
      </Canvas>
    </View>
  );
});

export const PiecePreview = memo(function PiecePreview() {
  const currentPieces = useCurrentPieces();
  const canPieceBePlaced = useGameStore(state => state.canPieceBePlaced);

  return (
    <View style={styles.container}>
      {currentPieces.map((piece, index) => {
        const canPlace = canPieceBePlaced(index);
        return (
          <SinglePiecePreview
            key={`piece-preview-${index}-${piece.id}`}
            piece={piece}
            index={index}
            canBePlaced={canPlace}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  pieceContainer: {
    width: PIECE_CONTAINER_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceCanvas: {
    width: PIECE_CONTAINER_WIDTH,
    height: PIECE_PREVIEW_HEIGHT,
  },
});

