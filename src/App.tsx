import { useState, useCallback, useEffect, useRef } from 'react'
import { ChessBoard } from './components/ChessBoard'
import { OpeningPanel } from './components/OpeningPanel'
import { MoveHistory } from './components/MoveHistory'
import { LoginScreen } from './components/LoginScreen'
import { ApiKeySetup } from './components/ApiKeySetup'
import { SavedOpenings } from './components/SavedOpenings'
import { ThemeToggle } from './components/ThemeToggle'
import { useChessGame } from './hooks/useChessGame'
import { useOpeningAnalysis } from './hooks/useOpeningStats'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { hasApiKey, clearApiKey } from './services/llm'
import type { AppScreen } from './types'

export default function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const {
    fen,
    moveHistory,
    moveHistorySan,
    isCheck,
    isCheckmate,
    isDraw,
    isGameOver,
    makeMove,
    resetGame,
    undoMove,
  } = useChessGame()

  const { data: openingData, analyzing, error: analysisError, analyze, clear } = useOpeningAnalysis()

  const prevMoveCount = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [, forceUpdate] = useState(0)

  const screen: AppScreen = authLoading
    ? 'login'
    : !user
      ? 'login'
      : !hasApiKey()
        ? 'apikey'
        : 'app'

  const handleMove = useCallback(
    (source: string, target: string) => makeMove(source, target),
    [makeMove],
  )

  useEffect(() => {
    if (screen === 'app' && moveHistorySan.length > 0 && moveHistorySan.length !== prevMoveCount.current) {
      prevMoveCount.current = moveHistorySan.length
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => analyze(moveHistorySan), 600)
    }
  }, [screen, moveHistorySan, analyze])

  const handleReset = useCallback(() => {
    resetGame()
    clear()
    prevMoveCount.current = 0
  }, [resetGame, clear])

  const handleUndo = useCallback(() => undoMove(), [undoMove])

  const handleLoadSavedMoves = useCallback(
    (moves: string[]) => {
      clear()
      resetGame()
      moves.forEach((uci) => makeMove(uci.slice(0, 2), uci.slice(2, 4), uci[4]))
      prevMoveCount.current = moves.length
    },
    [clear, resetGame, makeMove],
  )

  const handleLogout = useCallback(() => {
    clearApiKey()
    logout()
  }, [logout])

  const handleApiKeyDone = useCallback(() => {
    forceUpdate((n) => n + 1)
  }, [])

  if (screen === 'login') {
    return <LoginScreen onSignIn={signInWithGoogle} error={authError} theme={theme} />
  }

  if (screen === 'apikey') {
    return <ApiKeySetup onDone={handleApiKeyDone} theme={theme} />
  }

  const isDark = theme === 'dark'

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-[#0a0a0f] text-gray-100'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
      }`}>
        {isDark && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <header className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl ${
                isDark
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
              }`}>
                ♟
              </div>
              <div>
                <h1 className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Chesser
                </h1>
                <p className={`text-[10px] sm:text-xs hidden sm:block ${
                  isDark ? 'text-cyan-400/60' : 'text-gray-500'
                }`}>
                  AI Opening Trainer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleUndo}
                disabled={moveHistory.length === 0}
                className={`text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="hidden sm:inline">← </span>Undo
              </button>
              <button
                onClick={handleReset}
                className={`text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="hidden sm:inline">↺ </span>New
              </button>

              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

              {user && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${
                      isDark ? 'ring-2 ring-cyan-500/30' : 'ring-2 ring-gray-200'
                    }`} />
                  )}
                  <button
                    onClick={handleLogout}
                    className={`text-xs hidden sm:block transition-colors ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <ChessBoard fen={fen} onMove={handleMove} isGameOver={isGameOver} theme={theme} />

              <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
                isDark
                  ? 'bg-white/[0.02] border-white/[0.06]'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] sm:text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {isCheckmate ? 'Checkmate!' : isDraw ? 'Draw' : isCheck ? 'Check!' : `${moveHistorySan.length} half-moves`}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {moveHistorySan.length > 0 && `Turn: ${moveHistorySan.length % 2 === 0 ? 'White' : 'Black'}`}
                  </span>
                </div>
                <MoveHistory movesSan={moveHistorySan} theme={theme} />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-3 sm:space-y-4">
              <OpeningPanel
                data={openingData}
                analyzing={analyzing}
                error={analysisError}
                moveCount={moveHistorySan.length}
                moveHistory={moveHistory}
                theme={theme}
              />
              {user && (
                <SavedOpenings
                  userId={user.uid}
                  moveHistory={moveHistory}
                  openingName={openingData?.opening.name || ''}
                  openingEco={openingData?.opening.eco || ''}
                  onLoadMoves={handleLoadSavedMoves}
                  theme={theme}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
