import type { Theme } from '../hooks/useTheme'

interface Props {
  onSignIn: () => void
  error: string | null
  theme: Theme
}

export function LoginScreen({ onSignIn, error, theme }: Props) {
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
            AI-powered chess opening trainer. Learn openings instantly.
          </p>
        </div>

        <div className={`rounded-2xl p-6 border transition-colors ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200 shadow-lg'
        }`}>
          <button
            onClick={onSignIn}
            className={`w-full flex items-center justify-center gap-3 font-semibold py-3 px-6 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-white hover:bg-gray-100 text-gray-900'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        <p className={`text-xs text-center mt-6 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Free &middot; Open Source &middot; No data collected
        </p>
      </div>
    </div>
  )
}
