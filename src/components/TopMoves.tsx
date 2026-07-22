import type { LichessMove } from '../types'

interface Props {
  moves: LichessMove[]
}

export function TopMoves({ moves }: Props) {
  if (moves.length === 0) return null

  const displayed = moves.slice(0, 8)

  return (
    <div>
      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Popular Continuations
      </h4>
      <div className="space-y-1">
        {displayed.map((move) => {
          const total = move.white + move.draws + move.black
          const whitePct = total > 0 ? Math.round((move.white / total) * 100) : 0
          const drawPct = total > 0 ? Math.round((move.draws / total) * 100) : 0

          return (
            <div
              key={move.uci}
              className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-gray-800/50 rounded px-2 sm:px-3 py-1.5 hover:bg-gray-800 transition-colors"
            >
              <span className="font-mono font-semibold text-white w-10 sm:w-14">
                {move.san}
              </span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden flex">
                <div className="bg-white" style={{ width: `${whitePct}%` }} />
                <div className="bg-gray-500" style={{ width: `${drawPct}%` }} />
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs w-14 sm:w-20 text-right shrink-0">
                {move.averageRating} avg
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
