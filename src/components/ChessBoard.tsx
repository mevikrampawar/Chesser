import { useCallback, useRef, useState, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Theme } from '@/hooks/useTheme'

interface Props {
  fen: string
  onMove: (source: string, target: string) => boolean
  isGameOver: boolean
  theme: Theme
}

export function ChessBoard({ fen, onMove, isGameOver, theme }: Props) {
  const isDark = theme === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const w = el.clientWidth
      if (w > 0) setWidth(w)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false
      return onMove(sourceSquare, targetSquare)
    },
    [onMove],
  )

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl p-2 sm:p-3 ${
        isDark
          ? 'bg-white/[0.02] border border-white/[0.06]'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
    >
      {width > 0 && (
        <div className="mx-auto" style={{ width: Math.min(width, 500), height: Math.min(width, 500) }}>
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
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                boxShadow: isDark
                  ? '0 0 40px rgba(0, 255, 255, 0.08), 0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
              },
            }}
          />
        </div>
      )}
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
