import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { DartThrow } from '../types'

interface Props {
  onThrow: (dart: DartThrow) => void
  onUndo: () => void
  canUndo: boolean
  throwsThisTurn: DartThrow[]
  maxThrows?: number
  highlightTargets?: number[]
  disabled?: boolean
}

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
const MULTIPLIERS: { label: string; value: 1 | 2 | 3 }[] = [
  { label: 'S', value: 1 },
  { label: 'D', value: 2 },
  { label: 'T', value: 3 },
]

function calcScore(number: number, multiplier: 1 | 2 | 3): number {
  if (number === 0) return 0   // MISS
  if (number === 25) return 25 * Math.min(multiplier, 2)  // BULL: max D50
  return number * multiplier
}

function throwLabel(dart: DartThrow): string {
  if (dart.number === 0) return 'MISS'
  const prefix = dart.multiplier === 1 ? 'S' : dart.multiplier === 2 ? 'D' : 'T'
  const num = dart.number === 25 ? 'BULL' : String(dart.number)
  return `${prefix}${num}`
}

export default function DartInput({
  onThrow,
  onUndo,
  canUndo,
  throwsThisTurn,
  maxThrows = 3,
  highlightTargets,
  disabled = false,
}: Props) {
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1)

  const throwCount = throwsThisTurn.length
  const isFull = throwCount >= maxThrows

  function handleNumber(num: number) {
    if (disabled || isFull) return
    const m = num === 25 ? (Math.min(multiplier, 2) as 1 | 2 | 3) : multiplier
    onThrow({ number: num, multiplier: m, score: calcScore(num, m) })
  }

  function handleMiss() {
    if (disabled || isFull) return
    onThrow({ number: 0, multiplier: 1, score: 0 })
  }

  const isHighlighted = (n: number) =>
    highlightTargets ? highlightTargets.includes(n) : false

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* Throw tracker */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex gap-2 flex-1">
          {Array.from({ length: maxThrows }).map((_, i) => {
            const t = throwsThisTurn[i]
            return (
              <div
                key={i}
                className={`flex-1 h-9 rounded-lg flex items-center justify-center text-sm font-bold border ${
                  t
                    ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300'
                    : i === throwCount
                    ? 'border-amber-500 bg-amber-900/20 text-amber-400 animate-pulse-fast'
                    : 'border-slate-700 bg-slate-800/50 text-slate-600'
                }`}
              >
                {t ? throwLabel(t) : i === throwCount ? '●' : '·'}
              </div>
            )
          })}
        </div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-press w-11 h-9 rounded-lg bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-300 hover:bg-slate-600"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Multiplier selector */}
      <div className="flex gap-2">
        {MULTIPLIERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setMultiplier(value)}
            className={`btn-press flex-1 h-11 rounded-xl font-bold text-lg border-2 transition-colors ${
              multiplier === value
                ? 'bg-cyan-500 border-cyan-400 text-slate-900 shadow-[0_0_12px_#22d3ee60]'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {NUMBERS.map((n) => {
          const highlighted = isHighlighted(n)
          return (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              disabled={disabled || isFull}
              className={`btn-press h-12 rounded-xl font-bold text-base border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                highlighted
                  ? 'bg-slate-700 border-cyan-600 text-cyan-300 hover:bg-cyan-900/40'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>

      {/* BULL + MISS */}
      <div className="flex gap-2">
        <button
          onClick={() => handleNumber(25)}
          disabled={disabled || isFull}
          className={`btn-press flex-1 h-12 rounded-xl font-bold text-base border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isHighlighted(25)
              ? 'bg-amber-900/40 border-amber-500 text-amber-300 hover:bg-amber-900/60'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
          }`}
        >
          BULL {multiplier === 2 ? '(D50)' : multiplier === 3 ? '(D50)' : '(25)'}
        </button>
        <button
          onClick={handleMiss}
          disabled={disabled || isFull}
          className="btn-press flex-1 h-12 rounded-xl font-bold text-sm border border-slate-700 bg-slate-800 text-slate-500 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          MISS
        </button>
      </div>
    </div>
  )
}
