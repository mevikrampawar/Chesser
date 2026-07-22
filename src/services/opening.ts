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

export async function identifyOpening(
  uciMoves: string[],
): Promise<OpeningData> {
  const moveStr = uciMoves.join(',')

  if (uciMoves.length === 0) {
    return {
      opening: {
        name: 'Starting Position',
        eco: '—',
        explanation: 'Play some moves to identify the opening.',
        keyIdeas: '',
        commonContinuations: '',
      },
      stats: null,
      topMoves: [],
      lichessOpening: null,
    }
  }

  const prompt = buildOpeningPrompt(moveStr)

  const [llmRaw, lichessData] = await Promise.all([
    chatCompletion([
      {
        role: 'system',
        content: 'You are a chess opening encyclopedia. Respond only with valid JSON.',
      },
      { role: 'user', content: prompt },
    ]),
    fetchOpeningFromLichess(uciMoves),
  ])

  let opening = parseOpeningJSON(llmRaw)

  if (!opening) {
    opening = {
      name: 'Unable to identify',
      eco: '—',
      explanation: 'The AI could not identify this opening from the given moves.',
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
  if (lichessData && topMoves.length > 0) {
    const totalWhite = topMoves.reduce((s, m) => s + m.white, 0)
    const totalDraws = topMoves.reduce((s, m) => s + m.draws, 0)
    const totalBlack = topMoves.reduce((s, m) => s + m.black, 0)
    const total = totalWhite + totalDraws + totalBlack

    if (total > 0) {
      stats = {
        white: Math.round((totalWhite / total) * 1000) / 10,
        draws: Math.round((totalDraws / total) * 1000) / 10,
        black: Math.round((totalBlack / total) * 1000) / 10,
        totalGames: total,
      }
    }
  }

  return {
    opening,
    stats,
    topMoves,
    lichessOpening: lichessData?.opening || null,
  }
}
