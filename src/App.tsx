import { useState, useCallback } from 'react'
import { Target, BarChart2 } from 'lucide-react'
import { AppPhase, GameConfig, WinnerInfo, GameRecord } from './types'
import GameSetup from './components/GameSetup'
import ZeroOneGame from './components/ZeroOneGame'
import CricketGame from './components/CricketGame'
import CountUpGame from './components/CountUpGame'
import GameOver from './components/GameOver'
import StatsScreen from './components/StatsScreen'
import { useGameHistory } from './hooks/useGameHistory'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup')
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [winner, setWinner] = useState<WinnerInfo | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [recordSaved, setRecordSaved] = useState(false)

  const { records, addRecord, clearRecords } = useGameHistory()

  const handleStart = useCallback((cfg: GameConfig) => {
    setConfig(cfg)
    setWinner(null)
    setRecordSaved(false)
    setGameKey((k) => k + 1)
    setPhase('playing')
  }, [])

  const handleGameOver = useCallback((w: WinnerInfo) => {
    setWinner(w)
    // Auto-save the game record
    if (w.playerResults && config) {
      const record: GameRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        mode: config.mode,
        variant: config.mode === 'zero-one' ? config.variant : undefined,
        players: w.playerResults,
      }
      addRecord(record)
      setRecordSaved(true)
    }
    setPhase('over')
  }, [config, addRecord])

  const handleRestart = useCallback(() => {
    if (!config) return
    setWinner(null)
    setRecordSaved(false)
    setGameKey((k) => k + 1)
    setPhase('playing')
  }, [config])

  const handleHome = useCallback(() => {
    setPhase('setup')
  }, [])

  const showBottomNav = phase === 'setup' || phase === 'stats'

  return (
    <div className="h-full w-full max-w-lg mx-auto flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {phase === 'setup' && <GameSetup onStart={handleStart} />}
        {phase === 'stats' && <StatsScreen records={records} onClear={clearRecords} />}

        {phase === 'playing' && config && (
          <>
            {config.mode === 'zero-one' && (
              <ZeroOneGame
                key={gameKey}
                config={config}
                onGameOver={handleGameOver}
                onHome={handleHome}
              />
            )}
            {config.mode === 'cricket' && (
              <CricketGame
                key={gameKey}
                config={config}
                onGameOver={handleGameOver}
                onHome={handleHome}
              />
            )}
            {config.mode === 'count-up' && (
              <CountUpGame
                key={gameKey}
                config={config}
                onGameOver={handleGameOver}
                onHome={handleHome}
              />
            )}
          </>
        )}

        {phase === 'over' && config && winner && (
          <GameOver
            winner={winner}
            config={config}
            recordSaved={recordSaved}
            onRestart={handleRestart}
            onHome={handleHome}
            onStats={() => setPhase('stats')}
          />
        )}
      </div>

      {/* Bottom navigation */}
      {showBottomNav && (
        <nav className="flex-shrink-0 flex border-t border-slate-800 bg-slate-950">
          <NavTab
            label="ゲーム"
            icon={<Target size={20} />}
            active={phase === 'setup'}
            onClick={() => setPhase('setup')}
          />
          <NavTab
            label="統計"
            icon={<BarChart2 size={20} />}
            active={phase === 'stats'}
            badge={records.length > 0 ? records.length : undefined}
            onClick={() => setPhase('stats')}
          />
        </nav>
      )}
    </div>
  )
}

function NavTab({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-press flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
        active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
      }`}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-2 text-xs bg-cyan-500 text-slate-900 font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-bold">{label}</span>
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-cyan-400" />
      )}
    </button>
  )
}
