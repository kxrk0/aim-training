import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Temporary CURRENT_SEASON definition (will be replaced by proper initialization)
const TEMP_CURRENT_SEASON: any = {
  id: 'season_1',
  name: 'Genesis Season',
  description: 'The first competitive season - prove your worth!',
  seasonNumber: 1,
  theme: 'genesis',
  themeColor: '#3b82f6',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  maxLevel: 100,
  xpPerLevel: 1000,
  ranks: [],
  rewards: [],
  challenges: [],
  premiumCost: 1000,
  premiumBenefits: {
    xpBoost: 50,
    exclusiveRewards: true,
    exclusiveChallenges: true,
    earlyAccess: true
  }
}

export type SeasonTier = 'free' | 'premium'
export type RewardType = 'xp' | 'points' | 'cosmetic' | 'title' | 'badge' | 'currency' | 'unlock'

export interface SeasonReward {
  id: string
  tier: SeasonTier
  level: number
  type: RewardType
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  icon: string
  value?: number
  cosmetic?: {
    type: 'crosshair' | 'trail' | 'avatar' | 'banner' | 'pose' | 'emote'
    previewUrl?: string
    color?: string
  }
  requirements?: {
    level?: number
    achievements?: string[]
    gameMode?: string
  }
  isUnlocked: boolean
  unlockedAt?: string
}

export interface SeasonRank {
  rank: number
  name: string
  icon: string
  color: string
  minPoints: number
  maxPoints: number
  rewards: {
    xp: number
    points: number
    special?: SeasonReward[]
  }
}

export interface SeasonChallenge {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'seasonal'
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  gameMode?: string
  requirements: {
    target: number
    current: number
    metric: 'games' | 'wins' | 'accuracy' | 'score' | 'streak' | 'time'
  }
  rewards: {
    xp: number
    seasonXP: number
    points?: number
    special?: SeasonReward[]
  }
  isCompleted: boolean
  completedAt?: string
  expiresAt?: string
}

export interface Season {
  id: string
  name: string
  description: string
  seasonNumber: number
  theme: string
  themeColor: string
  bannerUrl?: string
  
  startDate: string
  endDate: string
  isActive: boolean
  
  maxLevel: number
  xpPerLevel: number
  
  ranks: SeasonRank[]
  rewards: SeasonReward[]
  challenges: SeasonChallenge[]
  
  premiumCost: number
  premiumBenefits: {
    xpBoost: number // percentage
    exclusiveRewards: boolean
    exclusiveChallenges: boolean
    earlyAccess: boolean
  }
}

export interface UserSeasonProgress {
  userId: string
  seasonId: string
  
  // Level Progress
  currentLevel: number
  currentXP: number
  totalSeasonXP: number
  
  // Rank Progress
  currentRank: number
  rankPoints: number
  highestRank: number
  
  // Pass Status
  hasPremiumPass: boolean
  purchasedAt?: string
  
  // Rewards
  unlockedRewards: string[]
  claimedRewards: string[]
  
  // Challenges
  completedChallenges: string[]
  dailyChallengeStreak: number
  weeklyChallengesCompleted: number
  
  // Statistics
  gamesPlayed: number
  wins: number
  totalScore: number
  averageAccuracy: number
  
  lastUpdated: string
}

interface SeasonStore {
  // State
  currentSeason: Season | null
  userProgress: UserSeasonProgress | null
  allSeasons: Season[]
  seasonLeaderboard: any[]
  
  // UI State
  isLoading: boolean
  error: string | null
  selectedRewardTier: SeasonTier
  showRewardPreview: SeasonReward | null
  
  // Actions
  initializeSeason: () => void
  purchasePremiumPass: (userId: string) => Promise<void>
  claimReward: (userId: string, rewardId: string) => Promise<void>
  updateProgress: (userId: string, gameData: any) => Promise<void>
  completeChallenge: (userId: string, challengeId: string) => Promise<void>
  
  // Season Management
  startNewSeason: (season: Partial<Season>) => Promise<void>
  endCurrentSeason: () => Promise<void>
  resetSeasonProgress: (userId: string) => Promise<void>
  
  // Data fetching
  fetchSeasonData: () => Promise<void>
  fetchUserProgress: (userId: string) => Promise<void>
  fetchSeasonLeaderboard: () => Promise<void>
  
  // Utilities
  calculateLevelProgress: (xp: number) => { level: number; currentLevelXP: number; nextLevelXP: number }
  calculateRankFromPoints: (points: number) => SeasonRank | null
  getAvailableChallenges: (userId: string) => SeasonChallenge[]
  getRewardsForLevel: (level: number, tier: SeasonTier) => SeasonReward[]
  isRewardUnlocked: (userId: string, rewardId: string) => boolean
  
