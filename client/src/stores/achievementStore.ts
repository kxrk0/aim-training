import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { apiService } from '../services/api'

// 🏆 Achievement Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'training' | 'accuracy' | 'streak' | 'competition' | 'social' | 'progression' | 'special'
  type: 'single' | 'progressive' | 'cumulative' | 'streak' | 'challenge'
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: string // JSON string
  maxProgress: number
  xpReward: number
  pointReward: number
  isActive: boolean
  isHidden: boolean
  isSeasonal: boolean
  seasonId?: string
  requiresAchievement?: string
  minimumLevel: number
  createdAt: string
  updatedAt: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  currentProgress: number
  isCompleted: boolean
  completedAt?: string
  progressData?: string // JSON
  startedAt: string
  lastUpdated: string
  achievement: Achievement
}

// 🎁 Reward Types
export interface Reward {
  id: string
  name: string
  description: string
  type: 'crosshair' | 'theme' | 'title' | 'badge' | 'emote'
  category: 'cosmetic' | 'functional' | 'prestige'
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  rewardData: string // JSON
  previewUrl?: string
  isActive: boolean
  createdAt: string
}

export interface UserReward {
  id: string
  userId: string
  rewardId: string
  unlockedAt: string
  isEquipped: boolean
  reward: Reward
}

// 👑 Prestige Types
export interface PrestigeLevel {
  id: string
  level: number
  name: string
  description: string
  icon: string
  color: string
  requiredLevel: number
  requiredXP: number
  requiredAchievements?: string // JSON
  prestigeRewards: string // JSON
  createdAt: string
}

export interface UserPrestige {
  id: string
  userId: string
  currentPrestige: number
  totalPrestigeXP: number
  prestigedAt?: string
  lastUpdated: string
  prestigeLevel: PrestigeLevel
}

// 📅 Season Types
export interface Season {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  seasonNumber: number
  themeColor: string
  bannerUrl?: string
  createdAt: string
}

// 🎯 Achievement Progress Event
export interface AchievementProgressEvent {
  type: 'game_completed' | 'level_up' | 'streak_achieved' | 'accuracy_milestone' | 'competition_won' | 'training_hours'
  data: Record<string, any>
  userId: string
  timestamp: string
}

// 🏆 Store State
interface AchievementState {
  // Data
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  rewards: Reward[]
  userRewards: UserReward[]
  prestigeLevels: PrestigeLevel[]
  userPrestige: UserPrestige | null
  currentSeason: Season | null
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Notifications
  recentUnlocks: UserAchievement[]
  recentRewards: UserReward[]
  showUnlockNotification: boolean
  
  // Filters & Views
  selectedCategory: string | null
  selectedDifficulty: string | null
  showCompleted: boolean
  showHidden: boolean
}

// 🎮 Store Actions
interface AchievementActions {
  // Data Fetching
  fetchAchievements: () => Promise<void>
  fetchUserAchievements: () => Promise<void>
  fetchRewards: () => Promise<void>
  fetchUserRewards: () => Promise<void>
  fetchPrestigeData: () => Promise<void>
  fetchCurrentSeason: () => Promise<void>
  
  // Achievement Progress
  trackProgress: (event: AchievementProgressEvent) => Promise<void>
  checkAchievementCompletion: (achievementId: string) => Promise<void>
  claimAchievement: (achievementId: string) => Promise<void>
  
  // Rewards
  claimReward: (rewardId: string) => Promise<void>
  equipReward: (rewardId: string) => Promise<void>
  unequipReward: (rewardId: string) => Promise<void>
  
  // Prestige
  checkPrestigeEligibility: () => boolean
  performPrestige: () => Promise<void>
  
  // UI Actions
  setSelectedCategory: (category: string | null) => void
  setSelectedDifficulty: (difficulty: string | null) => void
  toggleShowCompleted: () => void
  toggleShowHidden: () => void
  dismissUnlockNotification: () => void
  
