import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'

export function useChessGame() {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [moveHistorySan, setMoveHistorySan] = useState<string[]>([])
  const [isCheck, setIsCheck] = useState(false)
  const [isCheckmate, setIsCheckmate] = useState(false)
  const [isDraw, setIsDraw] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const syncState = useCallback(() => {
    const game = gameRef.current
    setFen(game.fen())
    setIsCheck(game.isCheck())
    setIsCheckmate(game.isCheckmate())
    setIsDraw(game.isDraw())
    setIsGameOver(game.isGameOver())
  }, [])

  const makeMove = useCallback(
    (sourceSquare: string, targetSquare: string, promotion?: string) => {
      const game = gameRef.current

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: promotion || 'q',
        })

        if (move) {
          syncState()
          setMoveHistory(game.history({ verbose: true }).map((m) => m.from + m.to))
          setMoveHistorySan(game.history())
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [syncState],
  )

  const resetGame = useCallback(() => {
    const game = new Chess()
    gameRef.current = game
    setFen(game.fen())
    setMoveHistory([])
    setMoveHistorySan([])
    setIsCheck(false)
    setIsCheckmate(false)
    setIsDraw(false)
    setIsGameOver(false)
  }, [])

  const undoMove = useCallback(() => {
    const game = gameRef.current
    game.undo()
    syncState()
    setMoveHistory(game.history({ verbose: true }).map((m) => m.from + m.to))
    setMoveHistorySan(game.history())
  }, [syncState])

  const loadMoves = useCallback(
    (uciMoves: string[]) => {
      resetGame()
      const game = gameRef.current
      for (const uci of uciMoves) {
        const from = uci.slice(0, 2)
        const to = uci.slice(2, 4)
        const promotion = uci.length > 4 ? uci[4] : undefined
        try {
          game.move({ from, to, promotion: promotion || 'q' })
        } catch {
          break
        }
      }
      syncState()
      setMoveHistory(game.history({ verbose: true }).map((m) => m.from + m.to))
      setMoveHistorySan(game.history())
    },
    [resetGame, syncState],
  )

  return {
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
    loadMoves,
    turn: gameRef.current.turn(),
  }
}
