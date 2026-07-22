import type { TopMove } from '../types'
import type { Theme } from '../hooks/useTheme'

interface Props {
  moves: TopMove[]
  theme: Theme
}

export function TopMoves({ moves, theme }: Props) {
  if (moves.length === 0) return null

  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const bgClass = theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'
  const barBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'

  return (
    <div>
      <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
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
              className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm rounded px-2 sm:px-3 py-1.5 transition-colors ${bgClass}`}
            >
              <span className={`font-mono font-semibold w-10 sm:w-14 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {move.san}
              </span>
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden flex ${barBg}`}>
                <div className="bg-white" style={{ width: `${whitePct}%` }} />
                <div className="bg-gray-400" style={{ width: `${drawPct}%` }} />
              </div>
              <span className={`${labelClass} text-[10px] sm:text-xs w-16 text-right shrink-0`}>
                {whitePct}/{drawPct}/{100 - whitePct - drawPct}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
