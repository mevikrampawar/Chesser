import { useState, useCallback, useEffect, useRef } from 'react'
import { ChessBoard } from './components/ChessBoard'
import { OpeningPanel } from './components/OpeningPanel'
import { MoveHistory } from './components/MoveHistory'
import { LoginScreen } from './components/LoginScreen'
import { SavedOpenings } from './components/SavedOpenings'
import { ThemeToggle } from './components/ThemeToggle'
import { AIHub } from './components/AIHub'
import { Toaster } from './components/ui/toaster'
import { useChessGame } from './hooks/useChessGame'
import { useOpeningAnalysis } from './hooks/useOpeningStats'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useAIHub } from './hooks/useAIHub'
import { Settings, LogOut, Key } from 'lucide-react'

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

  const aiHub = useAIHub(user?.uid || null)
  const { data: openingData, analyzing, error: analysisError, analyze, clear } = useOpeningAnalysis()

  const [aiHubOpen, setAiHubOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'board' | 'analysis' | 'settings'>('board')

  const prevMoveCount = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const prevProviderRef = useRef('')
  const prevKeyRef = useRef('')

  const hasKey = aiHub.hasActiveKey()
  const activeProvider = aiHub.getActiveProvider()
  const activeApiKey = aiHub.getActiveApiKey()

  useEffect(() => {
    const keyChanged = activeProvider !== prevProviderRef.current || activeApiKey !== prevKeyRef.current
    prevProviderRef.current = activeProvider
    prevKeyRef.current = activeApiKey

    if (hasKey && moveHistorySan.length > 0 && (moveHistorySan.length !== prevMoveCount.current || keyChanged)) {
      prevMoveCount.current = moveHistorySan.length
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => analyze(moveHistorySan, activeProvider, activeApiKey), 600)
    }
  }, [moveHistorySan, hasKey, activeProvider, activeApiKey, analyze])

  const handleMove = useCallback(
    (source: string, target: string) => {
      if (!hasKey) return false
      return makeMove(source, target)
    },
    [hasKey, makeMove],
  )

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
    clear()
    logout()
  }, [clear, logout])

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} error={authError} theme={theme} />
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

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
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

              <button
                onClick={() => setAiHubOpen(true)}
                className={`p-2 rounded-lg transition-all relative ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
                title="AI Hub"
              >
                <Settings className="h-4 w-4" />
                {!hasKey && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>

              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt=""
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${
                    isDark ? 'ring-2 ring-cyan-500/30' : 'ring-2 ring-gray-200'
                  }`}
                />
              )}

              <button
                onClick={handleLogout}
                className={`hidden sm:flex items-center gap-1 text-xs transition-colors ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* No API key - prominent CTA */}
          {!hasKey && (
            <div className={`mb-4 sm:mb-6 rounded-2xl p-4 sm:p-6 border-2 border-dashed ${
              isDark
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-amber-300 bg-amber-50'
            }`}>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Key className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm sm:text-base font-semibold mb-1 ${
                    isDark ? 'text-amber-300' : 'text-amber-800'
                  }`}>
                    Add an API key to start
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                    Free Groq or Gemini key needed to analyze openings. Takes 30 seconds.
                  </p>
                </div>
                <button
                  onClick={() => setAiHubOpen(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isDark
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  Add API Key
                </button>
              </div>
            </div>
          )}

          {/* Mobile: Tab-based layout */}
          <div className="lg:hidden">
            {mobileTab === 'board' && (
              <div className="space-y-3">
                <div className="relative">
                  <ChessBoard fen={fen} onMove={handleMove} isGameOver={isGameOver} theme={theme} />
                  {!hasKey && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm z-10">
                      <button
                        onClick={() => setAiHubOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        Add API Key to Play
                      </button>
                    </div>
                  )}
                </div>
                <div className={`rounded-xl p-3 border ${
                  isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isCheckmate ? 'Checkmate!' : isDraw ? 'Draw' : isCheck ? 'Check!' : `${moveHistorySan.length} half-moves`}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {moveHistorySan.length > 0 && `Turn: ${moveHistorySan.length % 2 === 0 ? 'White' : 'Black'}`}
                    </span>
                  </div>
                  <MoveHistory movesSan={moveHistorySan} theme={theme} />
                </div>
                {openingData && (
                  <div className={`rounded-xl p-3 border ${
                    isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {openingData.opening.eco}
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {openingData.opening.name}
                      </span>
                    </div>
                    {openingData.stats && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden flex ${
                          isDark ? 'bg-white/5' : 'bg-gray-100'
                        }`}>
                          <div className={`bg-white ${isDark ? '' : 'bg-gray-800'}`} style={{ width: `${openingData.stats.white}%` }} />
                          <div className={`bg-gray-500 ${isDark ? '' : 'bg-gray-400'}`} style={{ width: `${openingData.stats.draws}%` }} />
                          <div className={`bg-gray-700 ${isDark ? '' : 'bg-gray-300'}`} style={{ width: `${openingData.stats.black}%` }} />
                        </div>
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {openingData.stats.white}/{openingData.stats.draws}/{openingData.stats.black}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {mobileTab === 'analysis' && (
              <div className="space-y-3">
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
            )}

            {mobileTab === 'settings' && (
              <div className="space-y-3">
                <div className={`rounded-xl p-4 border space-y-4 ${
                  isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Account
                  </h3>
                  <div className="flex items-center gap-3">
                    {user.photoURL && (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.displayName || 'User'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>

                <button
                  onClick={() => setAiHubOpen(true)}
                  className={`w-full rounded-xl p-4 border text-left transition-all ${
                    isDark
                      ? hasKey
                        ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                        : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                      : hasKey
                        ? 'bg-white border-gray-200 shadow-sm hover:bg-gray-50'
                        : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className={`h-5 w-5 ${hasKey ? (isDark ? 'text-gray-400' : 'text-gray-500') : 'text-amber-500'}`} />
                      <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          AI Hub
                        </h3>
                        <p className={`text-xs ${hasKey ? (isDark ? 'text-gray-500' : 'text-gray-400') : 'text-amber-500'}`}>
                          {hasKey ? `Using ${activeProvider === 'gemini' ? 'Gemini' : 'Groq'}` : 'Add API key to start'}
                        </p>
                      </div>
                    </div>
                    {!hasKey && <span className="text-amber-500 text-xs font-medium">Setup →</span>}
                  </div>
                </button>
              </div>
            )}

            {/* Bottom Tab Bar */}
            <div className={`fixed bottom-0 left-0 right-0 border-t z-40 ${
              isDark ? 'bg-[#0a0a0f]/95 backdrop-blur-lg border-white/10' : 'bg-white/95 backdrop-blur-lg border-gray-200'
            }`}>
              <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
                {([
                  { id: 'board' as const, icon: '♟', label: 'Board' },
                  { id: 'analysis' as const, icon: '📊', label: 'Analysis' },
                  { id: 'settings' as const, icon: '⚙', label: 'Settings' },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTab(tab.id)}
                    className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-all ${
                      mobileTab === tab.id
                        ? isDark ? 'text-cyan-400 scale-110' : 'text-blue-600 scale-110'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Side-by-side layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="relative">
                <ChessBoard fen={fen} onMove={handleMove} isGameOver={isGameOver} theme={theme} />
                {!hasKey && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm z-10">
                    <button
                      onClick={() => setAiHubOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                    >
                      <Key className="h-5 w-5" />
                      Add API Key to Play
                    </button>
                  </div>
                )}
              </div>
              <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
                isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isCheckmate ? 'Checkmate!' : isDraw ? 'Draw' : isCheck ? 'Check!' : `${moveHistorySan.length} half-moves`}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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

        {/* Bottom padding for mobile tab bar */}
        <div className="h-20 lg:hidden" />
      </div>

      {/* AI Hub Sidebar */}
      <AIHub
        open={aiHubOpen}
        onOpenChange={setAiHubOpen}
        settings={aiHub.settings}
        loading={aiHub.loading}
        saving={aiHub.saving}
        onUpdateGroqKey={aiHub.updateGroqKey}
        onUpdateGeminiKey={aiHub.updateGeminiKey}
        onSetActiveProvider={aiHub.setActiveProvider}
        onSave={aiHub.save}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
