import { useEffect, useState } from 'react'
import { Home, Info } from 'lucide-react'
import { GameConfig, WinnerInfo } from '../types'
import { useCountUp } from '../hooks/useCountUp'
import DartInput from './DartInput'
import InfoGuide from './InfoGuide'

interface Props {
  config: GameConfig
  onGameOver: (winner: WinnerInfo) => void
  onHome: () => void
}

export default function CountUpGame({ config, onGameOver, onHome }: Props) {
  const { players } = config
  const g = useCountUp(players)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (g.gameOver && g.winner) onGameOver(g.winner)
  }, [g.gameOver, g.winner, onGameOver])

  const currentName = players[g.currentPlayer].name
  const currentTotal = g.players[g.currentPlayer].total

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800">
        <button onClick={onHome} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Home size={16} />
        </button>
        <div className="text-center">
          <span className="text-lg font-black text-white">COUNT UP</span>
          <span className="text-slate-500 text-sm ml-2">
            Round {g.round}/{g.maxRounds}
          </span>
        </div>
        <button onClick={() => setShowInfo(true)} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Info size={16} />
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex gap-2 px-3 py-3">
        {players.map((p, i) => {
          const ps = g.players[i]
          const isCurrent = i === g.currentPlayer
          const displayTotal = isCurrent ? ps.total + g.turnScore : ps.total
          const maxTotal = Math.max(...g.players.map((p) => p.total))
          const isLeading = ps.total === maxTotal && maxTotal > 0
          return (
            <div
              key={p.id}
              className={`flex-1 min-w-0 rounded-2xl p-3 border-2 transition-all ${
                isCurrent
                  ? 'border-amber-500 bg-amber-900/20'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              <div className={`text-xs font-bold truncate mb-1 flex items-center gap-1 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                {isCurrent && <span>▶</span>}
                <span>{p.name}</span>
                {isLeading && !isCurrent && <span className="text-yellow-400 text-xs">★</span>}
              </div>
              <div className={`text-3xl font-black leading-none ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                {displayTotal}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {ps.roundScores.length}R
                {isCurrent && g.turnScore > 0 && (
                  <span className="ml-1 text-green-400">+{g.turnScore}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Round progress */}
      <div className="px-3 pb-2">
        <div className="flex gap-1">
          {Array.from({ length: g.maxRounds }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                i < g.round - 1
                  ? 'bg-cyan-500'
                  : i === g.round - 1
                  ? 'bg-amber-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Turn banner */}
      <div className="px-3 pb-2">
        <div className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-400">{currentName} の番</span>
          <span className="text-xs text-slate-500">
            {g.throwsThisTurn.length}/3 投
            {g.turnScore > 0 && (
              <span className="ml-2 text-green-400 font-bold">+{g.turnScore}</span>
            )}
          </span>
        </div>
      </div>

      {/* Current player total */}
      <div className="px-3 pb-1 text-center">
        <span className="text-slate-400 text-xs">合計: </span>
        <span className="text-2xl font-black text-white">{currentTotal + g.turnScore}</span>
        <span className="text-slate-500 text-xs"> pts</span>
      </div>

      {/* Dart input */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <DartInput
          onThrow={g.throwDart}
          onUndo={g.undo}
          canUndo={g.canUndo}
          throwsThisTurn={g.throwsThisTurn}
          disabled={g.gameOver}
        />
      </div>

      {showInfo && <InfoGuide onClose={() => setShowInfo(false)} />}
    </div>
  )
}
