import { useState, useCallback, useEffect, useRef } from 'react'
import { getAIHubSettings, saveAIHubSettings, type AIHubSettings } from '@/services/aiHubFirestore'
import type { Provider } from '@/services/llm'

const DEFAULT_SETTINGS: AIHubSettings = {
  groqApiKey: '',
  geminiApiKey: '',
  activeProvider: 'groq',
}

export function useAIHub(userId: string | null) {
  const [settings, setSettings] = useState<AIHubSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!userId || loadedRef.current) return
    setLoading(true)
    getAIHubSettings(userId)
      .then((data) => {
        setSettings(data)
        loadedRef.current = true
      })
      .catch(() => setError('Failed to load AI settings'))
      .finally(() => setLoading(false))
  }, [userId])

  const updateGroqKey = useCallback((key: string) => {
    setSettings((prev) => ({ ...prev, groqApiKey: key }))
  }, [])

  const updateGeminiKey = useCallback((key: string) => {
    setSettings((prev) => ({ ...prev, geminiApiKey: key }))
  }, [])

  const setActiveProvider = useCallback((provider: Provider) => {
    setSettings((prev) => ({ ...prev, activeProvider: provider }))
  }, [])

  const save = useCallback(async () => {
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      await saveAIHubSettings(userId, settings)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }, [userId, settings.groqApiKey, settings.geminiApiKey, settings.activeProvider])

  // Returns the best available key: preferred provider first, then fallback
  const getActiveApiKey = useCallback((): string => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey || settings.groqApiKey
    }
    return settings.groqApiKey || settings.geminiApiKey
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  // Returns which provider is actually being used
  const getActiveProvider = useCallback((): Provider => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey ? 'gemini' : (settings.groqApiKey ? 'groq' : 'groq')
    }
    return settings.groqApiKey ? 'groq' : (settings.geminiApiKey ? 'gemini' : 'groq')
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  // Works if ANY key is available
  const hasActiveKey = useCallback((): boolean => {
    return !!(settings.groqApiKey || settings.geminiApiKey)
  }, [settings.groqApiKey, settings.geminiApiKey])

  return {
    settings,
    loading,
    saving,
    error,
    updateGroqKey,
    updateGeminiKey,
    setActiveProvider,
    save,
    getActiveApiKey,
    getActiveProvider,
    hasActiveKey,
  }
}
