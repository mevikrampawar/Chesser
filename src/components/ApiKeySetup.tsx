import { useState, useCallback } from 'react'
import { setApiKey, testApiKey } from '../services/llm'
import type { Theme } from '../hooks/useTheme'

interface Props {
  onDone: () => void
  theme: Theme
}

export function ApiKeySetup({ onDone, theme }: Props) {
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    const trimmed = key.trim()
    if (!trimmed) return

    setTesting(true)
    setError(null)

    try {
      const valid = await testApiKey(trimmed)
      if (valid) {
        setApiKey(trimmed)
        onDone()
      } else {
        setError('Invalid API key. Get a free key at console.groq.com')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify API key')
    } finally {
      setTesting(false)
    }
  }, [key, onDone])

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">♟</div>
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Chesser</h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            One more step — enter your free Groq API key.
          </p>
        </div>

        <div className={`rounded-2xl p-6 border space-y-4 transition-colors ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200 shadow-lg'
        }`}>
          <div>
            <label className={`block text-xs mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Groq API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="gsk_..."
              className={`w-full rounded-lg px-4 py-3 text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
              } border outline-none`}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
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
              className="text-blue-500 hover:text-blue-600 text-xs"
            >
              Get free key at console.groq.com →
            </a>
          </div>

          <div className={`rounded-lg p-3 ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Free tier:</span> 30 requests/min, 6000 tokens/min.
              No credit card. Takes 2 minutes to sign up.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
