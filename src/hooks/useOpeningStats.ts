import { useState, useCallback, useRef } from 'react'
import type { OpeningData } from '../types'
import { identifyOpening } from '../services/opening'
import type { Provider } from '../services/llm'

export function useOpeningAnalysis() {
  const [data, setData] = useState<OpeningData | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyze = useCallback(async (sanMoves: string[], provider: Provider, apiKey: string) => {
    if (sanMoves.length === 0) {
      setData(null)
      return
    }
    if (!apiKey) {
      setError(`No ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key set. Add one in Settings.`)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setAnalyzing(true)
    setError(null)

    try {
      const result = await identifyOpening(sanMoves, provider, apiKey)
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
