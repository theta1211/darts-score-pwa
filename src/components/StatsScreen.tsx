import { useState } from 'react'
import { Trash2, TrendingUp, Target, Crosshair, Trophy, BarChart2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { GameRecord, GameMode } from '../types'
import { PeriodFilter, filterByPeriod } from '../hooks/useGameHistory'

interface Props {
  records: GameRecord[]
  onClear: () => void
}

const MODE_LABEL: Record<GameMode, string> = {
  'zero-one': '01',
  cricket: 'クリケット',
  'count-up': 'カウントアップ',
}

const MODE_COLOR: Record<GameMode, { text: string; bg: string; border: string }> = {
  'zero-one': { text: 'text-cyan-400', bg: 'bg-cyan-900/30', border: 'border-cyan-700' },
  cricket: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-700' },
  'count-up': { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700' },
}

const MODE_ICON: Record<GameMode, React.ReactNode> = {
  'zero-one': <Target size={12} />,
  cricket: <Crosshair size={12} />,
  'count-up': <TrendingUp size={12} />,
}

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: '今日', value: 'today' },
  { label: '今週', value: 'week' },
  { label: '全期間', value: 'all' },
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Custom tooltip for Recharts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm shadow-lg">
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-green-400 font-black text-lg">{payload[0].value} pts</p>
      </div>
    )
  }
  return null
}

