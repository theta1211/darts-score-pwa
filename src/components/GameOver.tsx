import { Trophy, RotateCcw, Home, BarChart2, CheckCircle } from 'lucide-react'
import { WinnerInfo, GameConfig } from '../types'

interface Props {
  winner: WinnerInfo
  config: GameConfig
  recordSaved: boolean
  onRestart: () => void
  onHome: () => void
  onStats: () => void
}

const MODE_LABELS: Record<string, string> = {
  'zero-one': '01 ゲーム',
  cricket: 'クリケット',
  'count-up': 'カウントアップ',
}

export default function GameOver({ winner, config, recordSaved, onRestart, onHome, onStats }: Props) {
  const isTie = winner.indices.length > 1
  const modeLabel = MODE_LABELS[config.mode]
  const variantLabel = config.mode === 'zero-one' ? ` (${config.variant})` : ''

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-950 px-6 gap-5 overflow-y-auto py-6">
      {/* Trophy icon */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_40px_#fbbf2440]">
          <Trophy size={48} className="text-amber-400" />
        </div>
        {['top-0 left-4', 'top-0 right-4', 'top-8 -left-4', 'top-8 -right-4'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} text-amber-300 text-xl animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }}>
            ★
          </div>
        ))}
      </div>

      {/* Result text */}
      <div className="text-center flex-shrink-0">
        <p className="text-slate-400 text-sm font-medium mb-1">{modeLabel}{variantLabel} 終了</p>
        {isTie ? (
          <>
            <h1 className="text-4xl font-black text-white mb-1">引き分け！</h1>
            <p className="text-cyan-400 text-lg font-bold">{winner.names.join(' & ')}</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black text-white mb-1 neon-text-amber">{winner.names[0]}</h1>
            <p className="text-amber-400 text-xl font-bold">の勝利！</p>
          </>
        )}
        {winner.score !== undefined && (
          <p className="text-slate-400 text-sm mt-1.5">
            最終スコア: <span className="text-white font-bold">{winner.score} pts</span>
          </p>
        )}
      </div>

      {/* Scoreboard summary */}
      <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 flex-shrink-0">
        <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">最終スコア</h3>
        <div className="flex flex-col gap-2">
          {config.players.map((p, i) => {
            const isWinner = winner.indices.includes(i)
            const result = winner.playerResults?.[i]
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isWinner ? 'bg-amber-900/20 border border-amber-700' : 'bg-slate-800/50'
                }`}
              >
                {isWinner ? (
                  <Trophy size={16} className="text-amber-400 flex-shrink-0" />
                ) : (
                  <span className="w-4 text-center text-slate-600 text-sm">{i + 1}</span>
                )}
                <span className={`flex-1 font-bold ${isWinner ? 'text-amber-300' : 'text-slate-300'}`}>
                  {p.name}
                </span>
                {result && (
                  <span className={`text-sm font-black tabular-nums ${isWinner ? 'text-amber-400' : 'text-slate-500'}`}>
                    {config.mode === 'count-up'
                      ? `${result.finalScore} pts`
                      : config.mode === 'zero-one'
                      ? isWinner ? 'FINISH' : `残${result.finalScore}`
                      : `${result.finalScore} pts`}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Record saved badge */}
      {recordSaved && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-xl px-4 py-2 w-full flex-shrink-0">
          <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
          <span className="text-green-400 text-xs font-bold">統計に保存しました</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2.5 w-full flex-shrink-0">
        <button
          onClick={onRestart}
          className="btn-press w-full h-14 rounded-2xl font-black text-lg bg-cyan-500 text-slate-900 hover:bg-cyan-400 flex items-center justify-center gap-2 shadow-[0_0_20px_#22d3ee40]"
        >
          <RotateCcw size={20} />
          もう一度プレイ
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={onHome}
            className="btn-press flex-1 h-12 rounded-2xl font-bold text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
          >
            <Home size={16} />
            ホーム
          </button>
          <button
            onClick={onStats}
            className="btn-press flex-1 h-12 rounded-2xl font-bold text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
          >
            <BarChart2 size={16} />
            統計を見る
          </button>
        </div>
      </div>
    </div>
  )
}
