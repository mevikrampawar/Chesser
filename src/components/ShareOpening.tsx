import { useCallback, useState } from 'react'
import type { Theme } from '../hooks/useTheme'

interface Props {
  moveHistory: string[]
  openingName: string
  openingEco: string
  theme: Theme
}

export function ShareOpening({ moveHistory, openingName, openingEco }: Props) {
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const buildShareUrl = useCallback(() => {
    const base = window.location.origin + window.location.pathname
    const moves = moveHistory.join(',')
    const params = new URLSearchParams({ moves, name: openingName, eco: openingEco })
    return `${base}?${params.toString()}`
  }, [moveHistory, openingName, openingEco])

  const handleCopy = useCallback(async () => {
    const url = buildShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [buildShareUrl])

  const handleNativeShare = useCallback(async () => {
    const url = buildShareUrl()
    const text = `Check out this chess opening: ${openingName} (${openingEco})`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Chesser Opening', text, url })
      } catch {}
    } else {
      setShowShare(true)
    }
  }, [buildShareUrl, openingName, openingEco])

  if (moveHistory.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Share Opening
      </button>

      {showShare && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-10">
          <p className="text-gray-400 text-xs mb-2">Copy this link to share:</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={buildShareUrl()}
              className="flex-1 bg-gray-800 text-white text-xs px-3 py-2 rounded border border-gray-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded transition-colors shrink-0"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setShowShare(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