export default function StatsScreen({ records, onClear }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const filtered = filterByPeriod(records, period)
  const countUpRecords = filtered.filter((r) => r.mode === 'count-up')
  const zeroOneRecords = filtered.filter((r) => r.mode === 'zero-one')
  const cricketRecords = filtered.filter((r) => r.mode === 'cricket')

  // Count-up chart data (chronological order)
  const chartData = countUpRecords
    .slice()
    .reverse()
    .map((r, idx) => ({
      label: formatDateShort(r.timestamp),
      score: Math.max(...r.players.map((p) => p.finalScore)),
      index: idx + 1,
    }))

  const cuScores = chartData.map((d) => d.score)
  const cuAvg = cuScores.length > 0 ? Math.round(cuScores.reduce((a, b) => a + b, 0) / cuScores.length) : 0
  const cuBest = cuScores.length > 0 ? Math.max(...cuScores) : 0

  const handleClear = () => {
    onClear()
    setShowClearConfirm(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-8 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight neon-text-cyan flex items-center gap-2">
            <BarChart2 size={28} className="text-cyan-400" />
            STATS
          </h1>
          <p className="text-slate-400 text-sm">スコア統計・履歴</p>
        </div>
        {records.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-press w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:border-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Period filter */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 bg-slate-900 rounded-2xl p-1">
          {PERIOD_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`btn-press flex-1 h-9 rounded-xl font-bold text-sm transition-all ${
                period === value
                  ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_#22d3ee40]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 pb-16">
          <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <BarChart2 size={36} className="text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-bold text-lg">記録がありません</p>
            <p className="text-slate-500 text-sm mt-1">
              {period === 'today' ? '今日はまだゲームを' : period === 'week' ? '今週はまだゲームを' : 'まだゲームを'}
              プレイしていません
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4 pb-8">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="総ゲーム数" value={String(filtered.length)} unit="ゲーム" color="cyan" />
            {countUpRecords.length > 0 ? (
              <>
                <StatCard label="CU 平均" value={String(cuAvg)} unit="pts" color="green" />
                <StatCard label="CU 最高" value={String(cuBest)} unit="pts" color="amber" />
              </>
            ) : (
              <>
                <StatCard label="01 ゲーム" value={String(zeroOneRecords.length)} unit="回" color="cyan" />
                <StatCard label="クリケット" value={String(cricketRecords.length)} unit="回" color="amber" />
              </>
            )}
          </div>

          {/* Count-up growth chart */}
          {chartData.length >= 2 && (
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" />
                カウントアップ スコア推移
              </h2>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#334155"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#334155"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                    {cuAvg > 0 && (
                      <ReferenceLine
                        y={cuAvg}
                        stroke="#fbbf24"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        label={{ value: `avg ${cuAvg}`, position: 'insideTopRight', fill: '#fbbf24', fontSize: 9 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4ade80"
                      strokeWidth={2.5}
                      dot={{ fill: '#4ade80', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#4ade80', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-green-400 rounded" />
                    <span className="text-xs text-slate-500">スコア</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-amber-400 rounded" style={{ borderTop: '1px dashed' }} />
                    <span className="text-xs text-slate-500">平均 {cuAvg}pts</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Count-up chart placeholder when only 1 game */}
          {countUpRecords.length === 1 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-center">
              <p className="text-slate-500 text-sm">カウントアップをあと{Math.max(0, 2 - countUpRecords.length)}回プレイするとグラフが表示されます</p>
            </div>
          )}

          {/* History list */}
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              対戦履歴 ({filtered.length})
            </h2>
            <div className="flex flex-col gap-2">
              {filtered.map((record) => (
                <GameHistoryCard key={record.id} record={record} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Clear confirm dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 pb-10 border-t border-slate-700">
            <h3 className="text-white font-black text-lg mb-1">履歴を削除しますか？</h3>
            <p className="text-slate-400 text-sm mb-6">全ての対戦記録が削除されます。この操作は元に戻せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-press flex-1 h-12 rounded-2xl bg-slate-700 text-slate-200 font-bold"
              >
                キャンセル
              </button>
              <button
                onClick={handleClear}
                className="btn-press flex-1 h-12 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-500"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 flex flex-col gap-0.5">
      <span className="text-slate-500 text-xs truncate">{label}</span>
      <span className={`text-2xl font-black leading-none ${colorMap[color]}`}>{value}</span>
      <span className="text-slate-600 text-xs">{unit}</span>
    </div>
  )
}

function GameHistoryCard({ record }: { record: GameRecord }) {
  const colors = MODE_COLOR[record.mode]
  const modeLabel = MODE_LABEL[record.mode]
  const icon = MODE_ICON[record.mode]
  const winners = record.players.filter((p) => p.isWinner)
  const variantSuffix = record.mode === 'zero-one' && record.variant ? ` ${record.variant}` : ''

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${colors.text} ${colors.bg} ${colors.border}`}>
          {icon}
          {modeLabel}{variantSuffix}
        </div>
        <span className="text-slate-500 text-xs">{formatDate(record.timestamp)}</span>
      </div>

      {/* Players */}
      <div className="px-4 py-2 flex flex-col gap-1">
        {record.players.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            {p.isWinner ? (
              <Trophy size={12} className="text-amber-400 flex-shrink-0" />
            ) : (
              <span className="w-3 h-3 flex-shrink-0" />
            )}
            <span className={`flex-1 text-sm font-bold truncate ${p.isWinner ? 'text-white' : 'text-slate-400'}`}>
              {p.name}
            </span>
            <ScoreDisplay record={record} player={p} />
          </div>
        ))}
        {winners.length > 1 && (
          <p className="text-xs text-slate-500 text-center mt-0.5">引き分け</p>
        )}
      </div>

      {/* Round scores for count-up (winner only, compact) */}
      {record.mode === 'count-up' && winners[0]?.roundScores && winners[0].roundScores.length > 0 && (
        <div className="px-4 pb-2.5">
          <div className="flex gap-1 flex-wrap">
            {winners[0].roundScores.map((s, i) => (
              <span key={i} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                R{i + 1}:{s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreDisplay({ record, player }: { record: GameRecord; player: GameRecord['players'][0] }) {
  if (record.mode === 'count-up') {
    return (
      <span className={`text-sm font-black tabular-nums ${player.isWinner ? 'text-green-400' : 'text-slate-500'}`}>
        {player.finalScore} pts
      </span>
    )
  }
  if (record.mode === 'zero-one') {
    return (
      <span className={`text-sm font-black tabular-nums ${player.isWinner ? 'text-cyan-400' : 'text-slate-500'}`}>
        {player.isWinner ? 'FINISH' : `残${player.finalScore}`}
      </span>
    )
  }
  // cricket
  return (
    <span className={`text-sm font-black tabular-nums ${player.isWinner ? 'text-amber-400' : 'text-slate-500'}`}>
      {player.finalScore} pts
    </span>
  )
}
