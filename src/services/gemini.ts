const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function geminiChatCompletion(
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  if (!apiKey) throw new Error('No Gemini API key set')

  const systemMsg = messages.find((m) => m.role === 'system')
  const userMsgs = messages.filter((m) => m.role === 'user')

  const contents = userMsgs.map((m) => ({
    role: 'user' as const,
    parts: [{ text: m.content }],
  }))

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 400) throw new Error('Invalid Gemini API key')
    if (res.status === 403)
      throw new Error(
        'Gemini API not enabled. Go to console.cloud.google.com → APIs → Enable "Generative Language API"',
      )
    if (res.status === 429) throw new Error('Rate limited — try again in a moment')
    throw new Error(`Gemini API error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export type GeminiKeyStatus = 'valid' | 'invalid' | 'rate_limited' | 'disabled'

export async function testGeminiApiKey(key: string): Promise<GeminiKeyStatus> {
  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say ok' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    })
    if (res.ok) return 'valid'
    if (res.status === 429) return 'rate_limited'
    if (res.status === 403) return 'disabled'
    return 'invalid'
  } catch {
    return 'invalid'
  }
}
