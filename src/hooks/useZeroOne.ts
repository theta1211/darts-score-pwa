import { useReducer } from 'react'
import { Player, DartThrow, ZeroOneVariant, WinnerInfo, PlayerResult } from '../types'

interface PlayerState {
  score: number
  roundScores: number[]
}

interface ZeroOneState {
  variant: ZeroOneVariant
  players: PlayerState[]
  currentPlayer: number
  throwsThisTurn: DartThrow[]
  round: number
  gameOver: boolean
  winner: WinnerInfo | null
  lastBust: boolean
}

interface FullState {
  current: ZeroOneState
  history: ZeroOneState[]
}

type Action = { type: 'THROW'; dart: DartThrow } | { type: 'UNDO' }

function makeInitial(players: Player[], variant: ZeroOneVariant): ZeroOneState {
  return {
    variant,
    players: players.map(() => ({ score: variant, roundScores: [] })),
    currentPlayer: 0,
    throwsThisTurn: [],
    round: 1,
    gameOver: false,
    winner: null,
    lastBust: false,
  }
}

function reducer(players: Player[]) {
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
      const turnScore = newThrows.reduce((s, t) => s + t.score, 0)
      const currentScore = prev.players[prev.currentPlayer].score
      const newScore = currentScore - turnScore

      const nextPlayer = (prev.currentPlayer + 1) % pc
      const isLastPlayer = prev.currentPlayer === pc - 1

      // BUST
      if (newScore < 0) {
        const next: ZeroOneState = {
          ...prev,
          currentPlayer: nextPlayer,
          throwsThisTurn: [],
          round: isLastPlayer ? prev.round + 1 : prev.round,
          lastBust: true,
        }
        return { current: next, history: [...state.history, prev] }
      }

      // WIN
      if (newScore === 0) {
        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayer
            ? { score: 0, roundScores: [...p.roundScores, turnScore] }
            : p
        )
        const playerResults: PlayerResult[] = newPlayers.map((p, i) => ({
          name: players[i].name,
          isWinner: i === prev.currentPlayer,
          finalScore: p.score,
          roundScores: p.roundScores,
        }))
        const next: ZeroOneState = {
          ...prev,
          players: newPlayers,
          throwsThisTurn: newThrows,
          gameOver: true,
          winner: {
            indices: [prev.currentPlayer],
            names: [players[prev.currentPlayer].name],
            playerResults,
          },
          lastBust: false,
        }
        return { current: next, history: [...state.history, prev] }
      }

      // END OF TURN (3 throws)
      if (newThrows.length >= 3) {
        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayer
            ? { score: newScore, roundScores: [...p.roundScores, turnScore] }
            : p
        )
        const next: ZeroOneState = {
          ...prev,
          players: newPlayers,
          currentPlayer: nextPlayer,
          throwsThisTurn: [],
          round: isLastPlayer ? prev.round + 1 : prev.round,
          lastBust: false,
        }
        return { current: next, history: [...state.history, prev] }
      }

      // MID-TURN
      return {
        current: { ...prev, throwsThisTurn: newThrows, lastBust: false },
        history: [...state.history, prev],
      }
    }

    return state
  }
}

export function useZeroOne(players: Player[], variant: ZeroOneVariant) {
  const [state, dispatch] = useReducer(reducer(players), {
    current: makeInitial(players, variant),
    history: [],
  })

  const throwDart = (dart: DartThrow) => dispatch({ type: 'THROW', dart })
  const undo = () => dispatch({ type: 'UNDO' })

  const s = state.current
  const turnScore = s.throwsThisTurn.reduce((acc, t) => acc + t.score, 0)

  return {
    players: s.players,
    currentPlayer: s.currentPlayer,
    throwsThisTurn: s.throwsThisTurn,
    round: s.round,
    turnScore,
    gameOver: s.gameOver,
    winner: s.winner,
    lastBust: s.lastBust,
    canUndo: state.history.length > 0,
    throwDart,
    undo,
  }
}
