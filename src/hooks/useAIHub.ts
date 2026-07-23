import { useState, useCallback, useEffect, useRef } from 'react'
import { loadSettings, saveSettings, type AIHubSettings } from '@/services/aiHubFirestore'
import type { Provider } from '@/services/llm'
import { toast } from '@/hooks/useToast'

const DEFAULT: AIHubSettings = {
  groqApiKey: '',
  geminiApiKey: '',
  activeProvider: 'groq',
}

export function useAIHub(userId: string | null) {
  const [settings, setSettings] = useState<AIHubSettings>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    setLoading(true)
    loadSettings(userId)
      .then((data) => {
        setSettings(data)
        loadedRef.current = true
      })
      .catch(() => {
        loadedRef.current = true
      })
      .finally(() => setLoading(false))
  }, [userId])

  const updateKey = useCallback((provider: Provider, key: string) => {
    setSettings((prev) => ({
      ...prev,
      groqApiKey: provider === 'groq' ? key : prev.groqApiKey,
      geminiApiKey: provider === 'gemini' ? key : prev.geminiApiKey,
    }))
  }, [])

  const setActiveProvider = useCallback((provider: Provider) => {
    setSettings((prev) => ({ ...prev, activeProvider: provider }))
  }, [])

  const save = useCallback(async () => {
    if (!settings.groqApiKey && !settings.geminiApiKey) {
      toast({
        title: 'No key to save',
        description: 'Enter at least one API key first',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const result = await saveSettings(userId, settings)
      if (result.error) {
        toast({
          title: 'Saved locally',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        const providerName = settings.activeProvider === 'gemini' ? 'Gemini' : 'Groq'
        toast({
          title: 'Settings saved',
          description:
            result.source === 'cloud'
              ? `${providerName} key saved to cloud`
              : `${providerName} key saved locally`,
          variant: 'success',
        })
      }
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [userId, settings])

  const getActiveApiKey = useCallback((): string => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey || settings.groqApiKey
    }
    return settings.groqApiKey || settings.geminiApiKey
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  const getActiveProvider = useCallback((): Provider => {
    if (settings.activeProvider === 'gemini') {
      return settings.geminiApiKey ? 'gemini' : settings.groqApiKey ? 'groq' : 'groq'
    }
    return settings.groqApiKey ? 'groq' : settings.geminiApiKey ? 'gemini' : 'groq'
  }, [settings.activeProvider, settings.geminiApiKey, settings.groqApiKey])

  const hasActiveKey = useCallback((): boolean => {
    return !!(settings.groqApiKey || settings.geminiApiKey)
  }, [settings.groqApiKey, settings.geminiApiKey])

  return {
    settings,
    loading,
    saving,
    updateKey,
    setActiveProvider,
    save,
    getActiveApiKey,
    getActiveProvider,
    hasActiveKey,
  }
}
