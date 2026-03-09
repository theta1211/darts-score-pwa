export type GameMode = 'zero-one' | 'cricket' | 'count-up'
export type ZeroOneVariant = 301 | 501
export type AppPhase = 'setup' | 'playing' | 'over'

export interface Player {
  id: string
  name: string
}

export interface DartThrow {
  number: number   // 1-20, 25=BULL, 0=MISS
  multiplier: 1 | 2 | 3
  score: number    // pre-calculated score
}

export interface GameConfig {
  mode: GameMode
  players: Player[]
  variant: ZeroOneVariant
}

export interface WinnerInfo {
  indices: number[]   // support ties (count-up)
  names: string[]
  score?: number
}

export const CRICKET_TARGETS = [20, 19, 18, 17, 16, 15, 25] as const
export type CricketTarget = (typeof CRICKET_TARGETS)[number]
