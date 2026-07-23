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
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
  } catch { /* ignore */ }
}

export async function getAIHubSettings(userId: string | null): Promise<AIHubSettings> {
  // Always load from localStorage first (instant, no network)
  const local = loadLocal()

  // If logged in, try to merge with Firestore (Firestore wins if it has data)
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
        // If remote has keys and local doesn't, use remote
        // If both have keys, prefer remote (cloud is truth)
        if (remote.groqApiKey || remote.geminiApiKey) {
          saveLocal(remote)
          return remote
        }
      }
    } catch { /* Firestore read failed, fall through to local */ }
  }

  return local
}

export async function saveAIHubSettings(userId: string | null, settings: AIHubSettings): Promise<void> {
  // 1. Always save to localStorage first (guaranteed to work)
  saveLocal(settings)

  // 2. Try to sync to Firestore (best effort, won't fail if rules block it)
  if (userId && typeof userId === 'string') {
    try {
      await setDoc(doc(db, 'users', userId, 'settings', 'aiHub'), {
        groqApiKey: settings.groqApiKey.slice(0, 200),
        geminiApiKey: settings.geminiApiKey.slice(0, 200),
        activeProvider: settings.activeProvider,
        lastUpdated: serverTimestamp(),
      })
    } catch { /* Firestore write blocked by rules — localStorage already saved */ }
  }
}
