import type { OpeningData, OpeningResult, TopMove, OpeningStats } from '../types'
import { chatCompletionWithProvider, type Provider } from './llm'
import { buildOpeningPrompt } from '../utils/prompts'

const ECO_REGEX = /^[A-E]\d{2}$/

function parseOpeningJSON(raw: string): OpeningData | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.name || typeof parsed.name !== 'string') return null
    if (!parsed.eco || typeof parsed.eco !== 'string') return null

    const eco = parsed.eco.trim().toUpperCase()
    if (!ECO_REGEX.test(eco)) return null

    const opening: OpeningResult = {
      name: String(parsed.name).slice(0, 200).trim(),
      eco,
      explanation: String(parsed.explanation || '').slice(0, 2000).trim(),
      keyIdeas: String(parsed.keyIdeas || '').slice(0, 1000).trim(),
      commonContinuations: String(parsed.commonContinuations || '').slice(0, 500).trim(),
    }

    let stats: OpeningStats | null = null
    if (parsed.stats && typeof parsed.stats === 'object') {
      const w = Number(parsed.stats.white)
      const d = Number(parsed.stats.draws)
      const b = Number(parsed.stats.black)
      if (Number.isFinite(w) && Number.isFinite(d) && Number.isFinite(b)) {
        const total = w + d + b
        if (total > 0) {
          stats = {
            white: Math.round((w / total) * 1000) / 10,
            draws: Math.round((d / total) * 1000) / 10,
            black: Math.round((b / total) * 1000) / 10,
          }
        }
      }
    }

    let topMoves: TopMove[] = []
    if (Array.isArray(parsed.topMoves)) {
      topMoves = parsed.topMoves
        .filter((m: Record<string, unknown>) => {
          if (!m.san || typeof m.san !== 'string') return false
          if (typeof m.white !== 'number' || typeof m.draws !== 'number' || typeof m.black !== 'number') return false
          if (!Number.isFinite(m.white) || !Number.isFinite(m.draws) || !Number.isFinite(m.black)) return false
          return true
        })
        .slice(0, 5)
        .map((m: Record<string, unknown>) => {
          const w = Number(m.white)
          const d = Number(m.draws)
          const b = Number(m.black)
          const total = w + d + b
          if (total > 0) {
            return {
              san: String(m.san).slice(0, 10),
              white: Math.round((w / total) * 100),
              draws: Math.round((d / total) * 100),
              black: Math.round((b / total) * 100),
            }
          }
          return {
            san: String(m.san).slice(0, 10),
            white: Math.round(w),
            draws: Math.round(d),
            black: Math.round(b),
          }
        })
    }

    return { opening, stats, topMoves }
  } catch {
    return null
  }
}

export async function identifyOpening(
  sanMoves: string[],
  provider: Provider,
  apiKey: string,
): Promise<OpeningData> {
  if (sanMoves.length === 0) {
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

  const movesText = sanMoves
    .map((san, i) => (i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ${san}` : san))
    .join(' ')

  const raw = await chatCompletionWithProvider(provider, apiKey, [
    { role: 'system', content: 'You are a chess opening encyclopedia. Respond only with valid JSON. No markdown, no explanation, no extra text.' },
    { role: 'user', content: buildOpeningPrompt(movesText) },
  ])

  const result = parseOpeningJSON(raw)
  if (result) return result

  return {
    opening: {
      name: 'Unable to identify',
      eco: '---',
      explanation: 'Could not identify this opening from the given moves.',
      keyIdeas: '',
      commonContinuations: '',
    },
    stats: null,
    topMoves: [],
  }
}
