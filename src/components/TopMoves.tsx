import type { TopMove } from '../types'
import type { Theme } from '../hooks/useTheme'

interface Props {
  moves: TopMove[]
  theme: Theme
}

export function TopMoves({ moves, theme }: Props) {
  if (moves.length === 0) return null

  const isDark = theme === 'dark'

  return (
    <div>
      <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        Top Continuations
      </h4>
      <div className="space-y-1">
        {moves.map((move, i) => {
          const total = move.white + move.draws + move.black
          const whitePct = total > 0 ? Math.round((move.white / total) * 100) : 0
          const drawPct = total > 0 ? Math.round((move.draws / total) * 100) : 0

          return (
            <div
              key={`${move.san}-${i}`}
              className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 transition-all ${
                isDark
                  ? 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <span className={`font-mono font-semibold w-10 sm:w-14 ${
                isDark ? 'text-cyan-400' : 'text-gray-900'
              }`}>
                {move.san}
              </span>
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden flex ${
                isDark ? 'bg-white/5' : 'bg-gray-100'
              }`}>
                <div className={`bg-white ${isDark ? '' : 'bg-gray-800'}`} style={{ width: `${whitePct}%` }} />
                <div className={`bg-gray-500 ${isDark ? '' : 'bg-gray-400'}`} style={{ width: `${drawPct}%` }} />
              </div>
              <span className={`text-[10px] sm:text-xs w-16 text-right shrink-0 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {whitePct}/{drawPct}/{100 - whitePct - drawPct}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
