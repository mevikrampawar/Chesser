import type { LichessExplorerResponse } from '../types'

const EXPLORER_URL = 'https://explorer.lichess.ovh/masters'

let lastRequest = 0
const MIN_INTERVAL = 350

function isValidUCI(move: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)
}

export async function fetchOpeningFromLichess(
  uciMoves: string[],
): Promise<LichessExplorerResponse | null> {
  if (!uciMoves.length || uciMoves.length > 200) return null
  if (!uciMoves.every(isValidUCI)) return null

  const now = Date.now()
  if (now - lastRequest < MIN_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - (now - lastRequest)))
  }
  lastRequest = Date.now()

  try {
    const params = new URLSearchParams({ play: uciMoves.join(',') })
    const res = await fetch(`${EXPLORER_URL}?${params}`)
    if (res.status === 429 || !res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
