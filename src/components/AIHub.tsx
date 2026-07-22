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
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { testApiKeyForProvider, type Provider } from '@/services/llm'
import type { AIHubSettings } from '@/services/aiHubFirestore'
import { toast } from '@/hooks/useToast'
import { Loader2, Check, X, ExternalLink } from 'lucide-react'

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

type VerifyingProvider = Provider | null

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
  const [verifying, setVerifying] = useState<VerifyingProvider>(null)
  const [groqVerified, setGroqVerified] = useState<boolean | null>(null)
  const [geminiVerified, setGeminiVerified] = useState<boolean | null>(null)

  const handleVerify = useCallback(async (provider: Provider) => {
    const key = provider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey
    if (!key) {
      toast({ title: 'No key', description: `Enter a ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key first`, variant: 'destructive' })
      return
    }
    setVerifying(provider)
    const ok = await testApiKeyForProvider(provider, key)
    if (provider === 'groq') setGroqVerified(ok)
    else setGeminiVerified(ok)
    setVerifying(null)
    if (ok) {
      toast({ title: 'Verified', description: `${provider === 'gemini' ? 'Gemini' : 'Groq'} key is valid`, variant: 'success' })
    } else {
      toast({ title: 'Invalid key', description: `This ${provider === 'gemini' ? 'Gemini' : 'Groq'} key is invalid`, variant: 'destructive' })
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
                Manage your AI providers and API keys
              </SheetDescription>
            </SheetHeader>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Provider Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Active Provider</Label>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        {settings.activeProvider === 'gemini' ? 'Google Gemini' : 'Groq'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {settings.activeProvider === 'gemini' ? 'gemini-2.0-flash' : 'llama-3.1-8b-instant'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.activeProvider === 'gemini'}
                      onCheckedChange={(checked) =>
                        onSetActiveProvider(checked ? 'gemini' : 'groq')
                      }
                    />
                  </div>
                </div>

                {/* Groq Key */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Groq API Key</Label>
                    {groqVerified === true && <Check className="h-4 w-4 text-green-500" />}
                    {groqVerified === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                  <Input
                    type="password"
                    placeholder="gsk_..."
                    value={settings.groqApiKey}
                    onChange={(e) => onUpdateGroqKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify('groq')}
                      disabled={!settings.groqApiKey || verifying === 'groq'}
                    >
                      {verifying === 'groq' ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Verify
                    </Button>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get free key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Gemini Key */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Gemini API Key</Label>
                    {geminiVerified === true && <Check className="h-4 w-4 text-green-500" />}
                    {geminiVerified === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                  <Input
                    type="password"
                    placeholder="AIza..."
                    value={settings.geminiApiKey}
                    onChange={(e) => onUpdateGeminiKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify('gemini')}
                      disabled={!settings.geminiApiKey || verifying === 'gemini'}
                    >
                      {verifying === 'gemini' ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Verify
                    </Button>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
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

                <Button onClick={onSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Settings
                </Button>

                <p className="text-[10px] text-muted-foreground text-center">
                  API keys are stored in your Firebase Firestore and protected by security rules.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
