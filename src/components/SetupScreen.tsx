import { type LLMProgress } from '../services/llm'
import type { LLMStatus } from '../types'

interface Props {
  status: LLMStatus
  progress: LLMProgress
  error: string | null
  onStart: () => void
}

export function SetupScreen({ status, progress, error, onStart }: Props) {
  if (status === 'ready') return null

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-5xl mb-4">♟</div>
        <h1 className="text-2xl font-bold text-white mb-2">Chess Opening Trainer</h1>
        <p className="text-gray-400 text-sm mb-6">
          AI-powered opening identification and coaching. Runs entirely in your browser.
        </p>

        {status === 'idle' && (
          <button
            onClick={onStart}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Load AI Model
          </button>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.round(progress.progress * 100)}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              {Math.round(progress.progress * 100)}% — {progress.text}
            </p>
            <p className="text-gray-600 text-xs">
              First load downloads ~2GB. Cached for offline use after.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={onStart}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
            <p className="text-gray-600 text-xs">
              WebGPU is required. Use Chrome, Edge, or Firefox 107+.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
