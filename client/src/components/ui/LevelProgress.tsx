import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLevelStore } from '@/stores/levelStore'
import { FaStar, FaTrophy, FaCrown, FaFire, FaBolt, FaGem } from 'react-icons/fa'

interface LevelProgressProps {
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  showXPGain?: boolean
  className?: string
}

export function LevelProgress({ 
  size = 'medium', 
  showDetails = true, 
  showXPGain = false,
  className = '' 
}: LevelProgressProps) {
  const {
    currentLevel,
    currentXP,
    xpToNextLevel,
    totalXP,
    getProgressPercentage,
    getTitleForLevel,
    getNextMilestone,
    xpGainHistory,
    levelUpAnimations,
    claimReward
  } = useLevelStore()

  const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [currentLevelUp, setCurrentLevelUp] = useState<number | null>(null)
  const [recentXPGains, setRecentXPGains] = useState<typeof xpGainHistory>([])

  const progressPercentage = getProgressPercentage()
  const playerTitle = getTitleForLevel(currentLevel)
  const nextMilestone = getNextMilestone()

  // Handle level up animations
  useEffect(() => {
    if (levelUpAnimations.length > 0 && !showLevelUpModal) {
      setCurrentLevelUp(levelUpAnimations[0])
      setShowLevelUpModal(true)
    }
  }, [levelUpAnimations, showLevelUpModal])

  // Handle recent XP gains animation
  useEffect(() => {
    if (showXPGain && xpGainHistory.length > recentXPGains.length) {
      const newGains = xpGainHistory.slice(0, xpGainHistory.length - recentXPGains.length)
      setRecentXPGains(xpGainHistory.slice(0, 5)) // Show last 5 gains
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setRecentXPGains([])
      }, 3000)
    }
  }, [xpGainHistory, showXPGain, recentXPGains.length])

  const sizeClasses = {
    small: {
      container: 'text-xs',
      bar: 'h-2',
      level: 'text-sm font-bold',
      title: 'text-xs'
    },
    medium: {
      container: 'text-sm',
      bar: 'h-3',
      level: 'text-lg font-bold',
      title: 'text-sm'
    },
    large: {
      container: 'text-base',
      bar: 'h-4',
      level: 'text-xl font-bold',
      title: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  const getLevelIcon = (level: number) => {
    if (level >= 90) return <FaCrown className="text-yellow-400" />
    if (level >= 75) return <FaGem className="text-purple-400" />
    if (level >= 50) return <FaBolt className="text-blue-400" />
    if (level >= 25) return <FaFire className="text-orange-400" />
    if (level >= 10) return <FaTrophy className="text-green-400" />
    return <FaStar className="text-gray-400" />
  }

  const handleClaimReward = () => {
    if (currentLevelUp) {
      claimReward(currentLevelUp)
      setShowLevelUpModal(false)
      setCurrentLevelUp(null)
    }
  }

  return (
    <>
      <div className={`${currentSize.container} ${className}`}>
        {/* Level and Title */}
        <div className="flex items-center space-x-2 mb-2">
          {getLevelIcon(currentLevel)}
          <div>
            <div className={`${currentSize.level} text-white flex items-center space-x-1`}>
              <span>LVL {currentLevel}</span>
              {currentLevel >= 100 && (
                <span className="text-yellow-400 animate-pulse">MAX</span>
              )}
            </div>
            {showDetails && (
              <div className={`${currentSize.title} text-gray-400`}>
                {playerTitle}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {currentLevel < 100 && (
          <div className="mb-2">
            <div className={`${currentSize.bar} bg-gray-700 rounded-full overflow-hidden`}>
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur-sm animate-pulse"></div>
              </motion.div>
            </div>
            
            {showDetails && (
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{currentXP.toLocaleString()} XP</span>
                <span>{(currentXP + xpToNextLevel).toLocaleString()} XP</span>
              </div>
            )}
          </div>
        )}

        {/* Next Milestone */}
        {showDetails && nextMilestone && (
          <div className="text-xs text-gray-500">
            Next: <span className="text-cyan-400">{nextMilestone.reward.name}</span> at LVL {nextMilestone.level}
          </div>
        )}

        {/* Total XP */}
        {showDetails && size === 'large' && (
          <div className="text-xs text-gray-500 mt-1">
            Total XP: {totalXP.toLocaleString()}
          </div>
        )}
      </div>

      {/* Recent XP Gains */}
      <AnimatePresence>
        {showXPGain && recentXPGains.length > 0 && (
          <div className="fixed top-20 right-4 z-50 space-y-1">
            {recentXPGains.map((gain, index) => (
              <motion.div
                key={`${gain.timestamp.getTime()}-${index}`}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
              >
                <div className="flex items-center space-x-1">
                  <span>+{Math.round(gain.amount)} XP</span>
                  {gain.multiplier && gain.multiplier > 1 && (
                    <span className="text-yellow-300 text-xs">×{gain.multiplier.toFixed(1)}</span>
                  )}
                </div>
                <div className="text-xs opacity-80">{gain.source}</div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUpModal && currentLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLevelUpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Celebration Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: [0, -100],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  LEVEL UP!
                </h2>
                
                <div className="text-xl text-white mb-4">
                  You've reached <span className="text-yellow-400 font-bold">Level {currentLevelUp}</span>!
                </div>

                <div className="text-gray-300 mb-6">
                  {getTitleForLevel(currentLevelUp)}
                </div>

                {/* Show unlocked rewards */}
                {useLevelStore.getState().rewards
                  .filter(r => r.level === currentLevelUp)
                  .map((reward) => (
                    <motion.div
                      key={reward.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-4 mb-4"
                    >
                      <div className="text-2xl mb-2">{reward.icon}</div>
                      <div className="text-yellow-400 font-bold">{reward.name}</div>
                      <div className="text-sm text-gray-400">{reward.description}</div>
                    </motion.div>
                  ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaimReward}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-orange-400 transition-all"
                >
                  Claim Rewards
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}