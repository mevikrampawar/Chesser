const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

function getApiKey(): string | null {
  try {
    return localStorage.getItem('chesser_groq_api_key')
  } catch {
    return null
  }
}

export function setApiKey(key: string): void {
  localStorage.setItem('chesser_groq_api_key', key)
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

export function clearApiKey(): void {
  localStorage.removeItem('chesser_groq_api_key')
}

export async function chatCompletion(
  messages: { role: string; content: string }[],
): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key set')

  const sanitized = messages.map((m) => ({
    ...m,
    content: m.role === 'user' ? m.content.replace(/[^\w\d\s,.\-]/g, '').slice(0, 500) : m.content,
  }))

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: sanitized,
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      stream: false,
    }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key')
    if (res.status === 429) throw new Error('Rate limited — try again in a moment')
    throw new Error(`API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function testApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 10,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
