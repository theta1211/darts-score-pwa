import { useReducer } from 'react'
import { Player, DartThrow, WinnerInfo, CRICKET_TARGETS, PlayerResult } from '../types'

const TARGETS = [...CRICKET_TARGETS] as number[]

interface PlayerState {
  marks: Record<number, number>  // target -> marks (unlimited, >3 means open+scoring)
  score: number
}

interface CricketState {
  players: PlayerState[]
  currentPlayer: number
  throwsThisTurn: DartThrow[]
  round: number
  gameOver: boolean
  winner: WinnerInfo | null
}

interface FullState {
  current: CricketState
  history: CricketState[]
}

type Action = { type: 'THROW'; dart: DartThrow } | { type: 'UNDO' }

function isClosed(players: PlayerState[], target: number): boolean {
  return players.every((p) => (p.marks[target] ?? 0) >= 3)
}

function allOpen(p: PlayerState): boolean {
  return TARGETS.every((t) => (p.marks[t] ?? 0) >= 3)
}

function checkWinner(players: PlayerState[], playerNames: Player[]): WinnerInfo | null {
  const maxScore = Math.max(...players.map((p) => p.score))
  for (let i = 0; i < players.length; i++) {
    if (allOpen(players[i]) && players[i].score >= maxScore) {
      const playerResults: PlayerResult[] = players.map((p, j) => ({
        name: playerNames[j].name,
        isWinner: j === i,
        finalScore: p.score,
      }))
      return { indices: [i], names: [playerNames[i].name], score: players[i].score, playerResults }
    }
  }
  return null
}

function applyThrow(state: CricketState, dart: DartThrow, playerDefs: Player[]): CricketState {
  const { number, multiplier } = dart
  if (!TARGETS.includes(number)) return state

  const players = [...state.players]
  const ci = state.currentPlayer
  const p = players[ci]

  if (isClosed(players, number)) return state

  const oldMarks = p.marks[number] ?? 0
  const addedMarks = number === 25 ? Math.min(multiplier, 2) : multiplier
  const newMarks = oldMarks + addedMarks

  let bonus = 0
  if (oldMarks >= 3) {
    // Already open: all added marks score
    bonus = addedMarks * number
  } else if (newMarks > 3) {
    // Just opened: only excess marks score
    bonus = (newMarks - 3) * number
  }

  // Check if target would be closed AFTER updating this player's marks
  const hypotheticalPlayers = players.map((pl, i) =>
    i === ci
      ? { ...pl, marks: { ...pl.marks, [number]: newMarks }, score: pl.score + bonus }
      : pl
  )

  const win = checkWinner(hypotheticalPlayers, playerDefs)

  return {
    ...state,
    players: hypotheticalPlayers,
    gameOver: win !== null,
    winner: win,
  }
}

function makeInitial(count: number): CricketState {
  return {
    players: Array.from({ length: count }, () => ({ marks: {}, score: 0 })),
    currentPlayer: 0,
    throwsThisTurn: [],
    round: 1,
    gameOver: false,
    winner: null,
  }
}

function reducer(playerDefs: Player[]) {
  return function (state: FullState, action: Action): FullState {
    if (action.type === 'UNDO') {
      if (state.history.length === 0) return state
      return {
        current: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
      }
    }

    if (action.type === 'THROW') {
      const prev = state.current
      if (prev.gameOver) return state

      const pc = prev.players.length
      const newThrows = [...prev.throwsThisTurn, action.dart]

      const afterThrow = applyThrow(prev, action.dart, playerDefs)

      if (afterThrow.gameOver) {
        return {
          current: { ...afterThrow, throwsThisTurn: newThrows },
          history: [...state.history, prev],
        }
      }

      if (newThrows.length >= 3) {
        const nextPlayer = (prev.currentPlayer + 1) % pc
        const isLastPlayer = prev.currentPlayer === pc - 1
        return {
          current: {
            ...afterThrow,
            currentPlayer: nextPlayer,
            throwsThisTurn: [],
            round: isLastPlayer ? prev.round + 1 : prev.round,
          },
          history: [...state.history, prev],
        }
      }

      return {
        current: { ...afterThrow, throwsThisTurn: newThrows },
        history: [...state.history, prev],
      }
    }

    return state
  }
}

export function useCricket(players: Player[]) {
  const [state, dispatch] = useReducer(reducer(players), {
    current: makeInitial(players.length),
    history: [],
  })

  const throwDart = (dart: DartThrow) => dispatch({ type: 'THROW', dart })
  const undo = () => dispatch({ type: 'UNDO' })

  const s = state.current
  return {
    players: s.players,
    currentPlayer: s.currentPlayer,
    throwsThisTurn: s.throwsThisTurn,
    round: s.round,
    gameOver: s.gameOver,
    winner: s.winner,
    canUndo: state.history.length > 0,
    throwDart,
    undo,
  }
}
