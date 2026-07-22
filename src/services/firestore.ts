import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'

export interface SavedOpening {
  id: string
  name: string
  eco: string
  moves: string[]
  savedAt: number
}

const MAX_SAVED_OPENINGS = 50
const MAX_MOVES_PER_OPENING = 100

export async function saveOpening(
  userId: string,
  data: { name: string; eco: string; moves: string[] },
): Promise<string> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID')
  }

  // Validate and sanitize input
  const name = data.name.slice(0, 200).trim()
  const eco = data.eco.slice(0, 10).trim()
  const moves = data.moves.slice(0, MAX_MOVES_PER_OPENING)

  if (!name || !eco) {
    throw new Error('Invalid opening data')
  }

  // Check limit
  const existing = await getSavedOpenings(userId)
  if (existing.length >= MAX_SAVED_OPENINGS) {
    throw new Error(`Maximum ${MAX_SAVED_OPENINGS} saved openings reached`)
  }

  const docRef = await addDoc(
    collection(db, 'users', userId, 'savedOpenings'),
    {
      name,
      eco,
      moves,
      savedAt: Date.now(),
    },
  )
  return docRef.id
}

export async function getSavedOpenings(userId: string): Promise<SavedOpening[]> {
  if (!userId || typeof userId !== 'string') {
    return []
  }

  const q = query(
    collection(db, 'users', userId, 'savedOpenings'),
    orderBy('savedAt', 'desc'),
    limit(MAX_SAVED_OPENINGS),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as SavedOpening[]
}

export async function deleteOpening(userId: string, openingId: string): Promise<void> {
  if (!userId || !openingId) {
    throw new Error('Invalid IDs')
  }
  await deleteDoc(doc(db, 'users', userId, 'savedOpenings', openingId))
}
