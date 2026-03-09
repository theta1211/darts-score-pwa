import { useEffect, useState } from 'react'
import { Home, Info } from 'lucide-react'
import { GameConfig, WinnerInfo, CRICKET_TARGETS } from '../types'
import { useCricket } from '../hooks/useCricket'
import DartInput from './DartInput'
import InfoGuide from './InfoGuide'

interface Props {
  config: GameConfig
  onGameOver: (winner: WinnerInfo) => void
  onHome: () => void
}

function MarkDisplay({ marks }: { marks: number }) {
  if (marks === 0) return <span className="text-slate-600">—</span>
  if (marks === 1) return <span className="text-slate-300 font-bold">/</span>
  if (marks === 2) return <span className="text-cyan-300 font-bold">✕</span>
  return <span className="text-amber-400 font-black">●</span>
}

function targetLabel(t: number) {
  return t === 25 ? 'BULL' : String(t)
}

export default function CricketGame({ config, onGameOver, onHome }: Props) {
  const { players } = config
  const g = useCricket(players)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (g.gameOver && g.winner) onGameOver(g.winner)
  }, [g.gameOver, g.winner, onGameOver])

  const currentName = players[g.currentPlayer].name
  const targets = [...CRICKET_TARGETS]
  const highlightTargets = [...targets]

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-800">
        <button onClick={onHome} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Home size={16} />
        </button>
        <div className="text-center">
          <span className="text-lg font-black text-white">CRICKET</span>
          <span className="text-slate-500 text-sm ml-2">Round {g.round}</span>
        </div>
        <button onClick={() => setShowInfo(true)} className="btn-press w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
          <Info size={16} />
        </button>
      </div>

      {/* Cricket scoreboard */}
      <div className="px-2 py-1 overflow-x-auto flex-shrink-0">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-normal w-12 py-1 pl-1">TARGET</th>
              {players.map((p, i) => (
                <th
                  key={p.id}
                  className={`text-center py-1 font-bold ${
                    i === g.currentPlayer ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {i === g.currentPlayer && '▶ '}{p.name.length > 6 ? p.name.slice(0, 6) + '…' : p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const closed = players.every((_, i) => (g.players[i].marks[target] ?? 0) >= 3)
              return (
                <tr
                  key={target}
                  className={`border-t border-slate-800/50 ${closed ? 'opacity-40' : ''}`}
                >
                  <td className={`py-1.5 pl-1 font-bold ${closed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                    {targetLabel(target)}
                  </td>
                  {players.map((p, i) => {
                    const marks = g.players[i].marks[target] ?? 0
                    return (
                      <td key={p.id} className="text-center py-1.5 text-base">
                        <MarkDisplay marks={marks} />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {/* Score row */}
            <tr className="border-t-2 border-slate-700">
              <td className="text-slate-500 py-2 pl-1 font-bold text-xs">PTS</td>
              {players.map((p, i) => (
                <td
                  key={p.id}
                  className={`text-center py-2 font-black text-base ${
                    i === g.currentPlayer ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {g.players[i].score}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Turn banner */}
      <div className="px-3 pb-2">
        <div className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-400">{currentName} の番</span>
          <span className="text-xs text-slate-500">{g.throwsThisTurn.length}/3 投</span>
        </div>
      </div>

      {/* Dart input */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <DartInput
          onThrow={g.throwDart}
          onUndo={g.undo}
          canUndo={g.canUndo}
          throwsThisTurn={g.throwsThisTurn}
          highlightTargets={highlightTargets}
          disabled={g.gameOver}
        />
      </div>

      {showInfo && <InfoGuide onClose={() => setShowInfo(false)} />}
    </div>
  )
}
