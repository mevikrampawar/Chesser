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

export async function getAIHubSettings(userId: string): Promise<AIHubSettings> {
  if (!userId || typeof userId !== 'string') return DEFAULT_SETTINGS

  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'aiHub'))
    if (snap.exists()) {
      const data = snap.data()
      return {
        groqApiKey: String(data.groqApiKey || ''),
        geminiApiKey: String(data.geminiApiKey || ''),
        activeProvider: (data.activeProvider as 'groq' | 'gemini') || 'groq',
      }
    }
    return DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveAIHubSettings(userId: string, settings: AIHubSettings): Promise<void> {
  if (!userId || typeof userId !== 'string') throw new Error('Invalid user ID')

  await setDoc(doc(db, 'users', userId, 'settings', 'aiHub'), {
    groqApiKey: settings.groqApiKey.slice(0, 200),
    geminiApiKey: settings.geminiApiKey.slice(0, 200),
    activeProvider: settings.activeProvider,
    lastUpdated: serverTimestamp(),
  })
}
