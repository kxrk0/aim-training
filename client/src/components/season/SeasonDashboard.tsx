import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSeasonStore, SeasonHelpers } from '@/stores/seasonStore'
import { useAuthStore } from '@/stores/authStore'
import type { SeasonReward, SeasonChallenge, SeasonTier } from '@/stores/seasonStore'
import {
  FaCrown, FaTrophy, FaStar, FaGift, FaClock, FaLock, FaUnlock,
  FaCheckCircle, FaFire, FaGem, FaBolt, FaCalendarAlt, FaChartLine,
      FaPlay, FaAward, FaRocket, FaGamepad, FaHeart, FaEye, FaCoins
} from 'react-icons/fa'

export function SeasonDashboard() {
  const {
    currentSeason,
    userProgress,
    seasonLeaderboard,
    isLoading,
    error,
    selectedRewardTier,
    showRewardPreview,
    purchasePremiumPass,
    claimReward,
    completeChallenge,
    fetchUserProgress,
    fetchSeasonLeaderboard,
    calculateLevelProgress,
    calculateRankFromPoints,
    getAvailableChallenges,
    getRewardsForLevel,
    isRewardUnlocked,
    setSelectedRewardTier,
    setShowRewardPreview
  } = useSeasonStore()

  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'pass' | 'challenges' | 'leaderboard' | 'rewards'>('pass')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id)
      fetchSeasonLeaderboard()
    }
  }, [user])

  const handlePurchasePremium = async () => {
    if (!user) return
    try {
      await purchasePremiumPass(user.id)
      setShowPurchaseModal(false)
    } catch (error) {
      console.error('Failed to purchase premium pass:', error)
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    if (!user) return
    try {
      await claimReward(user.id, rewardId)
    } catch (error) {
      console.error('Failed to claim reward:', error)
    }
  }

  // Calculate progress percentages
  const levelProgress = userProgress ? calculateLevelProgress(userProgress.totalSeasonXP) : null
  const currentRank = userProgress ? calculateRankFromPoints(userProgress.rankPoints) : null
  const availableChallenges = user ? getAvailableChallenges(user.id) : []
  
  const tabs = [
    { id: 'pass', name: 'Season Pass', icon: <FaTrophy /> },
    { id: 'challenges', name: 'Challenges', icon: <FaBolt /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <FaCrown /> },
    { id: 'rewards', name: 'Rewards', icon: <FaGift /> }
  ]

  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-600 rounded-lg p-6 text-red-400">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!currentSeason) {
    return (
      <div className="text-center py-12">
        <FaClock className="text-6xl text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Active Season</h3>
        <p className="text-gray-400">Season information will be available when a season is active</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Season Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
            <FaCrown className="text-yellow-400" />
            <span style={{ color: currentSeason.themeColor }}>{currentSeason.name}</span>
          </h1>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            S{currentSeason.seasonNumber}
          </div>
        </div>
        <p className="text-gray-400 mb-4">{currentSeason.description}</p>
        
        {/* Season Timer */}
        <div className="inline-flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2">
          <FaClock className="text-yellow-400" />
          <span className="text-white font-medium">
            {SeasonHelpers.formatTimeRemaining(currentSeason.endDate)} remaining
          </span>
        </div>
      </div>

      {/* User Progress Overview */}
      {userProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level Progress */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Level</span>
              <span className="text-white font-bold text-xl">{userProgress.currentLevel}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${levelProgress ? (levelProgress.currentLevelXP / levelProgress.nextLevelXP) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="text-xs text-gray-400">
              {levelProgress ? `${levelProgress.currentLevelXP}/${levelProgress.nextLevelXP} XP` : '0/1000 XP'}
            </div>
          </div>

          {/* Current Rank */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <div className="text-3xl mb-1" style={{ color: currentRank?.color }}>
                {currentRank?.icon}
              </div>
              <div className="text-white font-bold">{currentRank?.name || 'Unranked'}</div>
              <div className="text-gray-400 text-sm">{userProgress.rankPoints} points</div>
            </div>
          </div>

          {/* Season Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userProgress.wins}</div>
              <div className="text-gray-400 text-sm">Wins</div>
              <div className="text-xs text-gray-500">
                {userProgress.gamesPlayed > 0 ? Math.round((userProgress.wins / userProgress.gamesPlayed) * 100) : 0}% WR
              </div>
            </div>
          </div>

          {/* Premium Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              {userProgress.hasPremiumPass ? (
                <>
                  <FaCrown className="text-yellow-400 text-2xl mx-auto mb-1" />
                  <div className="text-yellow-400 font-bold">Premium</div>
                  <div className="text-gray-400 text-sm">Active</div>
                </>
              ) : (
                <>
                  <FaLock className="text-gray-500 text-2xl mx-auto mb-1" />
                  <div className="text-gray-400 font-bold">Free</div>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
                  >
                    Upgrade
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Season Pass Tab */}
            {activeTab === 'pass' && (
              <motion.div
                key="pass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Tier Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <button
                      onClick={() => setSelectedRewardTier('free')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        selectedRewardTier === 'free'
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Free Pass
                    </button>
                    <button
                      onClick={() => setSelectedRewardTier('premium')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        selectedRewardTier === 'premium'
                          ? 'bg-yellow-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FaCrown className="inline mr-1" />
                      Premium Pass
                    </button>
                  </div>
                </div>

                {/* Rewards Track */}
                <div className="relative">
                  <div className="absolute left-0 top-8 w-full h-0.5 bg-gray-700"></div>
                  <div 
                    className="absolute left-0 top-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                    style={{ 
                      width: userProgress ? `${Math.min(100, (userProgress.currentLevel / currentSeason.maxLevel) * 100)}%` : '0%' 
                    }}
                  ></div>
                  
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                    {Array.from({ length: Math.min(20, currentSeason.maxLevel) }, (_, i) => {
                      const level = i + 1
                      const rewards = getRewardsForLevel(level, selectedRewardTier)
                      const reward = rewards[0] // Take first reward for this level
                      const isUnlocked = userProgress ? userProgress.currentLevel >= level : false
                      const isClaimed = reward && userProgress ? userProgress.claimedRewards.includes(reward.id) : false
                      
                      return (
                        <RewardNode
                          key={level}
                          level={level}
                          reward={reward}
                          isUnlocked={isUnlocked}
                          isClaimed={isClaimed}
                          onClaim={reward ? () => handleClaimReward(reward.id) : undefined}
                          onPreview={reward ? () => setShowRewardPreview(reward) : undefined}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Premium Upgrade CTA */}
                {!userProgress?.hasPremiumPass && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <FaCrown className="text-yellow-400 text-4xl mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h3>
                    <p className="text-gray-400 mb-4">
                      Unlock exclusive rewards, challenges, and {currentSeason.premiumBenefits.xpBoost}% XP boost
                    </p>
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all"
                    >
                      Upgrade for {currentSeason.premiumCost} Points
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Challenge Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Daily Challenges */}
                  <ChallengeSection
                    title="Daily Challenges"
                    icon={<FaClock className="text-blue-400" />}
                    challenges={availableChallenges.filter(c => c.type === 'daily')}
                    onComplete={completeChallenge}
                    userId={user?.id}
                  />

                  {/* Weekly Challenges */}
                  <ChallengeSection
                    title="Weekly Challenges"
                    icon={<FaCalendarAlt className="text-green-400" />}
                    challenges={availableChallenges.filter(c => c.type === 'weekly')}
                    onComplete={completeChallenge}
                    userId={user?.id}
                  />

                  {/* Seasonal Challenges */}
                  <ChallengeSection
                    title="Seasonal Challenges"
                    icon={<FaTrophy className="text-yellow-400" />}
                    challenges={availableChallenges.filter(c => c.type === 'seasonal')}
                    onComplete={completeChallenge}
                    userId={user?.id}
                  />
                </div>

                {/* Challenge Stats */}
                {userProgress && (
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Challenge Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{userProgress.dailyChallengeStreak}</div>
                        <div className="text-gray-400">Daily Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{userProgress.weeklyChallengesCompleted}</div>
                        <div className="text-gray-400">Weekly Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{userProgress.completedChallenges.length}</div>
                        <div className="text-gray-400">Total Completed</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Season Leaderboard</h3>
                  <p className="text-gray-400">Leaderboard rankings will be available soon!</p>
                </div>
              </motion.div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <FaGift className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Reward Gallery</h3>
                  <p className="text-gray-400">View all season rewards and their preview here!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-600"
            >
              <div className="text-center">
                <FaCrown className="text-yellow-400 text-4xl mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Premium Season Pass</h3>
                <p className="text-gray-400 mb-6">
                  Unlock exclusive rewards and get {currentSeason.premiumBenefits.xpBoost}% XP boost
                </p>
                
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {currentSeason.premiumCost} Points
                  </div>
                  <div className="text-gray-400 text-sm">One-time purchase</div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchasePremium}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-all"
                  >
                    {isLoading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Preview Modal */}
      <AnimatePresence>
        {showRewardPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRewardPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`text-4xl mb-4 ${SeasonHelpers.getRarityColor(showRewardPreview.rarity)}`}>
                  {showRewardPreview.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{showRewardPreview.name}</h3>
                <p className="text-gray-400 mb-4">{showRewardPreview.description}</p>
                
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  SeasonHelpers.getRarityColor(showRewardPreview.rarity)
                } ${SeasonHelpers.getRarityBorder(showRewardPreview.rarity)} border`}>
                  {showRewardPreview.rarity.toUpperCase()}
                </div>

                <button
                  onClick={() => setShowRewardPreview(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reward Node Component
function RewardNode({ 
  level, 
  reward, 
  isUnlocked, 
  isClaimed, 
  onClaim, 
  onPreview 
}: {
  level: number
  reward?: SeasonReward
  isUnlocked: boolean
  isClaimed: boolean
  onClaim?: () => void
  onPreview?: () => void
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-400 mb-2">{level}</div>
      <motion.button
        onClick={() => {
          if (isClaimed) return
          if (isUnlocked && onClaim) onClaim()
          else if (onPreview) onPreview()
        }}
        className={`relative w-16 h-16 rounded-lg border-2 transition-all ${
          isClaimed
            ? 'border-green-500 bg-green-500/20'
            : isUnlocked
            ? 'border-blue-500 bg-blue-500/20 hover:scale-110'
            : 'border-gray-600 bg-gray-700/30'
        }`}
        whileHover={isUnlocked && !isClaimed ? { scale: 1.1 } : {}}
        whileTap={isUnlocked && !isClaimed ? { scale: 0.95 } : {}}
      >
        {reward ? (
          <>
            <div className={`text-2xl ${
              isClaimed ? 'text-green-400' : isUnlocked ? 'text-white' : 'text-gray-500'
            }`}>
              {isClaimed ? <FaCheckCircle /> : reward.icon}
            </div>
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <FaLock className="text-gray-400" />
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-xl">?</div>
        )}
      </motion.button>
    </div>
  )
}

// Challenge Section Component
function ChallengeSection({ 
  title, 
  icon, 
  challenges, 
  onComplete, 
  userId 
}: {
  title: string
  icon: React.ReactNode
  challenges: SeasonChallenge[]
  onComplete: (userId: string, challengeId: string) => Promise<void>
  userId?: string
}) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </h4>
      
      {challenges.length > 0 ? (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onComplete={() => userId && onComplete(userId, challenge.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">No challenges available</div>
        </div>
      )}
    </div>
  )
}

// Challenge Card Component
function ChallengeCard({ 
  challenge, 
  onComplete 
}: {
  challenge: SeasonChallenge
  onComplete: () => void
}) {
  const progressPercentage = Math.min(100, (challenge.requirements.current / challenge.requirements.target) * 100)
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-orange-400'
      case 'extreme': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${
      challenge.isCompleted ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-800/30'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-white font-medium">{challenge.name}</h5>
          <p className="text-gray-400 text-sm">{challenge.description}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.toUpperCase()}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">
            {challenge.requirements.current}/{challenge.requirements.target}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              challenge.isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          +{challenge.rewards.seasonXP} Season XP
        </div>
        {challenge.isCompleted && (
          <div className="flex items-center text-green-400 text-sm">
            <FaCheckCircle className="mr-1" />
            Complete
          </div>
        )}
      </div>
    </div>
  )
} 