import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/hooks/useTheme'

interface Props {
  onSignIn: () => Promise<void>
  error: string | null
  theme: Theme
}

export function LoginScreen({ onSignIn, error, theme }: Props) {
  const [loading, setLoading] = useState(false)
  const isDark = theme === 'dark'

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await onSignIn()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>
      )}

      <div className={`relative max-w-sm w-full space-y-8 p-8 rounded-2xl border ${
        isDark
          ? 'bg-[#0f0f17]/80 backdrop-blur-xl border-white/10'
          : 'bg-white/80 backdrop-blur-xl border-gray-200 shadow-xl'
      }`}>
        <div className="text-center space-y-3">
          <div className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center text-3xl mx-auto ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
          }`}>
            ♟
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Chesser
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            AI-powered chess opening trainer
          </p>
        </div>

        {error && (
          <div className={`text-sm text-center p-3 rounded-lg ${
            isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            {error}
          </div>
        )}

        <Button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <p className={`text-[10px] text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          No features are available without signing in.
          <br />
          Your data is stored securely in Firebase.
        </p>
      </div>
    </div>
  )
}
