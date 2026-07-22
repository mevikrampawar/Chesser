import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm'

export interface LLMProgress {
  progress: number
  text: string
}

const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC'

let engine: MLCEngineInterface | null = null

export async function loadModel(
  onProgress?: (p: LLMProgress) => void,
): Promise<MLCEngineInterface> {
  if (engine) return engine

  onProgress?.({ progress: 0, text: 'Initializing WebLLM engine...' })

  engine = await CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (report) => {
      onProgress?.({
        progress: report.progress,
        text: report.text || 'Loading model weights...',
      })
    },
  })

  onProgress?.({ progress: 1, text: 'Model ready!' })
  return engine
}

// Sanitize input to prevent prompt injection
function sanitizeInput(input: string): string {
  return input
    .replace(/[^\w\d\s,.\-]/g, '')
    .slice(0, 500)
    .trim()
}

export async function chatCompletion(
  messages: { role: string; content: string }[],
): Promise<string> {
  if (!engine) throw new Error('LLM engine not loaded. Call loadModel() first.')

  // Sanitize all user inputs
  const sanitizedMessages = messages.map((msg) => ({
    ...msg,
    content: msg.role === 'user' ? sanitizeInput(msg.content) : msg.content,
  }))

  const response = await engine.chat.completions.create({
    messages: sanitizedMessages as { role: 'system' | 'user' | 'assistant'; content: string }[],
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  })

  return response.choices[0]?.message?.content || ''
}

export function isEngineLoaded(): boolean {
  return engine !== null
}

export function getEngine(): MLCEngineInterface | null {
  return engine
}
