import type { LichessExplorerResponse } from '../types'

const EXPLORER_BASE = 'https://explorer.lichess.ovh'
const RATED_URL = `${EXPLORER_BASE}/lichess`
const MASTERS_URL = `${EXPLORER_BASE}/masters`

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

export async function fetchOpeningFromLichess(
  uciMoves: string[],
): Promise<LichessExplorerResponse | null> {
  if (uciMoves.length === 0) return null

  const play = uciMoves.join(',')
  const params = new URLSearchParams({ play, variant: 'chess' })

  try {
    const res = await fetch(`${RATED_URL}?${params}`, {
      headers: buildHeaders(),
    })

    if (res.status === 429) {
      throw new Error('RATE_LIMITED')
    }

    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}

export async function fetchMastersFromLichess(
  uciMoves: string[],
): Promise<LichessExplorerResponse | null> {
  if (uciMoves.length === 0) return null

  const play = uciMoves.join(',')
  const params = new URLSearchParams({ play })

  try {
    const res = await fetch(`${MASTERS_URL}?${params}`, {
      headers: buildHeaders(),
    })

    if (res.status === 429) {
      throw new Error('RATE_LIMITED')
    }

    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}
