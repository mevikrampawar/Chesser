export interface OpeningResult {
  name: string
  eco: string
  explanation: string
  keyIdeas: string
  commonContinuations: string
}

export interface OpeningStats {
  white: number
  draws: number
  black: number
}

export interface TopMove {
  san: string
  white: number
  draws: number
  black: number
}

export interface OpeningData {
  opening: OpeningResult
  stats: OpeningStats | null
  topMoves: TopMove[]
}

export type AppScreen = 'login' | 'app'