  // Setters
  setSelectedRewardTier: (tier: SeasonTier) => void
  setShowRewardPreview: (reward: SeasonReward | null) => void
  setError: (error: string | null) => void
}

export const useSeasonStore = create<SeasonStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSeason: TEMP_CURRENT_SEASON,
      userProgress: null,
      allSeasons: [TEMP_CURRENT_SEASON],
      seasonLeaderboard: [],
      
      // UI State
      isLoading: false,
      error: null,
      selectedRewardTier: 'free',
      showRewardPreview: null,

      // Actions
      initializeSeason: () => {
        set({ 
          currentSeason: TEMP_CURRENT_SEASON,
          allSeasons: [TEMP_CURRENT_SEASON],
          isLoading: false,
          error: null 
        })
      },

      purchasePremiumPass: async (userId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const userProgress = get().userProgress
          if (!userProgress) {
            throw new Error('User progress not found')
          }

          // TODO: Replace with actual payment processing
          // await api.purchasePremiumPass(userId, get().currentSeason?.id)
          
          const updatedProgress: UserSeasonProgress = {
            ...userProgress,
            hasPremiumPass: true,
            purchasedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }

          set({ 
            userProgress: updatedProgress,
            isLoading: false 
          })

          console.log('Premium pass purchased successfully!')
          
        } catch (error) {
          set({ error: `Failed to purchase premium pass: ${error}`, isLoading: false })
          throw error
        }
      },

      claimReward: async (userId: string, rewardId: string) => {
        try {
          set({ error: null })
          
          const userProgress = get().userProgress
          const currentSeason = get().currentSeason
          
          if (!userProgress || !currentSeason) {
            throw new Error('User progress or season not found')
          }

          const reward = currentSeason.rewards.find(r => r.id === rewardId)
          if (!reward) {
            throw new Error('Reward not found')
          }

          // Check if reward is unlocked
          if (!get().isRewardUnlocked(userId, rewardId)) {
            throw new Error('Reward not unlocked yet')
          }

          // Check if already claimed
          if (userProgress.claimedRewards.includes(rewardId)) {
            throw new Error('Reward already claimed')
          }

          // TODO: Replace with actual API call
          // await api.claimSeasonReward(userId, rewardId)
          
          const updatedProgress: UserSeasonProgress = {
            ...userProgress,
            claimedRewards: [...userProgress.claimedRewards, rewardId],
            lastUpdated: new Date().toISOString()
          }

          set({ userProgress: updatedProgress })
          
          console.log(`Reward claimed: ${reward.name}`)
          
        } catch (error) {
          set({ error: `Failed to claim reward: ${error}` })
          throw error
        }
      },

      updateProgress: async (userId: string, gameData: any) => {
        try {
          set({ error: null })
          
          const userProgress = get().userProgress
          if (!userProgress) return

          const xpGained = calculateXPGain(gameData)
          const seasonXPGained = calculateSeasonXPGain(gameData, userProgress.hasPremiumPass)
          const rankPointsGained = calculateRankPoints(gameData)
          
          const newTotalXP = userProgress.totalSeasonXP + seasonXPGained
          const levelProgress = get().calculateLevelProgress(newTotalXP)
          
          const newRankPoints = userProgress.rankPoints + rankPointsGained
          const newRank = get().calculateRankFromPoints(newRankPoints)

          const updatedProgress: UserSeasonProgress = {
            ...userProgress,
            currentLevel: levelProgress.level,
            currentXP: levelProgress.currentLevelXP,
            totalSeasonXP: newTotalXP,
            rankPoints: newRankPoints,
            currentRank: newRank?.rank || userProgress.currentRank,
            highestRank: Math.max(userProgress.highestRank, newRank?.rank || userProgress.currentRank),
            gamesPlayed: userProgress.gamesPlayed + 1,
            wins: gameData.result === 'win' ? userProgress.wins + 1 : userProgress.wins,
            totalScore: userProgress.totalScore + (gameData.score || 0),
            averageAccuracy: (userProgress.averageAccuracy + gameData.accuracy) / 2,
            lastUpdated: new Date().toISOString()
          }

          set({ userProgress: updatedProgress })
          
          // TODO: Replace with actual API call
          // await api.updateSeasonProgress(userId, updatedProgress)
          
        } catch (error) {
          set({ error: `Failed to update progress: ${error}` })
          throw error
        }
      },

      completeChallenge: async (userId: string, challengeId: string) => {
        try {
          set({ error: null })
          
          const userProgress = get().userProgress
          const currentSeason = get().currentSeason
          
          if (!userProgress || !currentSeason) return

          const challenge = currentSeason.challenges.find(c => c.id === challengeId)
          if (!challenge || challenge.isCompleted) return

          // Mark challenge as completed
          challenge.isCompleted = true
          challenge.completedAt = new Date().toISOString()

          // Update user progress
          const updatedProgress: UserSeasonProgress = {
            ...userProgress,
            completedChallenges: [...userProgress.completedChallenges, challengeId],
            totalSeasonXP: userProgress.totalSeasonXP + challenge.rewards.seasonXP,
            dailyChallengeStreak: challenge.type === 'daily' ? userProgress.dailyChallengeStreak + 1 : userProgress.dailyChallengeStreak,
            weeklyChallengesCompleted: challenge.type === 'weekly' ? userProgress.weeklyChallengesCompleted + 1 : userProgress.weeklyChallengesCompleted,
            lastUpdated: new Date().toISOString()
          }

          set({ userProgress: updatedProgress })
          
          console.log(`Challenge completed: ${challenge.name}`)
          
        } catch (error) {
          set({ error: `Failed to complete challenge: ${error}` })
          throw error
        }
      },

      startNewSeason: async (season: Partial<Season>) => {
        try {
          set({ isLoading: true, error: null })
          
          const newSeason: Season = {
            id: `season_${Date.now()}`,
            name: season.name || 'New Season',
            description: season.description || '',
            seasonNumber: (get().allSeasons.length || 0) + 1,
            theme: season.theme || 'default',
            themeColor: season.themeColor || '#3b82f6',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            isActive: true,
            maxLevel: 100,
            xpPerLevel: 1000,
            ranks: SEASON_RANKS,
            rewards: generateSeasonRewards(100),
            challenges: generateSeasonChallenges(),
            premiumCost: 1000,
            premiumBenefits: {
              xpBoost: 50,
              exclusiveRewards: true,
              exclusiveChallenges: true,
              earlyAccess: true
            }
          }

          // End current season
          await get().endCurrentSeason()
          
          set({ 
            currentSeason: newSeason,
            allSeasons: [...get().allSeasons, newSeason],
            isLoading: false 
          })
          
          // TODO: Replace with actual API call
          // await api.createSeason(newSeason)
          
        } catch (error) {
          set({ error: `Failed to start new season: ${error}`, isLoading: false })
          throw error
        }
      },

      endCurrentSeason: async () => {
        try {
          const currentSeason = get().currentSeason
          if (!currentSeason) return

          // Mark season as inactive
          currentSeason.isActive = false

          // TODO: Process end-of-season rewards
          // TODO: Reset rankings
          // TODO: Archive season data
          
          console.log(`Season ended: ${currentSeason.name}`)
          
        } catch (error) {
          set({ error: `Failed to end season: ${error}` })
          throw error
        }
      },

      resetSeasonProgress: async (userId: string) => {
        try {
          const currentSeason = get().currentSeason
          if (!currentSeason) return

          const initialProgress: UserSeasonProgress = {
            userId,
            seasonId: currentSeason.id,
            currentLevel: 1,
            currentXP: 0,
            totalSeasonXP: 0,
            currentRank: 1,
            rankPoints: 0,
            highestRank: 1,
            hasPremiumPass: false,
            unlockedRewards: [],
            claimedRewards: [],
            completedChallenges: [],
            dailyChallengeStreak: 0,
            weeklyChallengesCompleted: 0,
            gamesPlayed: 0,
            wins: 0,
            totalScore: 0,
            averageAccuracy: 0,
            lastUpdated: new Date().toISOString()
          }

          set({ userProgress: initialProgress })
          
        } catch (error) {
          set({ error: `Failed to reset progress: ${error}` })
          throw error
        }
      },

      fetchSeasonData: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const seasonData = await api.getCurrentSeason()
          
          set({ isLoading: false })
        } catch (error) {
          set({ error: `Failed to fetch season data: ${error}`, isLoading: false })
        }
      },

      fetchUserProgress: async (userId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const progress = await api.getUserSeasonProgress(userId)
          
          // Mock initial progress
          const currentSeason = get().currentSeason
          if (currentSeason) {
            await get().resetSeasonProgress(userId)
          }
          
          set({ isLoading: false })
        } catch (error) {
          set({ error: `Failed to fetch user progress: ${error}`, isLoading: false })
        }
      },

      fetchSeasonLeaderboard: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const leaderboard = await api.getSeasonLeaderboard()
          
          set({ seasonLeaderboard: [], isLoading: false })
        } catch (error) {
          set({ error: `Failed to fetch leaderboard: ${error}`, isLoading: false })
        }
      },

      // Utilities
      calculateLevelProgress: (xp: number) => {
        const xpPerLevel = get().currentSeason?.xpPerLevel || 1000
        const level = Math.floor(xp / xpPerLevel) + 1
        const currentLevelXP = xp % xpPerLevel
        const nextLevelXP = xpPerLevel
        
        return { level, currentLevelXP, nextLevelXP }
      },

      calculateRankFromPoints: (points: number) => {
        const ranks = get().currentSeason?.ranks || []
        return ranks.find(rank => points >= rank.minPoints && points <= rank.maxPoints) || ranks[0]
      },

      getAvailableChallenges: (userId: string) => {
        const currentSeason = get().currentSeason
        const userProgress = get().userProgress
        
        if (!currentSeason || !userProgress) return []
        
        return currentSeason.challenges.filter(challenge => {
          // Check if already completed
          if (challenge.isCompleted) return false
          
          // Check if expired
          if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) return false
          
          // Check premium requirement
          if (challenge.difficulty === 'extreme' && !userProgress.hasPremiumPass) return false
          
          return true
        })
      },

      getRewardsForLevel: (level: number, tier: SeasonTier) => {
        const currentSeason = get().currentSeason
        if (!currentSeason) return []
        
        return currentSeason.rewards.filter(reward => 
          reward.level <= level && reward.tier === tier
        )
      },

      isRewardUnlocked: (userId: string, rewardId: string) => {
        const userProgress = get().userProgress
        const currentSeason = get().currentSeason
        
        if (!userProgress || !currentSeason) return false
        
        const reward = currentSeason.rewards.find(r => r.id === rewardId)
        if (!reward) return false
        
        // Check level requirement
        if (userProgress.currentLevel < reward.level) return false
        
        // Check tier requirement
        if (reward.tier === 'premium' && !userProgress.hasPremiumPass) return false
        
        return true
      },

      // Setters
      setSelectedRewardTier: (tier) => set({ selectedRewardTier: tier }),
      setShowRewardPreview: (reward) => set({ showRewardPreview: reward }),
      setError: (error) => set({ error })
    }),
    {
      name: 'season-store',
      partialize: (state) => ({
        currentSeason: state.currentSeason,
        userProgress: state.userProgress,
        allSeasons: state.allSeasons
      })
    }
  )
)

