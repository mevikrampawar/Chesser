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
  const isDark = theme === 'dark'

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
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {isDark && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`inline-flex w-20 h-20 rounded-2xl items-center justify-center text-4xl mb-6 ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
          }`}>
            ♟
          </div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Chesser</h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            One more step — enter your free Groq API key.
          </p>
        </div>

        <div className={`rounded-2xl p-6 border space-y-4 transition-colors ${
          isDark
            ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-sm'
            : 'bg-white border-gray-200 shadow-lg'
        }`}>
          <div>
            <label className={`block text-xs mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Groq API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="gsk_..."
              className={`w-full rounded-xl px-4 py-3 text-sm transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
              } outline-none`}
            />
          </div>

          {error && (
            <div className={`rounded-xl p-3 ${
              isDark
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!key.trim() || testing}
            className={`w-full font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {testing ? 'Verifying...' : 'Save & Continue'}
          </button>

          <div className="text-center">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs ${
                isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              Get free key at console.groq.com →
            </a>
          </div>

          <div className={`rounded-xl p-3 ${
            isDark ? 'bg-white/[0.02]' : 'bg-gray-50'
          }`}>
            <p className={`text-xs leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className={`font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Free tier:</span> 30 requests/min, 6000 tokens/min.
              No credit card. Takes 2 minutes to sign up.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
