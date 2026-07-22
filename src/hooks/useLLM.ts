import { useState, useCallback, useRef } from 'react'
import { loadModel, type LLMProgress } from '../services/llm'
import type { LLMStatus } from '../types'

export function useLLM() {
  const [status, setStatus] = useState<LLMStatus>('idle')
  const [progress, setProgress] = useState<LLMProgress>({ progress: 0, text: '' })
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  const init = useCallback(async () => {
    if (loadedRef.current) return

    setStatus('loading')
    setError(null)

    try {
      await loadModel((p) => {
        setProgress(p)
      })
      loadedRef.current = true
      setStatus('ready')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load LLM'
      setError(msg)
      setStatus('error')
    }
  }, [])

  return {
    status,
    progress,
    error,
    init,
  }
}
