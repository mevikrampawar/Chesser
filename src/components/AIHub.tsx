import { useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testApiKeyForProvider, type Provider, type KeyStatus } from '@/services/llm'
import type { AIHubSettings } from '@/services/aiHubFirestore'
import { toast } from '@/hooks/useToast'
import {
  Loader2,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Zap,
  Sparkles,
  CloudOff,
  Cloud,
  RotateCcw,
} from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AIHubSettings
  loading: boolean
  syncStatus: 'idle' | 'syncing' | 'synced' | 'local_only' | 'error'
  syncError: string | null
  onSetActiveProvider: (provider: Provider) => void
  onUpdateKey: (provider: Provider, key: string) => void
  onVerify: (provider: Provider) => void
  verifying: Provider | null
  onRetrySync: () => void
}

function SyncBadge({
  status,
  error,
  onRetry,
}: {
  status: Props['syncStatus']
  error: string | null
  onRetry: () => void
}) {
  if (status === 'synced') {
    return (
      <span className="text-[10px] text-green-500 inline-flex items-center gap-1">
        <Cloud className="h-3 w-3" /> Synced
      </span>
    )
  }
  if (status === 'syncing') {
    return (
      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Syncing...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <button
        onClick={onRetry}
        className="text-[10px] text-amber-500 hover:text-amber-400 inline-flex items-center gap-1"
        title={error || 'Sync failed'}
      >
        <CloudOff className="h-3 w-3" /> Local only{' '}
        <RotateCcw className="h-2.5 w-2.5" />
      </button>
    )
  }
  if (status === 'local_only') {
    return (
      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
        <CloudOff className="h-3 w-3" /> Saved locally
      </span>
    )
  }
  return null
}

function KeyStatusBadge({ status }: { status: KeyStatus | null }) {
  if (!status) return null
  if (status === 'valid')
    return (
      <span className="text-[10px] text-green-500 inline-flex items-center gap-1">
        <Check className="h-3 w-3" /> OK
      </span>
    )
  if (status === 'rate_limited')
    return (
      <span className="text-[10px] text-amber-500 inline-flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> Busy
      </span>
    )
  if (status === 'disabled')
    return (
      <span className="text-[10px] text-amber-500 inline-flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> API off
      </span>
    )
  return (
    <span className="text-[10px] text-red-500 inline-flex items-center gap-1">
      <X className="h-3 w-3" /> Bad key
    </span>
  )
}

