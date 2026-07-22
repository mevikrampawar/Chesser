import type { LichessExplorerResponse } from '../types'

const EXPLORER_BASE = 'https://explorer.lichess.ovh'
const RATED_URL = `${EXPLORER_BASE}/lichess`
const MASTERS_URL = `${EXPLORER_BASE}/masters`

// Rate limiting: max 3 requests per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 350

let lichessToken: string | null = null

export function setLichessToken(token: string | null) {
  lichessToken = token
  if (token) {
    localStorage.setItem('lichess_token', token)
  } else {
    localStorage.removeItem('lichess_token')
  }
}

export function getLichessToken(): string | null {
  if (lichessToken) return lichessToken
  const stored = localStorage.getItem('lichess_token')
  if (stored) {
    lichessToken = stored
    return stored
  }
  return null
}

function buildHeaders(): Record<string, string> {
  const token = getLichessToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

// Validate UCI move format
function isValidUCIMove(move: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)
}

// Validate move sequence
function validateMoves(moves: string[]): boolean {
  if (!Array.isArray(moves) || moves.length === 0) return false
  if (moves.length > 200) return false
  return moves.every(isValidUCIMove)
}

async function rateLimitedFetch(url: string): Promise<Response | null> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  try {
    const res = await fetch(url, {
      headers: buildHeaders(),
    })

    if (res.status === 429) {
      throw new Error('RATE_LIMITED')
    }

    if (!res.ok) return null
    return res
  } catch {
    return null
  }
}

export async function fetchOpeningFromLichess(
  uciMoves: string[],
): Promise<LichessExplorerResponse | null> {
  if (!validateMoves(uciMoves)) return null

  const play = uciMoves.join(',')
  const params = new URLSearchParams({ play, variant: 'chess' })

  const res = await rateLimitedFetch(`${RATED_URL}?${params}`)
  if (!res) return null

  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchMastersFromLichess(
  uciMoves: string[],
): Promise<LichessExplorerResponse | null> {
  if (!validateMoves(uciMoves)) return null

  const play = uciMoves.join(',')
  const params = new URLSearchParams({ play })

  const res = await rateLimitedFetch(`${MASTERS_URL}?${params}`)
  if (!res) return null

  try {
    return await res.json()
  } catch {
    return null
  }
}
