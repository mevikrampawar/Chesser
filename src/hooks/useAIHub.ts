import { useState, useCallback, useEffect } from 'react'
import { getAIHubSettings, saveAIHubSettings, type AIHubSettings } from '@/services/aiHubFirestore'
import type { Provider } from '@/services/llm'

export function useAIHub(userId: string | null) {
  const [settings, setSettings] = useState<AIHubSettings>({
    groqApiKey: '',
    geminiApiKey: '',
    activeProvider: 'groq',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getAIHubSettings(userId)
      .then(setSettings)
      .catch(() => setError('Failed to load AI settings'))
      .finally(() => setLoading(false))
  }, [userId])

  const updateGroqKey = useCallback(async (key: string) => {
    setSettings((prev) => ({ ...prev, groqApiKey: key }))
  }, [])

  const updateGeminiKey = useCallback(async (key: string) => {
    setSettings((prev) => ({ ...prev, geminiApiKey: key }))
  }, [])

  const setActiveProvider = useCallback(async (provider: Provider) => {
    setSettings((prev) => ({ ...prev, activeProvider: provider }))
  }, [])

  const save = useCallback(async () => {
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      await saveAIHubSettings(userId, settings)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }, [userId, settings])

  const getActiveApiKey = useCallback((): string => {
    return settings.activeProvider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey
  }, [settings])

  const hasActiveKey = useCallback((): boolean => {
    return !!getActiveApiKey()
  }, [getActiveApiKey])

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
    hasActiveKey,
  }
}
