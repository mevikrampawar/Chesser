import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/popup-closed-by-user') return
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.')
        return
      }
      console.error('Sign-in error:', err)
      setError('Sign-in failed. Please try again.')
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
      setError('Sign-out failed.')
    }
  }, [])

  return { user, loading, error, signInWithGoogle, logout }
}
