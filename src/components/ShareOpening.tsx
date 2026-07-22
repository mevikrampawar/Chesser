import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'
import type { Theme } from '@/hooks/useTheme'
import { Share2, Copy, Check } from 'lucide-react'

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
      toast({ title: 'Copied!', description: 'Share link copied to clipboard', variant: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Failed to copy', description: 'Please copy the link manually', variant: 'destructive' })
    }
  }, [buildShareUrl])

  const handleNativeShare = useCallback(async () => {
    const url = buildShareUrl()
    const text = `Check out this chess opening: ${openingName} (${openingEco})`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Chesser Opening', text, url })
      } catch {
        // User cancelled share
      }
    } else {
      setShowShare(true)
    }
  }, [buildShareUrl, openingName, openingEco])

  if (moveHistory.length === 0) return null

  return (
    <div className="relative">
      <Button
        onClick={handleNativeShare}
        variant={isDark ? 'outline' : 'default'}
        className="w-full"
        size="sm"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Opening
      </Button>

      {showShare && (
        <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl p-3 shadow-xl z-10 ${
          isDark
            ? 'bg-[#0f0f17] border border-white/10'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Copy this link to share:
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={buildShareUrl()}
              className="text-xs"
            />
            <Button size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <button
            onClick={() => setShowShare(false)}
            className={`absolute top-2 right-2 text-xs ${
              isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
