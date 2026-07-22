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
    <div className="relative w-full">
      <div className="aspect-square w-full max-w-lg mx-auto">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: handlePieceDrop,
            animationDurationInMs: 150,
            allowDragging: !isGameOver,
            darkSquareStyle: { backgroundColor: '#5B8C5A' },
            lightSquareStyle: { backgroundColor: '#F0D9B5' },
            boardStyle: {
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              width: '100%',
              height: '100%',
            },
          }}
        />
      </div>
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
          <span className="text-white text-lg sm:text-2xl font-bold bg-black/70 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
            Game Over
          </span>
        </div>
      )}
    </div>
  )
}
