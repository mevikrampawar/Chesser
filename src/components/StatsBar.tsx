import type { OpeningStats } from '../types'
import type { Theme } from '../hooks/useTheme'

interface Props {
  stats: OpeningStats | null
  theme: Theme
}

export function StatsBar({ stats, theme }: Props) {
  if (!stats) return null

  const isDark = theme === 'dark'

  return (
    <div className="w-full">
      <div className={`flex items-center justify-between text-[10px] sm:text-xs mb-1 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>White {stats.white}%</span>
        <span>Draw {stats.draws}%</span>
        <span>Black {stats.black}%</span>
      </div>
      <div className={`flex h-2.5 sm:h-3 rounded-full overflow-hidden ${
        isDark ? 'bg-white/5' : 'bg-gray-100'
      }`}>
        <div
          className={`transition-all duration-500 ${
            isDark ? 'bg-white' : 'bg-gray-900'
          }`}
          style={{ width: `${stats.white}%` }}
          title={`White: ${stats.white}%`}
        />
        <div
          className={`transition-all duration-500 ${
            isDark ? 'bg-gray-500' : 'bg-gray-400'
          }`}
          style={{ width: `${stats.draws}%` }}
          title={`Draws: ${stats.draws}%`}
        />
        <div
          className={`transition-all duration-500 ${
            isDark ? 'bg-gray-700' : 'bg-gray-300'
          }`}
          style={{ width: `${stats.black}%` }}
          title={`Black: ${stats.black}%`}
        />
      </div>
      <p className={`text-[9px] sm:text-[10px] mt-1 text-center ${
        isDark ? 'text-gray-600' : 'text-gray-400'
      }`}>
        Approximate win rates
      </p>
    </div>
  )
}
