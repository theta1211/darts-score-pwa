import { useState, useCallback } from 'react'
import { AppPhase, GameConfig, WinnerInfo } from './types'
import GameSetup from './components/GameSetup'
import ZeroOneGame from './components/ZeroOneGame'
import CricketGame from './components/CricketGame'
import CountUpGame from './components/CountUpGame'
import GameOver from './components/GameOver'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup')
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [winner, setWinner] = useState<WinnerInfo | null>(null)
  // Key to force re-mount game components (reset state)
  const [gameKey, setGameKey] = useState(0)

  const handleStart = useCallback((cfg: GameConfig) => {
    setConfig(cfg)
    setWinner(null)
    setGameKey((k) => k + 1)
    setPhase('playing')
  }, [])

  const handleGameOver = useCallback((w: WinnerInfo) => {
    setWinner(w)
    setPhase('over')
  }, [])

  const handleRestart = useCallback(() => {
    if (!config) return
    setWinner(null)
    setGameKey((k) => k + 1)
    setPhase('playing')
  }, [config])

  const handleHome = useCallback(() => {
    setPhase('setup')
  }, [])

  return (
    <div className="h-full w-full max-w-lg mx-auto flex flex-col overflow-hidden">
      {phase === 'setup' && <GameSetup onStart={handleStart} />}

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
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </div>
  )
}
