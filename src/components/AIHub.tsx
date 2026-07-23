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
import { ScrollArea } from '@/components/ui/scroll-area'
import { testApiKeyForProvider, type Provider } from '@/services/llm'
import type { AIHubSettings } from '@/services/aiHubFirestore'
import { toast } from '@/hooks/useToast'
import { Loader2, Check, ExternalLink, Zap, Sparkles } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AIHubSettings
  loading: boolean
  saving: boolean
  error: string | null
  onUpdateGroqKey: (key: string) => void
  onUpdateGeminiKey: (key: string) => void
  onSetActiveProvider: (provider: Provider) => void
  onSave: () => void
}

export function AIHub({
  open,
  onOpenChange,
  settings,
  loading,
  saving,
  error,
  onUpdateGroqKey,
  onUpdateGeminiKey,
  onSetActiveProvider,
  onSave,
}: Props) {
  const [verifying, setVerifying] = useState<Provider | null>(null)
  const [groqVerified, setGroqVerified] = useState<boolean | null>(null)
  const [geminiVerified, setGeminiVerified] = useState<boolean | null>(null)

  const handleVerify = useCallback(async (provider: Provider) => {
    const key = provider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey
    if (!key) {
      toast({ title: 'No key entered', description: `Type your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key first`, variant: 'destructive' })
      return
    }
    setVerifying(provider)
    const ok = await testApiKeyForProvider(provider, key)
    if (provider === 'groq') setGroqVerified(ok)
    else setGeminiVerified(ok)
    setVerifying(null)
    if (ok) {
      toast({ title: 'Key verified', description: `${provider === 'gemini' ? 'Gemini' : 'Groq'} key works`, variant: 'success' })
    } else {
      toast({ title: 'Invalid key', description: `This ${provider === 'gemini' ? 'Gemini' : 'Groq'} key is invalid. Check and try again.`, variant: 'destructive' })
    }
  }, [settings.groqApiKey, settings.geminiApiKey])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle>AI Hub</SheetTitle>
              <SheetDescription>
                Choose your AI provider and add an API key
              </SheetDescription>
            </SheetHeader>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Provider Selection - Radio buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">AI Provider</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Groq Option */}
                    <button
                      onClick={() => onSetActiveProvider('groq')}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        settings.activeProvider === 'groq'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        settings.activeProvider === 'groq'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">Groq</div>
                        <div className="text-[10px] text-muted-foreground">Fast, free</div>
                      </div>
                      {settings.activeProvider === 'groq' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Gemini Option */}
                    <button
                      onClick={() => onSetActiveProvider('gemini')}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        settings.activeProvider === 'gemini'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        settings.activeProvider === 'gemini'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">Gemini</div>
                        <div className="text-[10px] text-muted-foreground">Google AI</div>
                      </div>
                      {settings.activeProvider === 'gemini' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Groq Key Section */}
                <div className={`space-y-3 p-4 rounded-xl border transition-colors ${
                  settings.activeProvider === 'groq'
                    ? 'border-cyan-500/30 bg-cyan-500/5'
                    : 'border-border bg-card'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <Label className="text-sm font-semibold">Groq API Key</Label>
                    </div>
                    {groqVerified === true && <span className="text-[10px] text-green-500 font-medium">Valid</span>}
                    {groqVerified === false && <span className="text-[10px] text-red-500 font-medium">Invalid</span>}
                  </div>
                  <Input
                    type="password"
                    placeholder="gsk_..."
                    value={settings.groqApiKey}
                    onChange={(e) => onUpdateGroqKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify('groq')}
                      disabled={!settings.groqApiKey || verifying === 'groq'}
                      className="text-xs"
                    >
                      {verifying === 'groq' ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : groqVerified === true ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : null}
                      Verify
                    </Button>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get free key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Gemini Key Section */}
                <div className={`space-y-3 p-4 rounded-xl border transition-colors ${
                  settings.activeProvider === 'gemini'
                    ? 'border-blue-500/30 bg-blue-500/5'
                    : 'border-border bg-card'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <Label className="text-sm font-semibold">Gemini API Key</Label>
                    </div>
                    {geminiVerified === true && <span className="text-[10px] text-green-500 font-medium">Valid</span>}
                    {geminiVerified === false && <span className="text-[10px] text-red-500 font-medium">Invalid</span>}
                  </div>
                  <Input
                    type="password"
                    placeholder="AIza..."
                    value={settings.geminiApiKey}
                    onChange={(e) => onUpdateGeminiKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify('gemini')}
                      disabled={!settings.geminiApiKey || verifying === 'gemini'}
                      className="text-xs"
                    >
                      {verifying === 'gemini' ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : geminiVerified === true ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : null}
                      Verify
                    </Button>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get free key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button onClick={onSave} disabled={saving} className="w-full" size="lg">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>

                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  Keys are stored in your Firebase Firestore, protected by security rules.
                  Only you can access them.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
