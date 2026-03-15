export type GameMode = 'zero-one' | 'cricket' | 'count-up'
export type ZeroOneVariant = 301 | 501
export type AppPhase = 'setup' | 'playing' | 'over' | 'stats'

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

// Per-player result stored in history records
export interface PlayerResult {
  name: string
  isWinner: boolean
  finalScore: number      // count-up: total; 01: remaining (0=win); cricket: pts
  roundScores?: number[]  // count-up: per-round; 01: per-round deductions
}

// One game record saved to localStorage
export interface GameRecord {
  id: string
  timestamp: string        // ISO 8601
  mode: GameMode
  variant?: ZeroOneVariant // 01 only
  players: PlayerResult[]
}

export interface WinnerInfo {
  indices: number[]   // support ties (count-up)
  names: string[]
  score?: number
  playerResults?: PlayerResult[]
}

export const CRICKET_TARGETS = [20, 19, 18, 17, 16, 15, 25] as const
export type CricketTarget = (typeof CRICKET_TARGETS)[number]