// Helper functions
function calculateXPGain(gameData: any): number {
  const baseXP = 50
  const scoreMultiplier = Math.min(2, gameData.score / 1000)
  const accuracyBonus = gameData.accuracy > 80 ? 20 : 0
  const winBonus = gameData.result === 'win' ? 30 : 0
  
  return Math.round(baseXP * scoreMultiplier + accuracyBonus + winBonus)
}

function calculateSeasonXPGain(gameData: any, hasPremiumPass: boolean): number {
  const baseSeasonXP = calculateXPGain(gameData) * 0.5
  const premiumBonus = hasPremiumPass ? 1.5 : 1.0
  
  return Math.round(baseSeasonXP * premiumBonus)
}

function calculateRankPoints(gameData: any): number {
  const basePoints = gameData.result === 'win' ? 25 : -15
  const performanceMultiplier = gameData.accuracy / 100
  
  return Math.round(basePoints * performanceMultiplier)
}

function generateSeasonRewards(maxLevel: number): SeasonReward[] {
  const rewards: SeasonReward[] = []
  
  for (let level = 1; level <= maxLevel; level++) {
    // Free tier reward
    if (level % 2 === 0) {
      rewards.push({
        id: `free_${level}`,
        tier: 'free',
        level,
        type: level % 10 === 0 ? 'cosmetic' : 'xp',
        name: level % 10 === 0 ? `Level ${level} Badge` : `${level * 100} XP`,
        description: level % 10 === 0 ? `Exclusive badge for reaching level ${level}` : `Bonus experience points`,
        rarity: level % 10 === 0 ? 'rare' : 'common',
        icon: level % 10 === 0 ? '🏅' : '⭐',
        value: level % 10 === 0 ? undefined : level * 100,
        isUnlocked: false
      })
    }
    
    // Premium tier reward
    rewards.push({
      id: `premium_${level}`,
      tier: 'premium',
      level,
      type: level % 5 === 0 ? 'cosmetic' : level % 3 === 0 ? 'points' : 'xp',
      name: level % 5 === 0 ? `Premium Skin ${level}` : level % 3 === 0 ? `${level * 50} Points` : `${level * 150} XP`,
      description: level % 5 === 0 ? `Exclusive premium cosmetic` : level % 3 === 0 ? `Premium currency` : `Bonus experience`,
      rarity: level % 5 === 0 ? 'epic' : level % 3 === 0 ? 'rare' : 'common',
      icon: level % 5 === 0 ? '✨' : level % 3 === 0 ? '💎' : '⭐',
      value: level % 5 === 0 ? undefined : level % 3 === 0 ? level * 50 : level * 150,
      isUnlocked: false
    })
  }
  
  return rewards
}

