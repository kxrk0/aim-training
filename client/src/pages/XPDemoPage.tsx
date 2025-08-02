import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLevelStore } from '@/stores/levelStore'
import { LevelProgress } from '@/components/ui/LevelProgress'
import { FaGamepad, FaCircle, FaBolt, FaStar } from 'react-icons/fa'

export function XPDemoPage() {
  const levelStore = useLevelStore()
  const [isSimulating, setIsSimulating] = useState(false)

  const simulateGamePerformance = (type: 'poor' | 'average' | 'good' | 'perfect') => {
    if (isSimulating) return
    
    setIsSimulating(true)
    
    const performances = {
      poor: {
        score: 1200,
        accuracy: 65,
        reactionTime: 380,
        hits: 15,
        misses: 8,
        streak: 3,
        gameMode: 'precision',
        difficulty: 'easy',
        duration: 45,
        perfectShots: 1,
        consistency: 45
      },
      average: {
        score: 3500,
        accuracy: 78,
        reactionTime: 280,
        hits: 32,
        misses: 9,
        streak: 8,
        gameMode: 'precision',
        difficulty: 'medium',
        duration: 60,
        perfectShots: 4,
        consistency: 72
      },
      good: {
        score: 6800,
        accuracy: 89,
        reactionTime: 220,
        hits: 48,
        misses: 6,
        streak: 15,
        gameMode: 'tracking',
        difficulty: 'hard',
        duration: 75,
        perfectShots: 12,
        consistency: 85
      },
      perfect: {
        score: 9500,
        accuracy: 96,
        reactionTime: 180,
        hits: 67,
        misses: 3,
        streak: 25,
        gameMode: 'flick',
        difficulty: 'extreme',
        duration: 90,
        perfectShots: 22,
        consistency: 94
      }
    }

    const performance = performances[type]
    const xpAmount = levelStore.calculateXPFromPerformance(performance)
    
    // Simulate XP gain with animation delay
    setTimeout(() => {
      levelStore.gainXP(xpAmount, `${type.charAt(0).toUpperCase() + type.slice(1)} Performance!`, performance.gameMode)
      setIsSimulating(false)
    }, 500)
  }

  const resetProgress = () => {
    // This would reset all progress in a real scenario
    // For demo purposes, we'll just show current state
    alert(`Current Level: ${levelStore.currentLevel}\nTotal XP: ${levelStore.totalXP}\nDaily XP: ${Math.round(levelStore.dailyXPGained)}`)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Level System Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Test the XP and leveling system by simulating different game performances
          </p>
        </motion.div>

        {/* Level Progress Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Current Progress</h2>
          <LevelProgress size="large" showDetails={true} showXPGain={true} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-600/20 rounded-lg p-4 text-center border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{levelStore.currentLevel}</div>
              <div className="text-sm text-gray-400">Current Level</div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4 text-center border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{levelStore.totalXP.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
            <div className="bg-green-600/20 rounded-lg p-4 text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{Math.round(levelStore.dailyXPGained)}</div>
              <div className="text-sm text-gray-400">Daily XP</div>
            </div>
            <div className="bg-yellow-600/20 rounded-lg p-4 text-center border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">{levelStore.rewards.filter(r => r.unlocked).length}</div>
              <div className="text-sm text-gray-400">Rewards Unlocked</div>
            </div>
          </div>
        </motion.div>

        {/* Simulation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Simulate Game Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulateGamePerformance('poor')}
              disabled={isSimulating}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg p-4 text-center transition-all disabled:opacity-50"
            >
              <FaGamepad className="text-2xl text-red-400 mx-auto mb-2" />
              <div className="font-bold text-red-400">Poor</div>
              <div className="text-xs text-gray-400 mt-1">~50-100 XP</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulateGamePerformance('average')}
              disabled={isSimulating}
              className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg p-4 text-center transition-all disabled:opacity-50"
            >
              <FaCircle className="text-2xl text-yellow-400 mx-auto mb-2" />
              <div className="font-bold text-yellow-400">Average</div>
              <div className="text-xs text-gray-400 mt-1">~150-250 XP</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulateGamePerformance('good')}
              disabled={isSimulating}
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-4 text-center transition-all disabled:opacity-50"
            >
              <FaBolt className="text-2xl text-green-400 mx-auto mb-2" />
              <div className="font-bold text-green-400">Good</div>
              <div className="text-xs text-gray-400 mt-1">~350-500 XP</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => simulateGamePerformance('perfect')}
              disabled={isSimulating}
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-4 text-center transition-all disabled:opacity-50"
            >
              <FaStar className="text-2xl text-purple-400 mx-auto mb-2" />
              <div className="font-bold text-purple-400">Perfect</div>
              <div className="text-xs text-gray-400 mt-1">~600-1000 XP</div>
            </motion.button>
          </div>
          
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 text-cyan-400"
            >
              Calculating XP and awarding rewards...
            </motion.div>
          )}
        </motion.div>

        {/* Recent XP Gains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Recent XP Gains</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {levelStore.xpGainHistory.slice(0, 10).map((gain, index) => (
              <motion.div
                key={`${gain.timestamp.getTime()}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3 border border-gray-600/30"
              >
                <div>
                  <div className="font-bold text-green-400">+{Math.round(gain.amount)} XP</div>
                  <div className="text-sm text-gray-400">{gain.source}</div>
                  {gain.gameMode && (
                    <div className="text-xs text-blue-400 capitalize">{gain.gameMode} mode</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {gain.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
            {levelStore.xpGainHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No XP gains yet. Play some games to start earning XP!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}