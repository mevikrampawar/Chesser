import { useState, useCallback } from 'react'
import { setApiKey, testApiKey } from '../services/llm'

interface Props {
  onDone: () => void
}

export function ApiKeySetup({ onDone }: Props) {
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    const trimmed = key.trim()
    if (!trimmed) return

    setTesting(true)
    setError(null)

    const valid = await testApiKey(trimmed)
    if (valid) {
      setApiKey(trimmed)
      onDone()
    } else {
      setError('Invalid API key. Get a free key at console.groq.com')
    }
    setTesting(false)
  }, [key, onDone])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">♟</div>
          <h1 className="text-3xl font-bold text-white mb-2">Chesser</h1>
          <p className="text-gray-400 text-sm">
            One more step — enter your free Groq API key.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Groq API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="gsk_..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!key.trim() || testing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {testing ? 'Verifying...' : 'Save & Continue'}
          </button>

          <div className="text-center">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              Get free key at console.groq.com →
            </a>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="text-white font-medium">Free tier:</span> 30 requests/min, 6000 tokens/min.
              No credit card. Takes 2 minutes to sign up.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
