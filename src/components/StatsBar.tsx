import type { OpeningStats } from '../types'

interface Props {
  stats: OpeningStats | null
}

export function StatsBar({ stats }: Props) {
  if (!stats) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400 mb-1">
        <span>White {stats.white}%</span>
        <span>Draw {stats.draws}%</span>
        <span>Black {stats.black}%</span>
      </div>
      <div className="flex h-2.5 sm:h-3 rounded-full overflow-hidden bg-gray-700">
        <div
          className="bg-white transition-all duration-500"
          style={{ width: `${stats.white}%` }}
          title={`White: ${stats.white}%`}
        />
        <div
          className="bg-gray-500 transition-all duration-500"
          style={{ width: `${stats.draws}%` }}
          title={`Draws: ${stats.draws}%`}
        />
        <div
          className="bg-gray-900 border-l border-gray-600 transition-all duration-500"
          style={{ width: `${stats.black}%` }}
          title={`Black: ${stats.black}%`}
        />
      </div>
      <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1 text-center">
        Based on {stats.totalGames.toLocaleString()} Lichess games
      </p>
    </div>
  )
}
