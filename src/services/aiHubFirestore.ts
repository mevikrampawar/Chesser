import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface AIHubSettings {
  groqApiKey: string
  geminiApiKey: string
  activeProvider: 'groq' | 'gemini'
}

export interface SyncResult {
  localStorage: boolean
  firestore: boolean
  firestoreError: string | null
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

function saveLocal(settings: AIHubSettings): boolean {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}

export async function getAIHubSettings(userId: string | null): Promise<AIHubSettings> {
  const local = loadLocal()

  if (userId && typeof userId === 'string') {
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'settings', 'aiHub'))
      if (snap.exists()) {
        const data = snap.data()
        const remote: AIHubSettings = {
          groqApiKey: String(data.groqApiKey || ''),
          geminiApiKey: String(data.geminiApiKey || ''),
          activeProvider: (data.activeProvider as 'groq' | 'gemini') || 'groq',
        }
        if (remote.groqApiKey || remote.geminiApiKey) {
          saveLocal(remote)
          return remote
        }
      }
    } catch { /* fall through to local */ }
  }

  return local
}

export async function saveAIHubSettings(
  userId: string | null,
  settings: AIHubSettings,
): Promise<SyncResult> {
  const localOk = saveLocal(settings)
  if (!localOk) {
    throw new Error('Failed to save to browser storage')
  }

  const result: SyncResult = {
    localStorage: true,
    firestore: false,
    firestoreError: null,
  }

  if (userId && typeof userId === 'string') {
    try {
      await setDoc(doc(db, 'users', userId, 'settings', 'aiHub'), {
        groqApiKey: settings.groqApiKey.slice(0, 200),
        geminiApiKey: settings.geminiApiKey.slice(0, 200),
        activeProvider: settings.activeProvider,
        lastUpdated: serverTimestamp(),
      })
      result.firestore = true
    } catch (err) {
      result.firestoreError =
        err instanceof Error ? err.message : 'Firestore write failed — check security rules'
    }
  }

  return result
}
