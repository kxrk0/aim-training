import { useState } from 'react'
import { motion } from 'framer-motion'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameModeSelector } from '@/components/game/GameModeSelector'
import { GameHUD } from '@/components/game/GameHUD'

export function GamePage() {
  const [gameMode, setGameMode] = useState<string | null>(null)
  const [isGameActive, setIsGameActive] = useState(false)

  if (!gameMode) {
    return <GameModeSelector onSelectMode={setGameMode} />
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game Canvas */}
      <GameCanvas 
        gameMode={gameMode}
        isActive={isGameActive}
        onGameStart={() => setIsGameActive(true)}
        onGameEnd={() => setIsGameActive(false)}
      />
      
      {/* Game HUD */}
      <GameHUD 
        gameMode={gameMode}
        isActive={isGameActive}
        onBackToMenu={() => setGameMode(null)}
      />
      
      {/* Start Game Overlay */}
      {!isGameActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        >
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-gaming-primary">
              {gameMode.toUpperCase()} MODE
            </h2>
            <motion.button
              className="gaming-button text-xl px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGameActive(true)}
            >
              START TRAINING
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
} 