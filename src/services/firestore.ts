import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'

export interface SavedOpening {
  id: string
  name: string
  eco: string
  moves: string[]
  savedAt: number
}

const COLLECTION = 'savedOpenings'

export async function saveOpening(
  userId: string,
  data: { name: string; eco: string; moves: string[] },
): Promise<string> {
  const docRef = await addDoc(
    collection(db, 'users', userId, COLLECTION),
    {
      ...data,
      savedAt: Date.now(),
    },
  )
  return docRef.id
}

export async function getSavedOpenings(userId: string): Promise<SavedOpening[]> {
  const q = query(
    collection(db, 'users', userId, COLLECTION),
    orderBy('savedAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as SavedOpening[]
}

export async function deleteOpening(userId: string, openingId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, COLLECTION, openingId))
}
