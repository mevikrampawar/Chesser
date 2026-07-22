import type { OpeningData, OpeningResult } from '../types'
import { chatCompletion } from './llm'
import { fetchOpeningFromLichess } from './lichess'
import { buildOpeningPrompt } from '../utils/prompts'

function parseOpeningJSON(raw: string): OpeningResult | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.name && parsed.eco) {
      return {
        name: parsed.name,
        eco: parsed.eco,
        explanation: parsed.explanation || '',
        keyIdeas: parsed.keyIdeas || '',
        commonContinuations: parsed.commonContinuations || '',
      }
    }
    return null
  } catch {
    return null
  }
}

export async function identifyOpening(uciMoves: string[]): Promise<OpeningData> {
  if (uciMoves.length === 0) {
    return {
      opening: {
        name: 'Starting Position',
        eco: '\u2014',
        explanation: 'Play some moves to identify the opening.',
        keyIdeas: '',
        commonContinuations: '',
      },
      stats: null,
      topMoves: [],
      lichessOpening: null,
    }
  }

  const [llmRaw, lichessData] = await Promise.all([
    chatCompletion([
      { role: 'system', content: 'You are a chess opening encyclopedia. Respond only with valid JSON.' },
      { role: 'user', content: buildOpeningPrompt(uciMoves.join(',')) },
    ]),
    fetchOpeningFromLichess(uciMoves),
  ])

  let opening = parseOpeningJSON(llmRaw)
  if (!opening) {
    opening = {
      name: 'Unable to identify',
      eco: '\u2014',
      explanation: 'Could not identify this opening.',
      keyIdeas: '',
      commonContinuations: '',
    }
  }

  if (lichessData?.opening) {
    opening.eco = lichessData.opening.eco
    opening.name = lichessData.opening.name
  }

  const topMoves = lichessData?.moves || []

  let stats = null
  if (topMoves.length > 0) {
    const totalW = topMoves.reduce((s, m) => s + m.white, 0)
    const totalD = topMoves.reduce((s, m) => s + m.draws, 0)
    const totalB = topMoves.reduce((s, m) => s + m.black, 0)
    const total = totalW + totalD + totalB
    if (total > 0) {
      stats = {
        white: Math.round((totalW / total) * 1000) / 10,
        draws: Math.round((totalD / total) * 1000) / 10,
        black: Math.round((totalB / total) * 1000) / 10,
        totalGames: total,
      }
    }
  }

  return { opening, stats, topMoves, lichessOpening: lichessData?.opening || null }
}