function generateSeasonChallenges(): SeasonChallenge[] {
  return [
    // Daily Challenges
    {
      id: 'daily_games',
      name: 'Daily Grind',
      description: 'Play 3 games today',
      type: 'daily',
      difficulty: 'easy',
      requirements: {
        target: 3,
        current: 0,
        metric: 'games'
      },
      rewards: {
        xp: 100,
        seasonXP: 50
      },
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'daily_wins',
      name: 'Victory March',
      description: 'Win 2 games today',
      type: 'daily',
      difficulty: 'medium',
      requirements: {
        target: 2,
        current: 0,
        metric: 'wins'
      },
      rewards: {
        xp: 150,
        seasonXP: 75
      },
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    // Weekly Challenges
    {
      id: 'weekly_precision',
      name: 'Precision Master',
      description: 'Achieve 80%+ accuracy in 10 games this week',
      type: 'weekly',
      difficulty: 'hard',
      gameMode: 'precision',
      requirements: {
        target: 10,
        current: 0,
        metric: 'accuracy'
      },
      rewards: {
        xp: 500,
        seasonXP: 250,
        points: 100
      },
      isCompleted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Seasonal Challenges
    {
      id: 'seasonal_champion',
      name: 'Seasonal Champion',
      description: 'Win 100 games this season',
      type: 'seasonal',
      difficulty: 'extreme',
      requirements: {
        target: 100,
        current: 0,
        metric: 'wins'
      },
      rewards: {
        xp: 2000,
        seasonXP: 1000,
        points: 500
      },
      isCompleted: false
    }
  ]
}

// Season configurations
const SEASON_RANKS: SeasonRank[] = [
  {
    rank: 1,
    name: 'Novice',
    icon: '🥉',
    color: '#CD7F32',
    minPoints: 0,
    maxPoints: 499,
    rewards: { xp: 100, points: 50 }
  },
  {
    rank: 2,
    name: 'Apprentice',
    icon: '🥈',
    color: '#C0C0C0',
    minPoints: 500,
    maxPoints: 999,
    rewards: { xp: 200, points: 100 }
  },
  {
    rank: 3,
    name: 'Expert',
    icon: '🥇',
    color: '#FFD700',
    minPoints: 1000,
    maxPoints: 1999,
    rewards: { xp: 300, points: 150 }
  },
  {
    rank: 4,
    name: 'Master',
    icon: '💎',
    color: '#E5E4E2',
    minPoints: 2000,
    maxPoints: 2999,
    rewards: { xp: 500, points: 250 }
  },
  {
    rank: 5,
    name: 'Grandmaster',
    icon: '👑',
    color: '#FF6B35',
    minPoints: 3000,
    maxPoints: 99999,
    rewards: { xp: 1000, points: 500 }
  }
]

const CURRENT_SEASON: Season = {
  id: 'season_1',
  name: 'Genesis Season',
  description: 'The first competitive season - prove your worth!',
  seasonNumber: 1,
  theme: 'genesis',
  themeColor: '#3b82f6',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  maxLevel: 100,
  xpPerLevel: 1000,
  ranks: SEASON_RANKS,
  rewards: generateSeasonRewards(100),
  challenges: generateSeasonChallenges(),
  premiumCost: 1000,
  premiumBenefits: {
    xpBoost: 50,
    exclusiveRewards: true,
    exclusiveChallenges: true,
    earlyAccess: true
  }
}

// Export helper functions
export const SeasonHelpers = {
  formatTimeRemaining: (endDate: string): string => {
    const remaining = new Date(endDate).getTime() - Date.now()
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return 'Ending soon'
  },
  
  getRarityColor: (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      case 'mythic': return 'text-red-400'
      default: return 'text-gray-400'
    }
  },
  
  getRarityBorder: (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-400'
      case 'rare': return 'border-blue-400'
      case 'epic': return 'border-purple-400'
      case 'legendary': return 'border-yellow-400'
      case 'mythic': return 'border-red-400'
      default: return 'border-gray-400'
    }
  }
} 