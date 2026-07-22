import { useCallback } from 'react'
import { Chessboard } from 'react-chessboard'

interface Props {
  fen: string
  onMove: (source: string, target: string) => boolean
  isGameOver: boolean
}

export function ChessBoard({ fen, onMove, isGameOver }: Props) {
  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false
      return onMove(sourceSquare, targetSquare)
    },
    [onMove],
  )

  return (
    <div className="relative">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop: handlePieceDrop,
          animationDurationInMs: 200,
          allowDragging: !isGameOver,
          darkSquareStyle: { backgroundColor: '#5B8C5A' },
          lightSquareStyle: { backgroundColor: '#F0D9B5' },
          boardStyle: {
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
        }}
      />
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
          <span className="text-white text-2xl font-bold bg-black/70 px-6 py-3 rounded-lg">
            Game Over
          </span>
        </div>
      )}
    </div>
  )
}
