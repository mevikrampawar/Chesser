import { geminiChatCompletion, testGeminiApiKey } from './gemini'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

export type Provider = 'groq' | 'gemini'

// --- Groq ---
async function groqChatCompletion(
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  if (!apiKey) throw new Error('No Groq API key set')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      stream: false,
    }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid Groq API key')
    if (res.status === 429) throw new Error('Rate limited — try again in a moment')
    if (res.status === 503) throw new Error('Groq service temporarily unavailable')
    throw new Error(`Groq API error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function groqTestApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 10,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// --- Unified interface ---
export async function chatCompletionWithProvider(
  provider: Provider,
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  if (provider === 'gemini') return geminiChatCompletion(apiKey, messages)
  return groqChatCompletion(apiKey, messages)
}

export async function testApiKeyForProvider(
  provider: Provider,
  key: string,
): Promise<boolean> {
  if (provider === 'gemini') return testGeminiApiKey(key)
  return groqTestApiKey(key)
}

export function getProviderName(provider: Provider): string {
  return provider === 'gemini' ? 'Google Gemini' : 'Groq'
}