  // Utility
  getAchievementProgress: (achievementId: string) => number
  getCompletedAchievements: () => UserAchievement[]
  getAvailableRewards: () => UserReward[]
  getEquippedRewards: () => UserReward[]
  clearError: () => void
}

type AchievementStore = AchievementState & AchievementActions

// 🏗️ Achievement Store Implementation
export const useAchievementStore = create<AchievementStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        achievements: [],
        userAchievements: [],
        rewards: [],
        userRewards: [],
        prestigeLevels: [],
        userPrestige: null,
        currentSeason: null,
        isLoading: false,
        error: null,
        recentUnlocks: [],
        recentRewards: [],
        showUnlockNotification: false,
        selectedCategory: null,
        selectedDifficulty: null,
        showCompleted: true,
        showHidden: false,

        // Data Fetching Actions
        fetchAchievements: async () => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.get('/achievements')
            set({ achievements: response.data, isLoading: false })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch achievements', isLoading: false })
          }
        },

        fetchUserAchievements: async () => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.get('/achievements/user')
            set({ userAchievements: response.data, isLoading: false })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch user achievements', isLoading: false })
          }
        },

        fetchRewards: async () => {
          try {
            const response = await apiService.get('/rewards')
            set({ rewards: response.data })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch rewards' })
          }
        },

        fetchUserRewards: async () => {
          try {
            const response = await apiService.get('/rewards/user')
            set({ userRewards: response.data })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch user rewards' })
          }
        },

        fetchPrestigeData: async () => {
          try {
            const [prestigeLevels, userPrestige] = await Promise.all([
              apiService.get('/prestige/levels'),
              apiService.get('/prestige/user')
            ])
            set({ 
              prestigeLevels: prestigeLevels.data,
              userPrestige: userPrestige.data 
            })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch prestige data' })
          }
        },

        fetchCurrentSeason: async () => {
          try {
            const response = await apiService.get('/seasons/current')
            set({ currentSeason: response.data })
          } catch (error: any) {
            console.warn('No active season found')
          }
        },

        // Achievement Progress Actions
        trackProgress: async (event: AchievementProgressEvent) => {
          try {
            const response = await apiService.post('/achievements/track-progress', event)
            const { updatedAchievements, newUnlocks, newRewards } = response.data
            
            // Update user achievements
            set((state) => ({
              userAchievements: updatedAchievements,
              recentUnlocks: [...state.recentUnlocks, ...newUnlocks],
              recentRewards: [...state.recentRewards, ...newRewards],
              showUnlockNotification: newUnlocks.length > 0 || newRewards.length > 0
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to track progress' })
          }
        },

        checkAchievementCompletion: async (achievementId: string) => {
          try {
            const response = await apiService.post(`/achievements/${achievementId}/check`)
            if (response.data.completed) {
              // Update the specific achievement
              set((state) => ({
                userAchievements: state.userAchievements.map(ua =>
                  ua.achievementId === achievementId ? response.data.userAchievement : ua
                ),
                recentUnlocks: [...state.recentUnlocks, response.data.userAchievement],
                showUnlockNotification: true
              }))
            }
          } catch (error: any) {
            set({ error: error.message || 'Failed to check achievement completion' })
          }
        },

        claimAchievement: async (achievementId: string) => {
          try {
            const response = await apiService.post(`/achievements/${achievementId}/claim`)
            const { userAchievement, rewards } = response.data
            
            set((state) => ({
              userAchievements: state.userAchievements.map(ua =>
                ua.achievementId === achievementId ? userAchievement : ua
              ),
              userRewards: [...state.userRewards, ...rewards],
              recentRewards: [...state.recentRewards, ...rewards]
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to claim achievement' })
          }
        },

        // Reward Actions
        claimReward: async (rewardId: string) => {
          try {
            const response = await apiService.post(`/rewards/${rewardId}/claim`)
            set((state) => ({
              userRewards: [...state.userRewards, response.data],
              recentRewards: [...state.recentRewards, response.data]
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to claim reward' })
          }
        },

        equipReward: async (rewardId: string) => {
          try {
            await apiService.post(`/rewards/${rewardId}/equip`)
            set((state) => ({
              userRewards: state.userRewards.map(ur =>
                ur.rewardId === rewardId ? { ...ur, isEquipped: true } : ur
              )
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to equip reward' })
          }
        },

        unequipReward: async (rewardId: string) => {
          try {
            await apiService.post(`/rewards/${rewardId}/unequip`)
            set((state) => ({
              userRewards: state.userRewards.map(ur =>
                ur.rewardId === rewardId ? { ...ur, isEquipped: false } : ur
              )
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to unequip reward' })
          }
        },

        // Prestige Actions
        checkPrestigeEligibility: () => {
          const state = get()
          if (!state.userPrestige) return false
          
          const nextLevel = state.prestigeLevels.find(
            pl => pl.level === state.userPrestige!.currentPrestige + 1
          )
          
          if (!nextLevel) return false
          
          // Check requirements (simplified - would need access to user level and XP)
          return true // This would be implemented based on actual requirements
        },

        performPrestige: async () => {
          try {
            const response = await apiService.post('/prestige/perform')
            set({ userPrestige: response.data })
          } catch (error: any) {
            set({ error: error.message || 'Failed to perform prestige' })
          }
        },

        // UI Actions
        setSelectedCategory: (category: string | null) => {
          set({ selectedCategory: category })
        },

        setSelectedDifficulty: (difficulty: string | null) => {
          set({ selectedDifficulty: difficulty })
        },

        toggleShowCompleted: () => {
          set((state) => ({ showCompleted: !state.showCompleted }))
        },

        toggleShowHidden: () => {
          set((state) => ({ showHidden: !state.showHidden }))
        },

        dismissUnlockNotification: () => {
          set({ showUnlockNotification: false, recentUnlocks: [], recentRewards: [] })
        },

        // Utility Functions
        getAchievementProgress: (achievementId: string) => {
          const state = get()
          const userAchievement = state.userAchievements.find(ua => ua.achievementId === achievementId)
          if (!userAchievement) return 0
          
          const achievement = state.achievements.find(a => a.id === achievementId)
          if (!achievement) return 0
          
          return (userAchievement.currentProgress / achievement.maxProgress) * 100
        },

        getCompletedAchievements: () => {
          const state = get()
          return state.userAchievements.filter(ua => ua.isCompleted)
        },

        getAvailableRewards: () => {
          const state = get()
          return state.userRewards.filter(ur => !ur.isEquipped)
        },

        getEquippedRewards: () => {
          const state = get()
          return state.userRewards.filter(ur => ur.isEquipped)
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'achievement-storage',
        partialize: (state) => ({
          // Only persist non-sensitive UI preferences
          selectedCategory: state.selectedCategory,
          selectedDifficulty: state.selectedDifficulty,
          showCompleted: state.showCompleted,
          showHidden: state.showHidden
        })
      }
    )
  )
)

// 🎯 Achievement Helper Functions
export const getAchievementRarityColor = (difficulty: string): string => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  }
  return colors[difficulty as keyof typeof colors] || '#CD7F32'
}

export const getRewardRarityColor = (rarity: string): string => {
  const colors = {
    common: '#808080',
    rare: '#0070f3',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    mythic: '#EF4444'
  }
  return colors[rarity as keyof typeof colors] || '#808080'
}

export const formatAchievementRequirement = (requirement: string): string => {
  try {
    const req = JSON.parse(requirement)
    // Format based on requirement type
    switch (req.type) {
      case 'games_played':
        return `Play ${req.count} games`
      case 'accuracy_threshold':
        return `Achieve ${req.accuracy}% accuracy`
      case 'streak_count':
        return `Get a ${req.count} hit streak`
      case 'total_score':
        return `Reach ${req.score.toLocaleString()} total score`
      default:
        return 'Complete specific objectives'
    }
  } catch {
    return 'Complete specific objectives'
  }
} 