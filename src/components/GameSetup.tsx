import { useState } from 'react'
import { Plus, Minus, Info, Target, Crosshair, TrendingUp } from 'lucide-react'
import { GameMode, GameConfig, ZeroOneVariant, Player } from '../types'
import InfoGuide from './InfoGuide'

interface Props {
  onStart: (config: GameConfig) => void
}

const MODE_INFO: Record<GameMode, { label: string; desc: string; icon: React.ReactNode; color: string }> = {
  'zero-one': {
    label: '01 ゲーム',
    desc: '301/501から「0」を目指して得点を減算。バーストに注意！',
    icon: <Target size={24} />,
    color: 'cyan',
  },
  cricket: {
    label: 'クリケット',
    desc: '15〜20とBULLを3マーク（オープン）→得点加算。全オープン＆最高得点で勝利。',
    icon: <Crosshair size={24} />,
    color: 'amber',
  },
  'count-up': {
    label: 'カウントアップ',
    desc: '8ラウンド24投の合計を競うシンプルモード。初心者にもおすすめ！',
    icon: <TrendingUp size={24} />,
    color: 'green',
  },
}

const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-900/20',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500 text-slate-900',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-900/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500 text-slate-900',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-900/20',
    text: 'text-green-400',
    badge: 'bg-green-500 text-slate-900',
  },
}

function makePlayer(id: number, name?: string): Player {
  return { id: String(id), name: name ?? `Player ${id}` }
}

export default function GameSetup({ onStart }: Props) {
  const [mode, setMode] = useState<GameMode>('zero-one')
  const [variant, setVariant] = useState<ZeroOneVariant>(501)
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', '', '', ''])
  const [showInfo, setShowInfo] = useState(false)

  function handleStart() {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) =>
      makePlayer(i + 1, names[i].trim() || `Player ${i + 1}`)
    )
    onStart({ mode, players, variant })
  }

  const modeColors = COLOR_CLASSES[MODE_INFO[mode].color]

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-8 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight neon-text-cyan">
            DARTS
          </h1>
          <p className="text-slate-400 text-sm">スコアカウンター</p>
        </div>
        <button
          onClick={() => setShowInfo(true)}
          className="btn-press w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-8">
        {/* Game mode */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ゲームモード</h2>
          <div className="flex flex-col gap-2">
            {(Object.keys(MODE_INFO) as GameMode[]).map((m) => {
              const info = MODE_INFO[m]
              const colors = COLOR_CLASSES[info.color]
              const selected = mode === m
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`btn-press w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    selected
                      ? `${colors.border} ${colors.bg}`
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={selected ? colors.text : 'text-slate-500'}>{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${selected ? 'text-white' : 'text-slate-300'}`}>
                          {info.label}
                        </span>
                        {selected && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
                            選択中
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{info.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* 01 variant */}
        {mode === 'zero-one' && (
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">バリアント</h2>
            <div className="flex gap-3">
              {([301, 501] as ZeroOneVariant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`btn-press flex-1 h-12 rounded-xl font-bold text-lg border-2 transition-colors ${
                    variant === v
                      ? `${modeColors.border} ${modeColors.bg} text-white`
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Player count */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">プレイヤー数</h2>
          <div className="flex items-center gap-4 bg-slate-900 rounded-2xl p-4">
            <button
              onClick={() => setPlayerCount((c) => Math.max(1, c - 1))}
              className="btn-press w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-white hover:bg-slate-600"
            >
              <Minus size={18} />
            </button>
            <span className="flex-1 text-center text-4xl font-black text-white">{playerCount}</span>
            <button
              onClick={() => setPlayerCount((c) => Math.min(4, c + 1))}
              className="btn-press w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-white hover:bg-slate-600"
            >
              <Plus size={18} />
            </button>
          </div>
        </section>

        {/* Player names */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">プレイヤー名</h2>
          <div className="flex flex-col gap-2">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {i + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Player ${i + 1}`}
                  value={names[i]}
                  onChange={(e) => {
                    const n = [...names]
                    n[i] = e.target.value
                    setNames(n)
                  }}
                  maxLength={12}
                  className="flex-1 h-11 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Start button */}
        <button
          onClick={handleStart}
          className={`btn-press w-full h-14 rounded-2xl font-black text-xl ${modeColors.badge} shadow-lg hover:opacity-90 transition-opacity mt-2`}
        >
          ゲームスタート
        </button>
      </div>

      {showInfo && <InfoGuide onClose={() => setShowInfo(false)} />}
    </div>
  )
}
