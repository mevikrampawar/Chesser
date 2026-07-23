import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { encryptApiKey, decryptApiKey } from './crypto'

export interface AIHubSettings {
  groqApiKey: string
  geminiApiKey: string
  activeProvider: 'groq' | 'gemini'
}

export interface SaveResult {
  ok: boolean
  source: 'local' | 'cloud'
  error: string | null
}

export interface LoadResult {
  settings: AIHubSettings
  source: 'local' | 'cloud' | 'defaults'
  error: string | null
}

const DEFAULT_SETTINGS: AIHubSettings = {
  groqApiKey: '',
  geminiApiKey: '',
  activeProvider: 'groq',
}

const LOCAL_KEY = 'chesser-aihub-settings'

function loadLocal(): AIHubSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      groqApiKey: String(parsed.groqApiKey || ''),
      geminiApiKey: String(parsed.geminiApiKey || ''),
      activeProvider: parsed.activeProvider === 'gemini' ? 'gemini' : 'groq',
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveLocal(settings: AIHubSettings): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
}

export async function loadSettings(userId: string | null): Promise<LoadResult> {
  const local = loadLocal()

  if (!userId) {
    return { settings: local, source: 'local', error: null }
  }

  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'aiHub'))
    if (!snap.exists()) {
      return { settings: local, source: 'local', error: null }
    }

    const data = snap.data()

    let groqKey = ''
    let geminiKey = ''

    if (data.groqKeyEnc) {
      try {
        groqKey = await decryptApiKey(userId, String(data.groqKeyEnc))
      } catch (e) {
        console.error('[AIHub] Failed to decrypt Groq key:', e)
      }
    } else if (data.groqApiKey) {
      groqKey = String(data.groqApiKey)
    }

    if (data.geminiKeyEnc) {
      try {
        geminiKey = await decryptApiKey(userId, String(data.geminiKeyEnc))
      } catch (e) {
        console.error('[AIHub] Failed to decrypt Gemini key:', e)
      }
    } else if (data.geminiApiKey) {
      geminiKey = String(data.geminiApiKey)
    }

    if (groqKey || geminiKey) {
      const remote: AIHubSettings = {
        groqApiKey: groqKey,
        geminiApiKey: geminiKey,
        activeProvider: (data.activeProvider as 'groq' | 'gemini') || 'groq',
      }
      saveLocal(remote)
      return { settings: remote, source: 'cloud', error: null }
    }

    return { settings: local, source: 'local', error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[AIHub] Firestore load failed:', msg)
    return { settings: local, source: 'local', error: `Cloud load failed: ${msg}` }
  }
}

export async function saveSettings(
  userId: string | null,
  settings: AIHubSettings,
): Promise<SaveResult> {
  saveLocal(settings)

  if (!userId) {
    return { ok: true, source: 'local', error: null }
  }

  try {
    const groqEnc = settings.groqApiKey
      ? await encryptApiKey(userId, settings.groqApiKey)
      : ''
    const geminiEnc = settings.geminiApiKey
      ? await encryptApiKey(userId, settings.geminiApiKey)
      : ''

    await setDoc(doc(db, 'users', userId, 'settings', 'aiHub'), {
      groqKeyEnc: groqEnc,
      geminiKeyEnc: geminiEnc,
      activeProvider: settings.activeProvider,
      lastUpdated: serverTimestamp(),
    })

    return { ok: true, source: 'cloud', error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cloud save failed'
    console.error('[AIHub] Firestore save failed:', msg)
    return { ok: true, source: 'local', error: msg }
  }
}
