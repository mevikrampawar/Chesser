import type { OpeningData } from '../types'
import { StatsBar } from './StatsBar'
import { TopMoves } from './TopMoves'

interface Props {
  data: OpeningData | null
  analyzing: boolean
  error: string | null
  moveCount: number
}

export function OpeningPanel({ data, analyzing, error, moveCount }: Props) {
  if (moveCount === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">♟</div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Play Some Moves
        </h2>
        <p className="text-gray-400 text-sm">
          Make moves on the board and the AI will identify the opening and provide coaching.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-950/50 border border-red-800 rounded-xl p-6">
        <h3 className="text-red-400 font-semibold mb-1">Error</h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {analyzing && (
        <div className="flex items-center gap-3 text-amber-400">
          <div className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Analyzing opening...</span>
        </div>
      )}

      {data && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                {data.opening.eco}
              </span>
              {data.lichessOpening && (
                <span className="text-[10px] text-gray-500">Verified by Lichess</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{data.opening.name}</h2>
          </div>

          <StatsBar stats={data.stats} />

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              About This Opening
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {data.opening.explanation}
            </p>
          </div>

          {data.opening.keyIdeas && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Key Ideas
              </h4>
              <ul className="space-y-1">
                {data.opening.keyIdeas.split(';').map((idea, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-blue-400 mt-0.5">▸</span>
                    <span>{idea.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.opening.commonContinuations && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Common Continuations
              </h4>
              <p className="text-gray-300 text-sm font-mono">
                {data.opening.commonContinuations}
              </p>
            </div>
          )}

          <TopMoves moves={data.topMoves} />
        </>
      )}
    </div>
  )
}
