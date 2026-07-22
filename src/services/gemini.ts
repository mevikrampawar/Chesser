import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_MODEL = 'gemini-2.0-flash'

export async function geminiChatCompletion(
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  if (!apiKey) throw new Error('No Gemini API key set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

  const systemMsg = messages.find((m) => m.role === 'system')
  const userMsgs = messages.filter((m) => m.role === 'user')

  const contents = userMsgs.map((m) => ({
    role: 'user' as const,
    parts: [{ text: m.content }],
  }))

  const result = await model.generateContent({
    contents,
    systemInstruction: systemMsg?.content,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  })

  return result.response.text() || ''
}

export async function testGeminiApiKey(key: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
    const result = await model.generateContent('Say "ok"')
    return !!result.response.text()
  } catch {
    return false
  }
}
