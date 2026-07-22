import type { OpeningStats } from '../types'
import type { Theme } from '../hooks/useTheme'

interface Props {
  stats: OpeningStats | null
  theme: Theme
}

export function StatsBar({ stats, theme }: Props) {
  if (!stats) return null

  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  return (
    <div className="w-full">
      <div className={`flex items-center justify-between text-[10px] sm:text-xs mb-1 ${labelClass}`}>
        <span>White {stats.white}%</span>
        <span>Draw {stats.draws}%</span>
        <span>Black {stats.black}%</span>
      </div>
      <div className={`flex h-2.5 sm:h-3 rounded-full overflow-hidden ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className="bg-white transition-all duration-500"
          style={{ width: `${stats.white}%` }}
          title={`White: ${stats.white}%`}
        />
        <div
          className="bg-gray-400 transition-all duration-500"
          style={{ width: `${stats.draws}%` }}
          title={`Draws: ${stats.draws}%`}
        />
        <div
          className="bg-gray-900 border-l border-gray-500 transition-all duration-500"
          style={{ width: `${stats.black}%` }}
          title={`Black: ${stats.black}%`}
        />
      </div>
      <p className={`text-[9px] sm:text-[10px] mt-1 text-center ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        Based on {stats.totalGames.toLocaleString()} master games
      </p>
    </div>
  )
}
