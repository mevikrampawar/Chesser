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
import { testApiKeyForProvider, type Provider, type KeyStatus } from '@/services/llm'
import type { AIHubSettings } from '@/services/aiHubFirestore'
import { toast } from '@/hooks/useToast'
import { Loader2, Check, X, AlertTriangle, ExternalLink, Zap, Sparkles, Shield } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AIHubSettings
  loading: boolean
  saving: boolean
  onSetActiveProvider: (provider: Provider) => void
  onUpdateKey: (provider: Provider, key: string) => void
  onSave: () => void
}

function StatusDot({ status }: { status: KeyStatus | null }) {
  if (!status) return null
  if (status === 'valid')
    return <span className="inline-flex items-center gap-1 text-[11px] text-green-500 font-medium"><Check className="h-3 w-3" /> Verified</span>
  if (status === 'rate_limited')
    return <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium"><AlertTriangle className="h-3 w-3" /> Rate limited</span>
  if (status === 'disabled')
    return <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium"><AlertTriangle className="h-3 w-3" /> API not enabled</span>
  return <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium"><X className="h-3 w-3" /> Invalid key</span>
}

export function AIHub({
  open,
  onOpenChange,
  settings,
  loading,
  saving,
  onSetActiveProvider,
  onUpdateKey,
  onSave,
}: Props) {
  const [groqStatus, setGroqStatus] = useState<KeyStatus | null>(null)
  const [geminiStatus, setGeminiStatus] = useState<KeyStatus | null>(null)
  const [verifying, setVerifying] = useState<Provider | null>(null)

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
      setVerifying(provider)
      const status = await testApiKeyForProvider(provider, key)
      setVerifying(null)

      if (provider === 'groq') setGroqStatus(status)
      else setGeminiStatus(status)

      if (status === 'valid') {
        toast({ title: 'Key verified', description: `${provider === 'gemini' ? 'Gemini' : 'Groq'} key works`, variant: 'success' })
      } else if (status === 'rate_limited') {
        toast({ title: 'Rate limited', description: 'Key valid but quota exhausted. Try Groq.', variant: 'destructive' })
      } else if (status === 'disabled') {
        toast({ title: 'API not enabled', description: 'Enable Generative Language API at console.cloud.google.com', variant: 'destructive' })
      } else {
        toast({ title: 'Invalid key', description: `Double-check your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key`, variant: 'destructive' })
      }
    },
    [settings.groqApiKey, settings.geminiApiKey],
  )

  const hasAnyKey = !!(settings.groqApiKey || settings.geminiApiKey)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] overflow-y-auto">
        <div className="p-5 sm:p-6 pt-14 space-y-5">
          <SheetHeader>
            <SheetTitle className="text-lg">AI Hub</SheetTitle>
            <SheetDescription>
              Add a free API key to analyze chess openings
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Groq Card */}
              <div
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  settings.activeProvider === 'groq'
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => onSetActiveProvider('groq')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      settings.activeProvider === 'groq' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-muted'
                    }`}>
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Groq</span>
                      {settings.activeProvider === 'groq' && hasAnyKey && settings.groqApiKey && (
                        <span className="ml-2 text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                      )}
                    </div>
                  </div>
                  <StatusDot status={groqStatus} />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="groq-key"
                      name="groqApiKey"
                      type="password"
                      placeholder="gsk_..."
                      value={settings.groqApiKey}
                      onChange={(e) => {
                        onUpdateKey('groq', e.target.value)
                        setGroqStatus(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs flex-1"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVerify('groq')
                      }}
                      disabled={!settings.groqApiKey || verifying === 'groq'}
                      className="shrink-0 px-3"
                    >
                      {verifying === 'groq' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get free key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Gemini Card */}
              <div
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  settings.activeProvider === 'gemini'
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => onSetActiveProvider('gemini')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      settings.activeProvider === 'gemini' ? 'bg-blue-500/20 text-blue-400' : 'bg-muted'
                    }`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Gemini</span>
                      {settings.activeProvider === 'gemini' && hasAnyKey && settings.geminiApiKey && (
                        <span className="ml-2 text-[10px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                      )}
                    </div>
                  </div>
                  <StatusDot status={geminiStatus} />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="gemini-key"
                      name="geminiApiKey"
                      type="password"
                      placeholder="AIza..."
                      value={settings.geminiApiKey}
                      onChange={(e) => {
                        onUpdateKey('gemini', e.target.value)
                        setGeminiStatus(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs flex-1"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVerify('gemini')
                      }}
                      disabled={!settings.geminiApiKey || verifying === 'gemini'}
                      className="shrink-0 px-3"
                    >
                      {verifying === 'gemini' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get free key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* How it works */}
              <div className="rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">How it works</p>
                <p>• Pick <strong>Groq</strong> (fast, free) or <strong>Gemini</strong> (Google AI)</p>
                <p>• Enter one key — that's enough to play</p>
                <p>• Click a card to set it as your active provider</p>
              </div>

              {/* Save Button */}
              <Button
                onClick={onSave}
                disabled={saving || !hasAnyKey}
                className="w-full"
                size="lg"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>

              {/* Security note */}
              <div className="flex items-start gap-2 rounded-xl bg-green-500/5 border border-green-500/20 p-3">
                <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div className="text-[11px] text-green-600 dark:text-green-400">
                  <p className="font-medium">Encrypted & secure</p>
                  <p>Keys are encrypted (AES-256) before saving. Only you can access them via your Google account.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
