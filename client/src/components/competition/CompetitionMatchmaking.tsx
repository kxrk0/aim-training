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
  const [searchTime, setSearchTime] = useState(0)

  // Update search timer
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
    { id: 'precision', name: 'Precision', icon: '🎯', description: 'Accuracy focused training' },
    { id: 'speed', name: 'Speed', icon: '⚡', description: 'Fast reaction training' },
    { id: 'tracking', name: 'Tracking', icon: '🎪', description: 'Moving target training' },
    { id: 'flick', name: 'Flick', icon: '💨', description: 'Quick movement training' }
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

  if (currentMatch && isInCompetition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl border border-gaming-primary/20"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gaming-primary mb-2">
              ⚔️ Competition Match
            </h1>
            <p className="text-gray-400">
              {currentMatch.gameSettings.gameMode.toUpperCase()} • {currentMatch.gameSettings.duration}s
            </p>
          </div>

          {/* Players */}
          <div className="grid grid-cols-3 gap-8 items-center mb-8">
            {/* Player 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gaming-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gaming-primary">
                  {currentMatch.player1.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {currentMatch.player1.username}
              </h3>
              <p className="text-sm text-gray-400">
                ELO: {currentMatch.player1.eloRating}
              </p>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs ${
                currentMatch.player1.isReady 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {currentMatch.player1.isReady ? 'Ready' : 'Not Ready'}
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gaming-primary mb-2">VS</div>
              <div className="text-sm text-gray-400">
                Status: {currentMatch.status}
              </div>
            </div>

            {/* Player 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gaming-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gaming-accent">
                  {currentMatch.player2.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {currentMatch.player2.username}
              </h3>
              <p className="text-sm text-gray-400">
                ELO: {currentMatch.player2.eloRating}
              </p>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs ${
                currentMatch.player2.isReady 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {currentMatch.player2.isReady ? 'Ready' : 'Not Ready'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            {currentMatch.status === 'waiting' && (
              <motion.button
                onClick={handleAcceptMatch}
                className="gaming-button px-8 py-3 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎯 Accept Match
              </motion.button>
            )}

            {currentMatch.status === 'countdown' && (
              <div className="text-center">
                <div className="text-6xl font-bold text-gaming-primary mb-4 animate-pulse">
                  🚀
                </div>
                <p className="text-xl text-white">Get Ready!</p>
                <p className="text-gray-400">Competition starting soon...</p>
              </div>
            )}

            {currentMatch.status === 'active' && (
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-4">
                  🔥 LIVE
                </div>
                <p className="text-xl text-white">Competition in progress!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl border border-gray-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gaming-primary mb-2">
            ⚔️ 1v1 Competition
          </h1>
          <p className="text-gray-400">
            Challenge other players in head-to-head aim training battles
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Game Mode Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Select Game Mode</h3>
                <div className="grid grid-cols-2 gap-4">
                  {gameModes.map((mode) => (
                    <motion.button
                      key={mode.id}
                      onClick={() => setSelectedGameMode(mode.id as GameMode)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedGameMode === mode.id
                          ? 'border-gaming-primary bg-gaming-primary/10 text-gaming-primary'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gaming-primary/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{mode.icon}</div>
                      <div className="font-semibold">{mode.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Find Match Button */}
              <motion.button
                onClick={handleFindMatch}
                className="w-full gaming-button py-4 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔍 Find Match
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              {/* Searching Animation */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-4 border-gaming-primary border-t-transparent rounded-full mx-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>

              {/* Search Info */}
              <div>
                <h3 className="text-xl font-bold text-gaming-primary mb-2">
                  Searching for Opponent...
                </h3>
                <p className="text-gray-400 mb-4">
                  Mode: {selectedGameMode.toUpperCase()}
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    Search Time: {searchTime}s
                  </div>
                  <div className="text-sm text-gray-400">
                    Estimated Wait: {estimatedWaitTime}s
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              <motion.button
                onClick={cancelSearch}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel Search
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it Works */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <h4 className="font-semibold text-white mb-2">How 1v1 Competition Works</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Choose your preferred game mode</li>
            <li>• Get matched with players of similar skill level</li>
            <li>• Compete head-to-head in real-time</li>
            <li>• Gain or lose ELO rating based on performance</li>
            <li>• Track your competitive progress and ranking</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
} 