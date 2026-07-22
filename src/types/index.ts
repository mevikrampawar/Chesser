export interface OpeningResult {
  name: string
  eco: string
  explanation: string
  keyIdeas: string
  commonContinuations: string
}

export interface LichessMove {
  uci: string
  san: string
  white: number
  draws: number
  black: number
  averageRating: number
}

export interface LichessOpening {
  eco: string
  name: string
}

export interface LichessExplorerResponse {
  fen: string
  opening?: LichessOpening
  moves: LichessMove[]
  topGames: unknown[]
  recentGames: unknown[]
}

export interface OpeningStats {
  white: number
  draws: number
  black: number
  totalGames: number
}

export interface OpeningData {
  opening: OpeningResult
  stats: OpeningStats | null
  topMoves: LichessMove[]
  lichessOpening: LichessOpening | null
}

export type AppScreen = 'login' | 'apikey' | 'app'
