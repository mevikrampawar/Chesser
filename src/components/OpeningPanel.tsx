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
  const cardClass = theme === 'dark'
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200 shadow-sm'
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const mutedClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  if (moveCount === 0) {
    return (
      <div className={`${cardClass} border rounded-xl p-4 sm:p-6 text-center transition-colors`}>
        <div className="text-4xl mb-3">♟</div>
        <h2 className={`text-base sm:text-lg font-semibold mb-2 ${textClass}`}>
          Play Some Moves
        </h2>
        <p className={`${subTextClass} text-xs sm:text-sm`}>
          Make moves on the board and the AI will identify the opening and provide coaching.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-red-600 dark:text-red-400 font-semibold mb-1 text-sm">Error</h3>
        <p className="text-red-500 dark:text-red-300 text-xs sm:text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={`${cardClass} border rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 transition-colors`}>
      {analyzing && (
        <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
          <div className="animate-spin w-4 h-4 border-2 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full" />
          <span className="text-xs sm:text-sm font-medium">Analyzing opening...</span>
        </div>
      )}

      {data && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {data.opening.eco}
              </span>
              {data.lichessOpening && (
                <span className={`text-[9px] sm:text-[10px] ${mutedClass}`}>Verified by Lichess</span>
              )}
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${textClass}`}>{data.opening.name}</h2>
          </div>

          <StatsBar stats={data.stats} theme={theme} />

          <div>
            <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
              About This Opening
            </h4>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-xs sm:text-sm leading-relaxed`}>
              {data.opening.explanation}
            </p>
          </div>

          {data.opening.keyIdeas && (
            <div>
              <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
                Key Ideas
              </h4>
              <ul className="space-y-1">
                {data.opening.keyIdeas.split(';').map((idea, i) => (
                  <li key={i} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-xs sm:text-sm flex gap-2`}>
                    <span className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0">▸</span>
                    <span>{idea.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.opening.commonContinuations && (
            <div>
              <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
                Common Continuations
              </h4>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-xs sm:text-sm font-mono`}>
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
