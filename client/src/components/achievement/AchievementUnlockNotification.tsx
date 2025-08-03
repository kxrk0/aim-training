import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAchievementStore } from '@/stores/achievementStore'
import { FaTrophy, FaStar, FaCrown, FaBolt, FaGem, FaFire, FaTimes, FaGift } from 'react-icons/fa'

export function AchievementUnlockNotification() {
  const {
    showUnlockNotification,
    recentUnlocks,
    recentRewards,
    dismissUnlockNotification
  } = useAchievementStore()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  
  const totalNotifications = recentUnlocks.length + recentRewards.length
  const hasNotifications = totalNotifications > 0
  
  // Auto-dismiss after showing all notifications
  useEffect(() => {
    if (!showUnlockNotification || !hasNotifications) return
    
    const timer = setTimeout(() => {
      if (currentIndex >= totalNotifications - 1) {
        dismissUnlockNotification()
        setCurrentIndex(0)
      } else {
        setCurrentIndex(prev => prev + 1)
      }
    }, 4000) // Show each notification for 4 seconds
    
    return () => clearTimeout(timer)
  }, [currentIndex, showUnlockNotification, hasNotifications, totalNotifications, dismissUnlockNotification])
  
  // Trigger celebration animation
  useEffect(() => {
    if (showUnlockNotification && hasNotifications) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [showUnlockNotification, hasNotifications])
  
  if (!showUnlockNotification || !hasNotifications) return null
  
  // Get current notification
  const allNotifications = [
    ...recentUnlocks.map(ua => ({ type: 'achievement' as const, data: ua })),
    ...recentRewards.map(ur => ({ type: 'reward' as const, data: ur }))
  ]
  
  const currentNotification = allNotifications[currentIndex]
  if (!currentNotification) return null
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training': return <FaTrophy />
      case 'accuracy': return <FaBolt />
      case 'streak': return <FaFire />
      case 'competition': return <FaCrown />
      case 'social': return <FaStar />
      case 'progression': return <FaGem />
      default: return <FaTrophy />
    }
  }
  
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'crosshair': return <FaBolt />
      case 'theme': return <FaStar />
      case 'title': return <FaCrown />
      case 'badge': return <FaGem />
      case 'emote': return <FaFire />
      default: return <FaGift />
    }
  }
  
  return (
    <>
      {/* Celebration Particles */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 400,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Main Notification */}
      <AnimatePresence>
        <motion.div
          key={`notification-${currentIndex}`}
          className="fixed top-20 right-4 z-[9998] w-96 max-w-[calc(100vw-2rem)]"
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.6 
          }}
        >
          <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-yellow-400/50 rounded-xl overflow-hidden shadow-2xl">
            {/* Animated Border Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-yellow-400/20"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="text-yellow-400 text-xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <FaTrophy />
                  </motion.div>
                  <h3 className="text-lg font-bold text-yellow-400">
                    {currentNotification.type === 'achievement' ? 'Achievement Unlocked!' : 'Reward Earned!'}
                  </h3>
                </div>
                
                <button
                  onClick={dismissUnlockNotification}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Notification Content */}
              {currentNotification.type === 'achievement' ? (
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    {getCategoryIcon(currentNotification.data.achievement.category)}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white mb-1">
                      {currentNotification.data.achievement.name}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {currentNotification.data.achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-medium">
                        {currentNotification.data.achievement.difficulty.toUpperCase()} • {currentNotification.data.achievement.category.toUpperCase()}
                      </span>
                      
                      {currentNotification.data.achievement.xpReward > 0 && (
                        <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded border border-blue-400/30">
                          <FaBolt className="text-xs text-blue-400" />
                          <span className="text-xs font-semibold text-blue-400">
                            +{currentNotification.data.achievement.xpReward} XP
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    {getRewardIcon(currentNotification.data.reward.type)}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white mb-1">
                      {currentNotification.data.reward.name}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {currentNotification.data.reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400 font-medium">
                        {currentNotification.data.reward.rarity.toUpperCase()} • {currentNotification.data.reward.type.toUpperCase()}
                      </span>
                      
                      <span className="text-xs text-green-400 font-semibold">
                        New {currentNotification.data.reward.category}!
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Progress Indicator */}
              {totalNotifications > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{currentIndex + 1} of {totalNotifications}</span>
                    <div className="flex space-x-1">
                      {[...Array(totalNotifications)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentIndex ? 'bg-yellow-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Auto-progress bar */}
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
} 