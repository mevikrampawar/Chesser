import { useState, useCallback, useEffect, useRef } from 'react'
import { getAIHubSettings, saveAIHubSettings, type AIHubSettings } from '@/services/aiHubFirestore'
import type { Provider } from '@/services/llm'
import { toast } from '@/hooks/useToast'

const DEFAULT_SETTINGS: AIHubSettings = {
  groqApiKey: '',
  geminiApiKey: '',
  activeProvider: 'groq',
}

export function useAIHub(userId: string | null) {
  const [settings, setSettings] = useState<AIHubSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const loadedRef = useRef(false)

  // Load settings on mount (localStorage is instant, Firestore is best-effort)
  useEffect(() => {
    if (loadedRef.current) return
    setLoading(true)
    getAIHubSettings(userId)
      .then((data) => {
        setSettings(data)
        loadedRef.current = true
      })
      .catch(() => {
        // Even if load fails, keep defaults — user can still save
        loadedRef.current = true
      })
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
    setSaving(true)
    try {
      // Save whatever keys exist (even if only one, even if both empty)
      await saveAIHubSettings(userId, settings)
      toast({
        title: 'Settings saved',
        description: settings.groqApiKey || settings.geminiApiKey
          ? `Using ${getActiveProviderName(settings)}`
          : 'No API keys saved yet',
        variant: 'success',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings'
      toast({ title: 'Save failed', description: msg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [userId, settings.groqApiKey, settings.geminiApiKey, settings.activeProvider])

  const getActiveApiKey = useCallback((): string => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey || settings.groqApiKey
    }
    return settings.groqApiKey || settings.geminiApiKey
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  const getActiveProvider = useCallback((): Provider => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey ? 'gemini' : (settings.groqApiKey ? 'groq' : 'groq')
    }
    return settings.groqApiKey ? 'groq' : (settings.geminiApiKey ? 'gemini' : 'groq')
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  const hasActiveKey = useCallback((): boolean => {
    return !!(settings.groqApiKey || settings.geminiApiKey)
  }, [settings.groqApiKey, settings.geminiApiKey])

  return {
    settings,
    loading,
    saving,
    updateGroqKey,
    updateGeminiKey,
    setActiveProvider,
    save,
    getActiveApiKey,
    getActiveProvider,
    hasActiveKey,
  }
}

function getActiveProviderName(s: AIHubSettings): string {
  if (s.activeProvider === 'gemini') {
    return s.geminiApiKey ? 'Gemini' : 'Groq (fallback)'
  }
  return s.groqApiKey ? 'Groq' : 'Gemini (fallback)'
}
