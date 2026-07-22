import { useState, useEffect, useCallback } from 'react'
import {
  getSavedOpenings,
  saveOpening,
  deleteOpening,
  type SavedOpening,
} from '../services/firestore'

interface Props {
  userId: string
  moveHistory: string[]
  openingName: string
  openingEco: string
  onLoadMoves: (moves: string[]) => void
}

export function SavedOpenings({
  userId,
  moveHistory,
  openingName,
  openingEco,
  onLoadMoves,
}: Props) {
  const [saved, setSaved] = useState<SavedOpening[]>([])
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    const list = await getSavedOpenings(userId)
    setSaved(list)
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
    } finally {
      setSaving(false)
    }
  }, [userId, moveHistory, openingName, openingEco, refresh])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteOpening(userId, id)
      await refresh()
    },
    [userId, refresh],
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Saved Openings
        </h4>
        <button
          onClick={handleSave}
          disabled={moveHistory.length === 0 || saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs py-1 px-3 rounded transition-colors"
        >
          {saving ? 'Saving...' : 'Save Current'}
        </button>
      </div>

      {saved.length === 0 ? (
        <p className="text-gray-600 text-xs">No saved openings yet.</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {saved.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 hover:bg-gray-800 transition-colors group"
            >
              <button
                onClick={() => onLoadMoves(item.moves)}
                className="text-left flex-1 min-w-0"
              >
                <span className="text-xs font-mono text-blue-400 mr-2">
                  {item.eco}
                </span>
                <span className="text-sm text-white truncate">{item.name}</span>
                <span className="text-[10px] text-gray-500 ml-2">
                  ({item.moves.length} moves)
                </span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-600 hover:text-red-400 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
