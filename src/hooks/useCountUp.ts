import { useReducer } from 'react'
import { Player, DartThrow, WinnerInfo } from '../types'

const MAX_ROUNDS = 8

interface PlayerState {
  total: number
  roundScores: number[]
}

interface CountUpState {
  players: PlayerState[]
  currentPlayer: number
  throwsThisTurn: DartThrow[]
  round: number
  gameOver: boolean
  winner: WinnerInfo | null
}

interface FullState {
  current: CountUpState
  history: CountUpState[]
}

type Action = { type: 'THROW'; dart: DartThrow } | { type: 'UNDO' }

function makeInitial(count: number): CountUpState {
  return {
    players: Array.from({ length: count }, () => ({ total: 0, roundScores: [] })),
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

      if (newThrows.length >= 3) {
        const turnScore = newThrows.reduce((s, t) => s + t.score, 0)
        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayer
            ? { total: p.total + turnScore, roundScores: [...p.roundScores, turnScore] }
            : p
        )
        const nextPlayer = (prev.currentPlayer + 1) % pc
        const isLastPlayer = prev.currentPlayer === pc - 1
        const newRound = isLastPlayer ? prev.round + 1 : prev.round

        const gameOver = isLastPlayer && prev.round >= MAX_ROUNDS
        if (gameOver) {
          const maxScore = Math.max(...newPlayers.map((p) => p.total))
          const winners = newPlayers
            .map((p, i) => (p.total === maxScore ? i : -1))
            .filter((i) => i >= 0)
          return {
            current: {
              ...prev,
              players: newPlayers,
              throwsThisTurn: [],
              round: newRound,
              gameOver: true,
              winner: {
                indices: winners,
                names: winners.map((i) => playerDefs[i].name),
                score: maxScore,
              },
            },
            history: [...state.history, prev],
          }
        }

        return {
          current: {
            ...prev,
            players: newPlayers,
            currentPlayer: nextPlayer,
            throwsThisTurn: [],
            round: newRound,
          },
          history: [...state.history, prev],
        }
      }

      return {
        current: { ...prev, throwsThisTurn: newThrows },
        history: [...state.history, prev],
      }
    }

    return state
  }
}

export function useCountUp(players: Player[]) {
  const [state, dispatch] = useReducer(reducer(players), {
    current: makeInitial(players.length),
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
    maxRounds: MAX_ROUNDS,
    gameOver: s.gameOver,
    winner: s.winner,
    canUndo: state.history.length > 0,
    throwDart,
    undo,
  }
}
