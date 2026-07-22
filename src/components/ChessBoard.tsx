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
  const isDark = theme === 'dark'

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false
      return onMove(sourceSquare, targetSquare)
    },
    [onMove],
  )

  return (
    <div className={`relative rounded-xl p-2 sm:p-3 ${
      isDark
        ? 'bg-white/[0.02] border border-white/[0.06]'
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="aspect-square w-full max-w-lg mx-auto">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: handlePieceDrop,
            animationDurationInMs: 150,
            allowDragging: !isGameOver,
            darkSquareStyle: {
              backgroundColor: isDark ? '#1a3a2a' : '#5B8C5A',
            },
            lightSquareStyle: {
              backgroundColor: isDark ? '#2a5a3a' : '#F0D9B5',
            },
            boardStyle: {
              borderRadius: '8px',
              boxShadow: isDark
                ? '0 0 40px rgba(0, 255, 255, 0.08), 0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              width: '100%',
              height: '100%',
            },
          }}
        />
      </div>
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <div className={`px-6 py-3 rounded-lg backdrop-blur-sm ${
            isDark
              ? 'bg-black/70 border border-red-500/30 text-red-400'
              : 'bg-black/70 text-white'
          }`}>
            <span className="text-lg sm:text-2xl font-bold">Game Over</span>
          </div>
        </div>
      )}
    </div>
  )
}
