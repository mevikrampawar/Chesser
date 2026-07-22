import { useCallback, useEffect, useRef } from 'react'
import { ChessBoard } from './components/ChessBoard'
import { OpeningPanel } from './components/OpeningPanel'
import { MoveHistory } from './components/MoveHistory'
import { LoginScreen } from './components/LoginScreen'
import { ApiKeySetup } from './components/ApiKeySetup'
import { SavedOpenings } from './components/SavedOpenings'
import { useChessGame } from './hooks/useChessGame'
import { useOpeningAnalysis } from './hooks/useOpeningStats'
import { useAuth } from './hooks/useAuth'
import { hasApiKey, clearApiKey } from './services/llm'
import type { AppScreen } from './types'

export default function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, logout } = useAuth()
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
    if (screen === 'app' && moveHistory.length > 0 && moveHistory.length !== prevMoveCount.current) {
      prevMoveCount.current = moveHistory.length
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => analyze(moveHistory), 600)
    }
  }, [screen, moveHistory, analyze])

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

  if (screen === 'login') {
    return <LoginScreen onSignIn={signInWithGoogle} error={authError} />
  }

  if (screen === 'apikey') {
    return <ApiKeySetup onDone={() => {}} />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">♟</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold">Chesser</h1>
              <p className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">
                AI Opening Trainer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">← </span>Undo
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">↺ </span>New
            </button>

            <div className="w-px h-6 bg-gray-800 mx-1" />

            {user && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-300 text-xs hidden sm:block"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="max-w-lg mx-auto">
              <ChessBoard fen={fen} onMove={handleMove} isGameOver={isGameOver} />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {isCheckmate ? 'Checkmate!' : isDraw ? 'Draw' : isCheck ? 'Check!' : `${moveHistorySan.length} half-moves`}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {moveHistorySan.length > 0 && `Turn: ${moveHistorySan.length % 2 === 0 ? 'White' : 'Black'}`}
                </span>
              </div>
              <MoveHistory movesSan={moveHistorySan} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <OpeningPanel
              data={openingData}
              analyzing={analyzing}
              error={analysisError}
              moveCount={moveHistory.length}
            />
            {user && (
              <SavedOpenings
                userId={user.uid}
                moveHistory={moveHistory}
                openingName={openingData?.opening.name || ''}
                openingEco={openingData?.opening.eco || ''}
                onLoadMoves={handleLoadSavedMoves}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
