import { useCallback, useEffect, useRef } from 'react'
import { ChessBoard } from './components/ChessBoard'
import { OpeningPanel } from './components/OpeningPanel'
import { MoveHistory } from './components/MoveHistory'
import { SetupScreen } from './components/SetupScreen'
import { SavedOpenings } from './components/SavedOpenings'
import { useChessGame } from './hooks/useChessGame'
import { useLLM } from './hooks/useLLM'
import { useOpeningAnalysis } from './hooks/useOpeningStats'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, signInWithGoogle, logout } = useAuth()
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

  const { status: llmStatus, progress: llmProgress, error: llmError, init: initLLM } = useLLM()
  const { data: openingData, analyzing, error: analysisError, analyze, clear } = useOpeningAnalysis()

  const prevMoveCount = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleMove = useCallback(
    (source: string, target: string) => makeMove(source, target),
    [makeMove],
  )

  useEffect(() => {
    if (llmStatus === 'ready' && moveHistory.length > 0 && moveHistory.length !== prevMoveCount.current) {
      prevMoveCount.current = moveHistory.length
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => analyze(moveHistory), 600)
    }
  }, [llmStatus, moveHistory, analyze])

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SetupScreen status={llmStatus} progress={llmProgress} error={llmError} onStart={initLLM} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♟</span>
            <div>
              <h1 className="text-lg font-bold">Chesser</h1>
              <p className="text-gray-500 text-xs">
                {llmStatus === 'ready' ? 'AI Ready' : 'Loading AI...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-gray-400 text-xs hidden sm:inline">
                  {user.displayName || user.email}
                </span>
                <button onClick={logout} className="text-gray-500 hover:text-gray-300 text-xs">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg"
              >
                Sign in with Google
              </button>
            )}

            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm py-2 px-3 rounded-lg"
            >
              ← Undo
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg"
            >
              ↺ New Game
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="max-w-lg mx-auto">
              <ChessBoard fen={fen} onMove={handleMove} isGameOver={isGameOver} />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {isCheckmate ? 'Checkmate!' : isDraw ? 'Draw' : isCheck ? 'Check!' : `${moveHistorySan.length} half-moves`}
                </span>
                <span className="text-xs text-gray-500">
                  {moveHistorySan.length > 0 && `Turn: ${moveHistorySan.length % 2 === 0 ? 'White' : 'Black'}`}
                </span>
              </div>
              <MoveHistory movesSan={moveHistorySan} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
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
