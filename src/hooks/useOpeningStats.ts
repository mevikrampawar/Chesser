import { useState, useCallback, useRef } from 'react'
import type { OpeningData } from '../types'
import { identifyOpening } from '../services/opening'

export function useOpeningAnalysis() {
  const [data, setData] = useState<OpeningData | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyze = useCallback(async (uciMoves: string[]) => {
    if (uciMoves.length === 0) {
      setData(null)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setAnalyzing(true)
    setError(null)

    try {
      const result = await identifyOpening(uciMoves)
      if (!abortRef.current.signal.aborted) {
        setData(result)
      }
    } catch (err) {
      if (!abortRef.current.signal.aborted) {
        const msg = err instanceof Error ? err.message : 'Analysis failed'
        setError(msg)
      }
    } finally {
      if (!abortRef.current.signal.aborted) {
        setAnalyzing(false)
      }
    }
  }, [])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setData(null)
    setAnalyzing(false)
    setError(null)
  }, [])

  return { data, analyzing, error, analyze, clear }
}
