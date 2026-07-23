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

export async function loadSettings(userId: string | null): Promise<AIHubSettings> {
  const local = loadLocal()

  if (!userId) return local

  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'aiHub'))
    if (!snap.exists()) return local

    const data = snap.data()
    const groqKey = data.groqKeyEnc
      ? await decryptApiKey(userId, String(data.groqKeyEnc))
      : String(data.groqApiKey || '')
    const geminiKey = data.geminiKeyEnc
      ? await decryptApiKey(userId, String(data.geminiKeyEnc))
      : String(data.geminiApiKey || '')

    if (groqKey || geminiKey) {
      const remote: AIHubSettings = {
        groqApiKey: groqKey,
        geminiApiKey: geminiKey,
        activeProvider: (data.activeProvider as 'groq' | 'gemini') || 'groq',
      }
      saveLocal(remote)
      return remote
    }
  } catch {
    // Firestore read failed — use local
  }

  return local
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
    return {
      ok: true,
      source: 'local',
      error: err instanceof Error ? err.message : 'Cloud save failed — check Firestore rules',
    }
  }
}
