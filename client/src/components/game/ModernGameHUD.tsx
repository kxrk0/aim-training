import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCrosshairs, FaBolt, FaFire, FaClock, FaTrophy, FaVolumeUp, FaVolumeMute, FaPause, FaPlay } from 'react-icons/fa'
import { useLevelStore } from '@/stores/levelStore'

interface ModernGameHUDProps {
  score: number
  accuracy: number
  hits: number
  misses: number
  timeLeft: number
  reactionTime: number
  gameMode: string
  isActive: boolean
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onExit: () => void
}

interface XPNotification {
  id: string
  amount: number
  x: number
  y: number
}

export function ModernGameHUD({
  score,
  accuracy,
  hits,
  misses,
  timeLeft,
  reactionTime,
  gameMode,
  isActive,
  isPaused,
  onPause,
  onResume,
  onExit
}: ModernGameHUDProps) {
  const { currentLevel, totalXP, xpToNextLevel } = useLevelStore()
  const [xpNotifications, setXPNotifications] = useState<XPNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showStats, setShowStats] = useState(true)

  // Add XP notification when score changes
  useEffect(() => {
    if (score > 0) {
      const newNotification: XPNotification = {
        id: Date.now().toString(),
        amount: Math.round(score / 100), // Simple XP calculation
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 100
      }
      
      setXPNotifications(prev => [...prev, newNotification])
      
      // Remove notification after animation
      setTimeout(() => {
        setXPNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, 2000)
    }
  }, [score])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get accuracy color
  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-green-400'
    if (acc >= 80) return 'text-yellow-400'
    if (acc >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  // Get game mode color
  const getGameModeColor = () => {
    switch (gameMode) {
      case 'speed': return 'from-red-500 to-pink-500'
      case 'precision': return 'from-cyan-500 to-blue-500'
      case 'tracking': return 'from-blue-500 to-purple-500'
      case 'flick': return 'from-yellow-500 to-orange-500'
      default: return 'from-green-500 to-emerald-500'
    }
  }

  if (!isActive) return null

  return (
    <>
      {/* Main HUD */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-black/60 backdrop-blur-md rounded-2xl px-8 py-4 border border-gray-700/50">
            <div className="flex items-center space-x-8">
              {/* Game Mode */}
              <div className="text-center">
                <div className={`text-sm font-medium bg-gradient-to-r ${getGameModeColor()} bg-clip-text text-transparent`}>
                  {gameMode.toUpperCase()}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <motion.div 
                  className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
                  animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <div className="text-xs text-gray-400">TIME</div>
              </div>

              {/* Score */}
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-yellow-400"
                  key={score}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {score.toLocaleString()}
                </motion.div>
                <div className="text-xs text-gray-400">SCORE</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Left Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-24 left-6"
            >
              <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 space-y-4 border border-gray-700/50 min-w-[200px]">
                {/* Accuracy */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCrosshairs className="text-gray-400" />
                    <span className="text-sm text-gray-300">Accuracy</span>
                  </div>
                  <motion.span 
                    className={`font-bold ${getAccuracyColor(accuracy)}`}
                    key={accuracy}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {accuracy.toFixed(1)}%
                  </motion.span>
                </div>

                {/* Reaction Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaBolt className="text-yellow-400" />
                    <span className="text-sm text-gray-300">Reaction</span>
                  </div>
                  <span className="font-bold text-green-400">
                    {Math.round(reactionTime)}ms
                  </span>
                </div>

                {/* Hits vs Misses */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaFire className="text-orange-400" />
                    <span className="text-sm text-gray-300">Hits</span>
                  </div>
                  <span className="font-bold text-blue-400">
                    {hits}/{hits + misses}
                  </span>
                </div>

                {/* Level Progress */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Level {currentLevel}</span>
                    <span className="text-xs text-gray-400">
                      {((totalXP % 1000) / 10).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((totalXP % 1000) / 10)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Controls Panel */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute top-24 right-6"
        >
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 space-y-2 border border-gray-700/50">
            {/* Pause/Resume */}
            <button
              onClick={isPaused ? onResume : onPause}
              className="w-full p-3 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-auto"
            >
              {isPaused ? <FaPlay className="text-green-400" /> : <FaPause className="text-orange-400" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-auto"
            >
              {soundEnabled ? <FaVolumeUp className="text-blue-400" /> : <FaVolumeMute className="text-gray-400" />}
            </button>

            {/* Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-full p-3 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-auto"
            >
              <FaTrophy className="text-purple-400" />
            </button>
          </div>
        </motion.div>

        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            {/* Crosshair lines */}
            <div className="absolute w-8 h-0.5 bg-green-400/80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-0.5 h-8 bg-green-400/80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Center dot */}
            <div className="absolute w-1 h-1 bg-green-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Outer ring */}
            <div className="absolute w-12 h-12 border border-green-400/40 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </motion.div>
        </div>

        {/* XP Gain Notifications */}
        <AnimatePresence>
          {xpNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ 
                x: notification.x, 
                y: notification.y, 
                opacity: 1, 
                scale: 0.5 
              }}
              animate={{ 
                y: notification.y - 100, 
                opacity: 0, 
                scale: 1.2 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-yellow-400 font-bold text-lg pointer-events-none"
              style={{ left: notification.x, top: notification.y }}
            >
              +{notification.amount} XP
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Performance Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex space-x-2"
          >
            {/* Accuracy indicator */}
            <div className={`w-3 h-3 rounded-full ${
              accuracy >= 90 ? 'bg-green-400' :
              accuracy >= 80 ? 'bg-yellow-400' :
              accuracy >= 70 ? 'bg-orange-400' :
              'bg-red-400'
            }`} />
            
            {/* Speed indicator */}
            <div className={`w-3 h-3 rounded-full ${
              reactionTime <= 200 ? 'bg-green-400' :
              reactionTime <= 300 ? 'bg-yellow-400' :
              reactionTime <= 400 ? 'bg-orange-400' :
              'bg-red-400'
            }`} />
            
            {/* Consistency indicator */}
            <div className={`w-3 h-3 rounded-full ${
              hits > misses * 2 ? 'bg-green-400' :
              hits > misses ? 'bg-yellow-400' :
              'bg-red-400'
            }`} />
          </motion.div>
        </div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center"
            >
              <FaPause className="text-6xl text-orange-400 mb-4 mx-auto" />
              <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
              <p className="text-gray-400 mb-8">Take a break or continue training</p>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={onResume}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <FaPlay />
                  <span>Resume</span>
                </button>
                
                <button
                  onClick={onExit}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-300"
                >
                  Exit to Hub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}