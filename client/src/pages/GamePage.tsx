import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameModeSelector } from '@/components/game/GameModeSelector'
import { GameHUD } from '@/components/game/GameHUD'
import { FaArrowLeft } from 'react-icons/fa'

export function GamePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState<string | null>(null)
  const [isGameActive, setIsGameActive] = useState(false)
  const [trainingMode, setTrainingMode] = useState<string | null>(null)
  const [playlistData, setPlaylistData] = useState<any>(null)

  // Check if we're coming from TrainingHub
  useEffect(() => {
    if (location.state) {
      const { selectedMode, playlist } = location.state as any
      if (selectedMode) {
        setTrainingMode(selectedMode)
        setGameMode(getMappedGameMode(selectedMode))
      }
      if (playlist) {
        setPlaylistData(playlist)
      }
    }
  }, [location.state])

  // Map training hub modes to game modes
  const getMappedGameMode = (trainingMode: string): string => {
    const mapping: Record<string, string> = {
      'static-clicking': 'precision',
      'dynamic-clicking': 'precision',
      'grid-shot': 'precision',
      'micro-shots': 'precision',
      'sphere-track': 'tracking',
      'close-tracking': 'tracking',
      'long-tracking': 'tracking',
      'air-tracking': 'tracking',
      'sixshot': 'flick',
      'multishot': 'flick',
      'arc-flick': 'flick',
      'speed-flick': 'flick',
      'switch-track': 'speed',
      'detection': 'speed',
      'motion-switch': 'speed',
      'valorant-recon': 'precision',
      'cs2-rifles': 'tracking',
      'apex-ads': 'flick'
    }
    return mapping[trainingMode] || 'precision'
  }

  const handleBackToHub = () => {
    navigate('/training-hub')
  }
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Back to Training Hub Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleBackToHub}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-all duration-300"
        >
          <FaArrowLeft className="text-sm" />
          <span>Back to Training Hub</span>
        </motion.button>

        {/* Hero Section with Game Mode Selection */}
        <motion.div
          style={{ y: y1 }}
          className="relative min-h-screen flex items-center justify-center px-6"
        >
          <div className="max-w-6xl mx-auto text-center">
            {/* Animated Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12"
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-black mb-6 leading-none"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                ELITE TRAINING
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl md:text-2xl font-bold text-gray-300"
              >
                Choose your training discipline and master your aim
              </motion.div>
            </motion.div>
            
            {/* Game Mode Selector - Modern Version */}
            <GameModeSelector onSelectMode={setGameMode} />
            
            {/* Training Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { label: 'Training Modes', value: '4+', icon: '🎯' },
                { label: 'Difficulty Levels', value: '5', icon: '⚡' },
                { label: 'Real-time Analytics', value: '∞', icon: '📊' },
                { label: 'Max FPS', value: '144+', icon: '🚀' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-orange-400 mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Floating Training Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 text-6xl opacity-10"
            >
              🎯
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, 40, 0],
                rotate: [360, 180, 0],
                scale: [1, 0.9, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-32 right-20 text-5xl opacity-10"
            >
              ⚔️
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -25, 0],
                rotate: [0, -180, -360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-20 left-20 text-5xl opacity-10"
            >
              ⚡
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
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
      
      {/* Start Game Overlay - Modernized */}
      {!isGameActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
        >
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 
                className="text-5xl md:text-7xl font-black mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {trainingMode 
                  ? trainingMode.replace(/-/g, ' ').toUpperCase()
                  : `${gameMode.toUpperCase()} MODE`
                }
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                {trainingMode ? 'Specialized Training Scenario' : 'Elite FPS Training Environment'}
              </p>
              <p className="text-gray-400">
                Focus, aim, and dominate
              </p>
            </motion.div>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative inline-block px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 group hover:shadow-orange-500/50"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGameActive(true)}
            >
              <span className="relative z-10 flex items-center space-x-4">
                <span>🎯</span>
                <span>BEGIN TRAINING</span>
                <span>→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-gray-500"
            >
              Press ESC anytime to return to menu
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 