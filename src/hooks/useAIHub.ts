import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getAIHubSettings,
  saveAIHubSettings,
  type AIHubSettings,
  type SyncResult,
} from '@/services/aiHubFirestore'
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local_only' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<Provider | null>(null)
  const loadedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSavedRef = useRef<string>('')

  // Load on mount
  useEffect(() => {
    if (loadedRef.current) return
    setLoading(true)
    getAIHubSettings(userId)
      .then((data) => {
        setSettings(data)
        lastSavedRef.current = JSON.stringify(data)
        loadedRef.current = true
      })
      .catch(() => {
        loadedRef.current = true
      })
      .finally(() => setLoading(false))
  }, [userId])

  // Auto-save with debounce whenever settings change
  useEffect(() => {
    const serialized = JSON.stringify(settings)
    if (serialized === lastSavedRef.current) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      setSyncStatus('syncing')
      try {
        const result: SyncResult = await saveAIHubSettings(userId, settings)
        lastSavedRef.current = serialized
        if (result.firestore) {
          setSyncStatus('synced')
          setSyncError(null)
        } else if (result.firestoreError) {
          setSyncStatus('error')
          setSyncError(result.firestoreError)
        } else {
          setSyncStatus('local_only')
          setSyncError(null)
        }
      } catch (err) {
        setSyncStatus('error')
        setSyncError(err instanceof Error ? err.message : 'Save failed')
      } finally {
        setSaving(false)
      }
    }, 500)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [userId, settings.groqApiKey, settings.geminiApiKey, settings.activeProvider])

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

  const handleVerify = useCallback((provider: Provider) => {
    // Just manages the verifying state — actual verification happens in AIHub
    setVerifying(provider)
  }, [])

  const retrySync = useCallback(async () => {
    setSaving(true)
    setSyncStatus('syncing')
    try {
      const result = await saveAIHubSettings(userId, settings)
      if (result.firestore) {
        setSyncStatus('synced')
        setSyncError(null)
      } else if (result.firestoreError) {
        setSyncStatus('error')
        setSyncError(result.firestoreError)
      } else {
        setSyncStatus('local_only')
        setSyncError(null)
      }
    } catch (err) {
      setSyncStatus('error')
      setSyncError(err instanceof Error ? err.message : 'Sync failed')
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
    syncStatus,
    syncError,
    verifying,
    updateKey,
    setActiveProvider,
    handleVerify,
    retrySync,
    getActiveApiKey,
    getActiveProvider,
    hasActiveKey,
  }
}
