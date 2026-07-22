import { useState, useEffect, useCallback } from 'react'
import {
  getSavedOpenings,
  saveOpening,
  deleteOpening,
  type SavedOpening,
} from '@/services/firestore'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/hooks/useTheme'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  userId: string
  moveHistory: string[]
  openingName: string
  openingEco: string
  onLoadMoves: (moves: string[]) => void
  theme: Theme
}

export function SavedOpenings({
  userId,
  moveHistory,
  openingName,
  openingEco,
  onLoadMoves,
  theme,
}: Props) {
  const [saved, setSaved] = useState<SavedOpening[]>([])
  const [saving, setSaving] = useState(false)
  const [firestoreError, setFirestoreError] = useState(false)
  const isDark = theme === 'dark'

  const refresh = useCallback(async () => {
    try {
      const list = await getSavedOpenings(userId)
      setSaved(list)
      setFirestoreError(false)
    } catch {
      setFirestoreError(true)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleSave = useCallback(async () => {
    if (moveHistory.length === 0 || !openingName) return
    setSaving(true)
    try {
      await saveOpening(userId, {
        name: openingName,
        eco: openingEco,
        moves: moveHistory,
      })
      await refresh()
      toast({ title: 'Saved', description: `${openingName} saved to cloud`, variant: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      toast({ title: 'Save failed', description: msg, variant: 'destructive' })
      setFirestoreError(true)
    } finally {
      setSaving(false)
    }
  }, [userId, moveHistory, openingName, openingEco, refresh])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteOpening(userId, id)
        await refresh()
        toast({ title: 'Deleted', description: 'Opening removed from saved list' })
      } catch {
        toast({ title: 'Delete failed', description: 'Could not remove opening', variant: 'destructive' })
      }
    },
    [userId, refresh],
  )

  if (firestoreError) {
    return (
      <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
        isDark
          ? 'bg-white/[0.02] border-white/[0.06]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Saved Openings
        </h4>
        <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Cloud save unavailable. Create a Firestore database in your Firebase console.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
      isDark
        ? 'bg-white/[0.02] border-white/[0.06]'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Saved Openings
        </h4>
        <Button
          size="sm"
          variant={isDark ? 'outline' : 'default'}
          onClick={handleSave}
          disabled={moveHistory.length === 0 || saving}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
          Save
        </Button>
      </div>

      {saved.length === 0 ? (
        <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          No saved openings yet.
        </p>
      ) : (
        <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
          {saved.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-all group ${
                isDark
                  ? 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <button
                onClick={() => onLoadMoves(item.moves)}
                className="text-left flex-1 min-w-0"
              >
                <span className={`text-[10px] sm:text-xs font-mono mr-1 sm:mr-2 ${
                  isDark ? 'text-cyan-400' : 'text-blue-500'
                }`}>
                  {item.eco}
                </span>
                <span className={`text-xs sm:text-sm truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{item.name}</span>
                <span className={`text-[9px] sm:text-[10px] ml-1 sm:ml-2 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  ({item.moves.length})
                </span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className={`ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                  isDark ? 'text-gray-600 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
