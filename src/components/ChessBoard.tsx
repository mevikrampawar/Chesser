import { useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Theme } from '../hooks/useTheme'

interface Props {
  fen: string
  onMove: (source: string, target: string) => boolean
  isGameOver: boolean
  theme: Theme
}

export function ChessBoard({ fen, onMove, isGameOver, theme }: Props) {
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
              borderRadius: '8px',
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.12)',
              width: '100%',
              height: '100%',
            },
          }}
        />
      </div>
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-white text-lg sm:text-2xl font-bold bg-black/70 px-6 py-3 rounded-lg">
            Game Over
          </span>
        </div>
      )}
    </div>
  )
}
