import type { OpeningData } from '../types'
import { StatsBar } from './StatsBar'
import { TopMoves } from './TopMoves'
import { ShareOpening } from './ShareOpening'
import type { Theme } from '../hooks/useTheme'

interface Props {
  data: OpeningData | null
  analyzing: boolean
  error: string | null
  moveCount: number
  moveHistory: string[]
  theme: Theme
}

export function OpeningPanel({ data, analyzing, error, moveCount, moveHistory, theme }: Props) {
  const isDark = theme === 'dark'

  if (moveCount === 0) {
    return (
      <div className={`rounded-xl p-4 sm:p-6 text-center border transition-colors ${
        isDark
          ? 'bg-white/[0.02] border-white/[0.06]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center text-3xl mb-4 ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400/60'
            : 'bg-gray-100 text-gray-400'
        }`}>
          ♟
        </div>
        <h2 className={`text-base sm:text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Play Some Moves
        </h2>
        <p className={`text-xs sm:text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Make moves on the board and the AI will identify the opening.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-xl p-4 sm:p-6 border ${
        isDark
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className={`font-semibold mb-1 text-sm ${
          isDark ? 'text-red-400' : 'text-red-600'
        }`}>Error</h3>
        <p className={`text-xs sm:text-sm ${
          isDark ? 'text-red-300' : 'text-red-500'
        }`}>{error}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 border transition-colors ${
      isDark
        ? 'bg-white/[0.02] border-white/[0.06]'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {analyzing && (
        <div className={`flex items-center gap-3 ${
          isDark ? 'text-cyan-400' : 'text-amber-500'
        }`}>
          <div className={`animate-spin w-4 h-4 border-2 rounded-full ${
            isDark
              ? 'border-cyan-400 border-t-transparent'
              : 'border-amber-500 border-t-transparent'
          }`} />
          <span className="text-xs sm:text-sm font-medium">Analyzing opening...</span>
        </div>
      )}

      {data && (
        <>
          <div>
            <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded ${
              isDark
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {data.opening.eco}
            </span>
            <h2 className={`text-lg sm:text-xl font-bold mt-1 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{data.opening.name}</h2>
          </div>

          <StatsBar stats={data.stats} theme={theme} />

          <div>
            <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              About This Opening
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {data.opening.explanation}
            </p>
          </div>

          {data.opening.keyIdeas && data.opening.keyIdeas !== 'N/A' && (
            <div>
              <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Key Ideas
              </h4>
              <ul className="space-y-1">
                {data.opening.keyIdeas.split(';').map((idea, i) => (
                  <li key={i} className={`text-xs sm:text-sm flex gap-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className={`mt-0.5 shrink-0 ${
                      isDark ? 'text-cyan-400' : 'text-blue-500'
                    }`}>▸</span>
                    <span>{idea.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.opening.commonContinuations && data.opening.commonContinuations !== 'N/A' && (
            <div>
              <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Common Continuations
              </h4>
              <p className={`text-xs sm:text-sm font-mono ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {data.opening.commonContinuations}
              </p>
            </div>
          )}

          <TopMoves moves={data.topMoves} theme={theme} />

          <ShareOpening
            moveHistory={moveHistory}
            openingName={data.opening.name}
            openingEco={data.opening.eco}
            theme={theme}
          />
        </>
      )}
    </div>
  )
}
