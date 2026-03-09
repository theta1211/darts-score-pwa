import { useEffect, useState } from 'react'
import { Home, Info } from 'lucide-react'
import { GameConfig, WinnerInfo } from '../types'
import { useZeroOne } from '../hooks/useZeroOne'
import DartInput from './DartInput'
import InfoGuide from './InfoGuide'

interface Props {
  config: GameConfig
  onGameOver: (winner: WinnerInfo) => void
  onHome: () => void
}

export default function ZeroOneGame({ config, onGameOver, onHome }: Props) {
  const { players, variant } = config
  const g = useZeroOne(players, variant)
  const [showInfo, setShowInfo] = useState(false)
  const [bustAnim, setBustAnim] = useState(false)

  useEffect(() => {
    if (g.gameOver && g.winner) onGameOver(g.winner)
  }, [g.gameOver, g.winner, onGameOver])

  useEffect(() => {
    if (g.lastBust) {
      setBustAnim(true)
      const t = setTimeout(() => setBustAnim(false), 1200)
      return () => clearTimeout(t)
    }
  }, [g.lastBust])

  const currentName = players[g.currentPlayer].name

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 border-b border-slate-800">
        <button onClick={onHome} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Home size={16} />
        </button>
        <div className="text-center">
          <span className="text-lg font-black text-white">{variant}</span>
          <span className="text-slate-500 text-sm ml-2">Round {g.round}</span>
        </div>
        <button onClick={() => setShowInfo(true)} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Info size={16} />
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto">
        {players.map((p, i) => {
          const ps = g.players[i]
          const isCurrent = i === g.currentPlayer
          const projectedScore = isCurrent ? ps.score - g.turnScore : ps.score
          const willBust = projectedScore < 0
          return (
            <div
              key={p.id}
              className={`flex-1 min-w-0 rounded-2xl p-3 border-2 transition-all ${
                isCurrent
                  ? 'border-amber-500 bg-amber-900/20 neon-border-cyan'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              <div className={`text-xs font-bold truncate mb-1 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                {isCurrent ? '▶ ' : ''}{p.name}
              </div>
              <div className={`text-3xl font-black leading-none ${
                isCurrent && willBust ? 'text-red-400' :
                isCurrent ? 'text-white' : 'text-slate-300'
              }`}>
                {isCurrent && g.turnScore > 0 ? projectedScore : ps.score}
              </div>
              {isCurrent && g.turnScore > 0 && (
                <div className={`text-xs mt-0.5 ${willBust ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                  {willBust ? 'BUST!' : `-${g.turnScore}`}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Turn banner */}
      <div className="px-4 pb-2">
        <div className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-400">{currentName} の番</span>
          <span className="text-xs text-slate-500">
            {g.throwsThisTurn.length}/3 投
            {g.turnScore > 0 && (
              <span className="ml-2 text-cyan-400 font-bold">+{g.turnScore}</span>
            )}
          </span>
        </div>
      </div>

      {/* BUST overlay */}
      {bustAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-red-600/90 rounded-3xl px-10 py-6 animate-bounce">
            <div className="text-5xl font-black text-white">BUST!</div>
          </div>
        </div>
      )}

      {/* Dart Input */}
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
