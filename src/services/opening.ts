import type { OpeningData, OpeningResult, TopMove, OpeningStats } from '../types'
import { chatCompletion } from './llm'
import { buildOpeningPrompt } from '../utils/prompts'

function parseOpeningJSON(raw: string): OpeningData | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.name || !parsed.eco) return null

    const opening: OpeningResult = {
      name: parsed.name,
      eco: parsed.eco,
      explanation: parsed.explanation || '',
      keyIdeas: parsed.keyIdeas || '',
      commonContinuations: parsed.commonContinuations || '',
    }

    let stats: OpeningStats | null = null
    if (parsed.stats && typeof parsed.stats.white === 'number') {
      stats = {
        white: Math.round(parsed.stats.white * 10) / 10,
        draws: Math.round(parsed.stats.draws * 10) / 10,
        black: Math.round(parsed.stats.black * 10) / 10,
      }
    }

    let topMoves: TopMove[] = []
    if (Array.isArray(parsed.topMoves)) {
      topMoves = parsed.topMoves
        .filter((m: Record<string, unknown>) => m.san && typeof m.white === 'number')
        .slice(0, 5)
        .map((m: Record<string, unknown>) => ({
          san: String(m.san),
          white: Math.round(Number(m.white)),
          draws: Math.round(Number(m.draws)),
          black: Math.round(Number(m.black)),
        }))
    }

    return { opening, stats, topMoves }
  } catch {
    return null
  }
}

export async function identifyOpening(uciMoves: string[]): Promise<OpeningData> {
  if (uciMoves.length === 0) {
    return {
      opening: {
        name: 'Starting Position',
        eco: '---',
        explanation: 'Play some moves to identify the opening.',
        keyIdeas: '',
        commonContinuations: '',
      },
      stats: null,
      topMoves: [],
    }
  }

  const raw = await chatCompletion([
    { role: 'system', content: 'You are a chess opening encyclopedia. Respond only with valid JSON.' },
    { role: 'user', content: buildOpeningPrompt(uciMoves.join(',')) },
  ])

  const result = parseOpeningJSON(raw)
  if (result) return result

  return {
    opening: {
      name: 'Unable to identify',
      eco: '---',
      explanation: 'Could not identify this opening.',
      keyIdeas: '',
      commonContinuations: '',
    },
    stats: null,
    topMoves: [],
  }
}
