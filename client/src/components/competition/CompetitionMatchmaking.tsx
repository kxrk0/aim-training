import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompetitionStore } from '@/stores/competitionStore'
import type { GameMode } from '../../../../shared/types'

export function CompetitionMatchmaking() {
  const {
    currentMatch,
    isInCompetition,
    isSearching,
    searchStartTime,
    estimatedWaitTime,
    opponentFound,
    findMatch,
    acceptMatch,
    cancelSearch,
    setReady
  } = useCompetitionStore()

  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('precision')
  const [selectedRankRange, setSelectedRankRange] = useState('similar')
  const [searchTime, setSearchTime] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse tracking and search timer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching && searchStartTime) {
      interval = setInterval(() => {
        setSearchTime(Math.floor((Date.now() - searchStartTime) / 1000))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSearching, searchStartTime])

  const gameModes = [
    { 
      id: 'precision', 
      name: 'Precision', 
      icon: '🎯', 
      description: 'Ultimate accuracy test with static targets',
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Medium',
      avgTime: '45s'
    },
    { 
      id: 'speed', 
      name: 'Speed', 
      icon: '⚡', 
      description: 'Lightning-fast reaction time challenge',
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Hard',
      avgTime: '30s'
    },
    { 
      id: 'tracking', 
      name: 'Tracking', 
      icon: '🎪', 
      description: 'Smooth target tracking and prediction',
      color: 'from-green-500 to-emerald-500',
      difficulty: 'Hard',
      avgTime: '60s'
    },
    { 
      id: 'flick', 
      name: 'Flick', 
      icon: '💨', 
      description: 'Explosive flick shots to distant targets',
      color: 'from-purple-500 to-pink-500',
      difficulty: 'Expert',
      avgTime: '40s'
    }
  ]

  const rankRanges = [
    { id: 'any', name: 'Any Rank', description: 'Match with any skill level', icon: '🌍' },
    { id: 'similar', name: 'Similar Rank', description: 'Match within ±200 ELO', icon: '⚖️' },
    { id: 'higher', name: 'Higher Rank', description: 'Challenge stronger players', icon: '⬆️' },
    { id: 'lower', name: 'Lower Rank', description: 'Mentor newer players', icon: '⬇️' }
  ]

  const handleFindMatch = () => {
    findMatch(selectedGameMode)
  }

  const handleAcceptMatch = () => {
    if (currentMatch) {
      acceptMatch(currentMatch.id)
      setReady(true)
    }
  }

  // Active Match View
  if (currentMatch && isInCompetition) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20"></div>
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full"
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

        <div className="relative min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 w-full max-w-4xl border border-red-500/20 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1 
                className="text-4xl md:text-5xl font-black mb-4"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ⚔️ ELITE BATTLE
              </motion.h1>
              <p className="text-xl text-gray-300">
                {currentMatch.gameSettings.gameMode.toUpperCase()} • {currentMatch.gameSettings.duration}s • ELO at stake
              </p>
            </div>

            {/* Players Arena */}
            <div className="grid grid-cols-3 gap-8 items-center mb-8">
              {/* Player 1 */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative mb-6">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                    animate={{ 
                      boxShadow: currentMatch.player1.isReady ? 
                        ['0 0 20px rgba(59, 130, 246, 0.5)', '0 0 40px rgba(59, 130, 246, 0.8)', '0 0 20px rgba(59, 130, 246, 0.5)'] :
                        ['0 0 10px rgba(75, 85, 99, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-3xl font-bold text-white">
                      {currentMatch.player1.username.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                  {currentMatch.player1.isReady && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentMatch.player1.username}
                </h3>
                <div className="space-y-2">
                  <p className="text-blue-400 font-semibold">
                    ELO: {currentMatch.player1.eloRating}
                  </p>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    currentMatch.player1.isReady 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      currentMatch.player1.isReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                    }`}></div>
                    <span>{currentMatch.player1.isReady ? 'Ready' : 'Preparing'}</span>
                  </div>
                </div>
              </motion.div>

              {/* VS Arena */}
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative mb-4"
                >
                  <div className="text-6xl font-black bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                    VS
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-xl"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="space-y-2">
                  <div className={`text-lg font-bold ${
                    currentMatch.status === 'waiting' ? 'text-yellow-400' :
                    currentMatch.status === 'countdown' ? 'text-orange-400' :
                    currentMatch.status === 'active' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {currentMatch.status === 'waiting' && '⏳ Waiting'}
                    {currentMatch.status === 'countdown' && '🚀 Starting'}
                    {currentMatch.status === 'active' && '🔥 LIVE'}
                  </div>
                  <div className="text-sm text-gray-400">Competitive Match</div>
                </div>
              </div>

              {/* Player 2 */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative mb-6">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                    animate={{ 
                      boxShadow: currentMatch.player2.isReady ? 
                        ['0 0 20px rgba(239, 68, 68, 0.5)', '0 0 40px rgba(239, 68, 68, 0.8)', '0 0 20px rgba(239, 68, 68, 0.5)'] :
                        ['0 0 10px rgba(75, 85, 99, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-3xl font-bold text-white">
                      {currentMatch.player2.username.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                  {currentMatch.player2.isReady && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentMatch.player2.username}
                </h3>
                <div className="space-y-2">
                  <p className="text-red-400 font-semibold">
                    ELO: {currentMatch.player2.eloRating}
                  </p>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    currentMatch.player2.isReady 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      currentMatch.player2.isReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                    }`}></div>
                    <span>{currentMatch.player2.isReady ? 'Ready' : 'Preparing'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Match Actions */}
            <div className="text-center space-y-6">
              {currentMatch.status === 'waiting' && (
                <motion.button
                  onClick={handleAcceptMatch}
                  className="relative inline-block px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl shadow-2xl transition-all duration-300 group hover:shadow-red-500/50"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center space-x-4">
                    <span>⚔️</span>
                    <span>ACCEPT CHALLENGE</span>
                    <span>🔥</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              )}

              {currentMatch.status === 'countdown' && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <motion.div 
                    className="text-8xl font-black mb-4"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0] 
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🚀
                  </motion.div>
                  <p className="text-3xl font-bold text-white mb-2">GET READY!</p>
                  <p className="text-xl text-gray-300">Elite battle starting in moments...</p>
                </motion.div>
              )}

              {currentMatch.status === 'active' && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <motion.div 
                    className="text-6xl font-bold text-red-400 mb-4"
                    animate={{ 
                      textShadow: [
                        '0 0 20px rgba(239, 68, 68, 0.5)', 
                        '0 0 40px rgba(239, 68, 68, 0.8)', 
                        '0 0 20px rgba(239, 68, 68, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔥 BATTLE ACTIVE
                  </motion.div>
                  <p className="text-2xl font-bold text-white">Competition in progress!</p>
                  <p className="text-gray-300">Show your elite skills!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main Competition Page
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full"
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

      {/* Interactive Cursor Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-red-500/10 to-purple-500/10 blur-3xl pointer-events-none"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-6 leading-none"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #8b5cf6, #ec4899)',
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
            ⚔️ ELITE ARENA
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl font-bold text-gray-300 mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
              1v1 COMPETITIVE BATTLEGROUND
            </span>
          </motion.div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Challenge elite players in intense head-to-head battles. Climb the ranks, earn ELO, and prove your aim supremacy.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Game Mode Selection */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold text-center text-white mb-8">
                  🎯 Choose Your Battlefield
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gameModes.map((mode, index) => (
                    <motion.button
                      key={mode.id}
                      onClick={() => setSelectedGameMode(mode.id as GameMode)}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: 0.3 + index * 0.1, 
                        duration: 0.6,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -10,
                      }}
                      className={`group relative p-6 h-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border transition-all duration-500 ${
                        selectedGameMode === mode.id
                          ? 'border-red-500/50 shadow-2xl shadow-red-500/20'
                          : 'border-gray-700/50 hover:border-red-500/30'
                      }`}
                    >
                      {/* Glowing border effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur ${
                        selectedGameMode === mode.id ? 'opacity-20' : ''
                      }`}></div>
                      
                      {/* Icon */}
                      <motion.div 
                        className="text-5xl mb-4 group-hover:scale-110 transition-all duration-500"
                        whileHover={{ rotateY: 180 }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {mode.icon}
                      </motion.div>
                      
                      {/* Title */}
                      <h4 className={`text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:${mode.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 ${
                        selectedGameMode === mode.id ? `bg-gradient-to-r ${mode.color} bg-clip-text text-transparent` : ''
                      }`}>
                        {mode.name}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500 text-sm leading-relaxed mb-4">
                        {mode.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                          <div className="text-gray-400">Difficulty</div>
                          <div className={`font-bold ${
                            mode.difficulty === 'Medium' ? 'text-yellow-400' :
                            mode.difficulty === 'Hard' ? 'text-orange-400' :
                            'text-red-400'
                          }`}>{mode.difficulty}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                          <div className="text-gray-400">Avg Time</div>
                          <div className="text-blue-400 font-bold">{mode.avgTime}</div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selectedGameMode === mode.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-xs">✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Rank Range Selection */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-2xl font-bold text-center text-white mb-6">
                  🎖️ Opponent Preference
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {rankRanges.map((range) => (
                    <motion.button
                      key={range.id}
                      onClick={() => setSelectedRankRange(range.id)}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        selectedRankRange === range.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-purple-500/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{range.icon}</div>
                      <div className="font-semibold mb-1">{range.name}</div>
                      <div className="text-xs text-gray-400">{range.description}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Find Match Button */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <motion.button
                  onClick={handleFindMatch}
                  className="relative inline-block px-16 py-6 text-3xl font-bold text-white bg-gradient-to-r from-red-600 to-purple-600 rounded-3xl shadow-2xl transition-all duration-300 group hover:shadow-red-500/50"
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center space-x-4">
                    <span>🔥</span>
                    <span>FIND WORTHY OPPONENT</span>
                    <span>⚔️</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
                <p className="text-gray-400 mt-4 text-lg">
                  Mode: <span className="text-red-400 font-bold">{selectedGameMode.toUpperCase()}</span> • 
                  Preference: <span className="text-purple-400 font-bold">{rankRanges.find(r => r.id === selectedRankRange)?.name}</span>
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 max-w-2xl mx-auto"
            >
              {/* Searching Animation */}
              <motion.div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-8 border-red-500 border-t-transparent rounded-full mx-auto"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 w-24 h-24 border-4 border-purple-500 border-b-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span 
                    className="text-4xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚔️
                  </motion.span>
                </div>
              </motion.div>

              {/* Search Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
              >
                <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  🔍 Hunting Elite Opponents...
                </h3>
                <p className="text-xl text-gray-300 mb-6">
                  Scanning the battlefield for worthy adversaries
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{searchTime}s</div>
                    <div className="text-gray-400">Search Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{estimatedWaitTime}s</div>
                    <div className="text-gray-400">Est. Wait</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{selectedGameMode.toUpperCase()}</div>
                    <div className="text-gray-400">Mode</div>
                  </div>
                </div>

                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-yellow-400 font-medium"
                >
                  ⚡ Matchmaking in progress... Elite players preferred
                </motion.div>
              </motion.div>

              {/* Cancel Button */}
              <motion.button
                onClick={cancelSearch}
                className="px-8 py-3 bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🛑 Cancel Search
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Competition Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          <h4 className="text-2xl font-bold text-center text-white mb-8 flex items-center justify-center">
            <span className="mr-3">🏆</span>
            Elite Competition System
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎯', title: 'Skill-Based Matching', desc: 'ELO-based matchmaking system' },
              { icon: '⚡', title: 'Real-Time Battles', desc: 'Live competitive gameplay' },
              { icon: '🏅', title: 'Ranking System', desc: 'Climb the elite leaderboards' },
              { icon: '🔥', title: 'Instant Results', desc: 'Immediate ELO gain/loss' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="text-center group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h5 className="text-white font-bold mb-2">{item.title}</h5>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}