export function AIHub({
  open,
  onOpenChange,
  settings,
  loading,
  syncStatus,
  syncError,
  onSetActiveProvider,
  onUpdateKey,
  onVerify,
  verifying,
  onRetrySync,
}: Props) {
  const [groqStatus, setGroqStatus] = useState<KeyStatus | null>(null)
  const [geminiStatus, setGeminiStatus] = useState<KeyStatus | null>(null)

  const active = settings.activeProvider
  const activeKey = active === 'gemini' ? settings.geminiApiKey : settings.groqApiKey
  const otherProvider: Provider = active === 'groq' ? 'gemini' : 'groq'
  const otherKey = otherProvider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey

  const handleKeyChange = useCallback(
    (provider: Provider, value: string) => {
      onUpdateKey(provider, value)
      // Reset status when user edits
      if (provider === 'groq') setGroqStatus(null)
      else setGeminiStatus(null)
    },
    [onUpdateKey],
  )

  const handleVerify = useCallback(
    async (provider: Provider) => {
      const key = provider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey
      if (!key) {
        toast({
          title: 'Enter a key first',
          description: `Type your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key`,
          variant: 'destructive',
        })
        return
      }
      onVerify(provider)
      const status = await testApiKeyForProvider(provider, key)
      if (provider === 'groq') setGroqStatus(status)
      else setGeminiStatus(status)

      if (status === 'valid') {
        toast({
          title: 'Key works',
          description: `${provider === 'gemini' ? 'Gemini' : 'Groq'} key verified`,
          variant: 'success',
        })
      } else if (status === 'rate_limited') {
        toast({
          title: 'Rate limited',
          description: `Key valid but quota used up. Try Groq instead.`,
          variant: 'destructive',
        })
      } else if (status === 'disabled') {
        toast({
          title: 'API not enabled',
          description: `Enable Generative Language API at console.cloud.google.com`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Invalid key',
          description: `Double-check your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key`,
          variant: 'destructive',
        })
      }
    },
    [settings.groqApiKey, settings.geminiApiKey, onVerify],
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <div className="p-6 pt-14 space-y-5">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>AI Hub</SheetTitle>
                <SheetDescription>Add one key to start playing</SheetDescription>
              </div>
              <SyncBadge status={syncStatus} error={syncError} onRetry={onRetrySync} />
            </div>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Provider Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
                {(['groq', 'gemini'] as Provider[]).map((p) => {
                  const isActive = active === p
                  const hasKey = p === 'groq' ? !!settings.groqApiKey : !!settings.geminiApiKey
                  return (
                    <button
                      key={p}
                      onClick={() => onSetActiveProvider(p)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? p === 'groq'
                            ? 'bg-background text-cyan-400 shadow-sm'
                            : 'bg-background text-blue-400 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p === 'groq' ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {p === 'groq' ? 'Groq' : 'Gemini'}
                      {hasKey && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p === 'groq' ? 'bg-cyan-400' : 'bg-blue-400'
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Active Provider Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`key-${active}`} className="text-sm font-medium">
                    {active === 'groq' ? 'Groq' : 'Gemini'} API Key
                  </Label>
                  <KeyStatusBadge status={active === 'groq' ? groqStatus : geminiStatus} />
                </div>
                <div className="flex gap-2">
                  <Input
                    id={`key-${active}`}
                    name={`${active}ApiKey`}
                    type="password"
                    placeholder={active === 'groq' ? 'gsk_...' : 'AIza...'}
                    value={activeKey}
                    onChange={(e) => handleKeyChange(active, e.target.value)}
                    className="font-mono text-xs flex-1"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerify(active)}
                    disabled={!activeKey || verifying === active}
                    className="shrink-0 px-3"
                  >
                    {verifying === active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                <a
                  href={
                    active === 'groq'
                      ? 'https://console.groq.com/keys'
                      : 'https://aistudio.google.com/apikey'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get free key{' '}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Other Provider Key (collapsed) */}
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span className="group-open:rotate-90 transition-transform text-[10px]">
                    ▶
                  </span>
                  {otherKey ? 'Second key added' : 'Add second key (optional)'}
                </summary>
                <div className="mt-3 space-y-3 pl-3 border-l-2 border-muted">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`key-${otherProvider}`} className="text-xs font-medium">
                      {otherProvider === 'groq' ? 'Groq' : 'Gemini'} API Key
                    </Label>
                    <KeyStatusBadge
                      status={otherProvider === 'groq' ? groqStatus : geminiStatus}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={`key-${otherProvider}`}
                      name={`${otherProvider}ApiKey`}
                      type="password"
                      placeholder={otherProvider === 'groq' ? 'gsk_...' : 'AIza...'}
                      value={otherKey}
                      onChange={(e) => handleKeyChange(otherProvider, e.target.value)}
                      className="font-mono text-xs flex-1"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(otherProvider)}
                      disabled={!otherKey || verifying === otherProvider}
                      className="shrink-0 px-3"
                    >
                      {verifying === otherProvider ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                  <a
                    href={
                      otherProvider === 'groq'
                        ? 'https://console.groq.com/keys'
                        : 'https://aistudio.google.com/apikey'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get free key{' '}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </details>

              {/* Status bar */}
              {activeKey && (
                <div
                  className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
                    syncStatus === 'error'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}
                >
                  {syncStatus === 'error' ? (
                    <>
                      <CloudOff className="h-4 w-4 shrink-0" />
                      <span className="flex-1">
                        Saved locally. Cloud sync failed:{' '}
                        {syncError || 'check Firestore rules'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onRetrySync}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span>
                        Using {active === 'groq' ? 'Groq' : 'Gemini'}
                        {syncStatus === 'synced' ? ' · synced to cloud' : ' · saved locally'}
                      </span>
                    </>
                  )}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Keys auto-save as you type. Stored in your browser and synced to your Firebase account.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
