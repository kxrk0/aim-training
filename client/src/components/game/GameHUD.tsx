import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GameHUDProps {
  gameMode: string
  isActive: boolean
  onBackToMenu: () => void
}

export function GameHUD({ gameMode, isActive, onBackToMenu }: GameHUDProps) {
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    accuracy: 0,
    averageReactionTime: 0
  })

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isActive) {
          setShowPauseMenu(!showPauseMenu)
        } else {
          onBackToMenu()
        }
      }
      
      if (event.key === ' ' && isActive) { // Space for pause
        event.preventDefault()
        setShowPauseMenu(!showPauseMenu)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, showPauseMenu, onBackToMenu])

  // Mock real-time stats updates
  useEffect(() => {
    if (isActive && !showPauseMenu) {
      const interval = setInterval(() => {
        setStats(prev => ({
          hits: prev.hits + Math.floor(Math.random() * 2),
          misses: prev.misses + Math.floor(Math.random() * 1),
          accuracy: Math.round((prev.hits / (prev.hits + prev.misses) * 100) || 0),
          averageReactionTime: 200 + Math.random() * 100
        }))
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isActive, showPauseMenu])

  return (
    <>
      {/* Stats HUD */}
      {isActive && !showPauseMenu && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 space-y-3"
        >
          {/* Performance Stats */}
          <div className="hud-element">
            <h3 className="text-sm font-semibold text-gaming-primary mb-2">Performance</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Hits:</span>
                <span className="text-gaming-primary font-bold">{stats.hits}</span>
              </div>
              <div className="flex justify-between">
                <span>Misses:</span>
                <span className="text-red-400 font-bold">{stats.misses}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="text-gaming-primary font-bold">{stats.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg RT:</span>
                <span className="text-yellow-400 font-bold">{Math.round(stats.averageReactionTime)}ms</span>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="hud-element">
            <h3 className="text-sm font-semibold text-gaming-primary mb-2">Controls</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Move Mouse - Aim</div>
              <div>Left Click - Shoot</div>
              <div>Space - Pause</div>
              <div>ESC - Menu</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pause Menu */}
      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="hud-element max-w-md w-full mx-4"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gaming-primary">
                  ⏸️ PAUSED
                </h2>

                {/* Current Stats */}
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-gaming-primary">Session Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gaming-primary">{stats.hits}</div>
                      <div className="text-gray-400">Hits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{stats.misses}</div>
                      <div className="text-gray-400">Misses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gaming-primary">{stats.accuracy}%</div>
                      <div className="text-gray-400">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{Math.round(stats.averageReactionTime)}ms</div>
                      <div className="text-gray-400">Avg RT</div>
                    </div>
                  </div>
                </div>

                {/* Menu Buttons */}
                <div className="space-y-3">
                  <motion.button
                    className="gaming-button w-full"
                    onClick={() => setShowPauseMenu(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ▶️ Resume Training
                  </motion.button>
                  
                  <motion.button
                    className="gaming-button-secondary w-full"
                    onClick={onBackToMenu}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🏠 Main Menu
                  </motion.button>
                </div>

                <p className="text-xs text-gray-500">
                  Press Space or ESC to resume
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 