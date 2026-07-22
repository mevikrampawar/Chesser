import { useCallback, useState } from 'react'
import type { Theme } from '../hooks/useTheme'

interface Props {
  moveHistory: string[]
  openingName: string
  openingEco: string
  theme: Theme
}

export function ShareOpening({ moveHistory, openingName, openingEco, theme }: Props) {
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const isDark = theme === 'dark'

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
        className={`w-full text-xs sm:text-sm font-medium py-2 px-4 rounded-xl transition-all ${
          isDark
            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/20'
            : 'bg-blue-500 hover:bg-blue-400 text-white'
        }`}
      >
        Share Opening
      </button>

      {showShare && (
        <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl p-3 shadow-xl z-10 ${
          isDark
            ? 'bg-[#0f0f17] border border-white/10'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <p className={`text-xs mb-2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>Copy this link to share:</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={buildShareUrl()}
              className={`flex-1 text-xs px-3 py-2 rounded-lg outline-none ${
                isDark
                  ? 'bg-white/5 text-white border border-white/10'
                  : 'bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            />
            <button
              onClick={handleCopy}
              className={`text-xs px-3 py-2 rounded-lg transition-all shrink-0 ${
                isDark
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setShowShare(false)}
            className={`absolute top-2 right-2 text-xs ${
              isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
