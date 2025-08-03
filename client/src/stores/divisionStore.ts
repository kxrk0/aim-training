import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Division, 
  DivisionTier, 
  UserDivisionStatus, 
  DivisionState,
  SkillAssessment,
  DivisionLeaderboard,
  DivisionHistoryEntry,
  GameMode 
} from '../../../shared/types'

interface DivisionStore extends DivisionState {
  // UI State
  isLoading: boolean
  error: string | null
  selectedDivision: DivisionTier | null
  
  // Actions
  initializeDivisionSystem: () => void
  assessUserSkill: (userId: string, gameMode: GameMode) => Promise<SkillAssessment>
  updateUserDivision: (userId: string, gameData: any) => Promise<void>
  getPromotion: (userId: string, division: DivisionTier) => Promise<void>
  getDemotion: (userId: string, division: DivisionTier) => Promise<void>
  startPlacementMatches: (userId: string) => Promise<void>
  completeMatch: (userId: string, matchResult: any) => Promise<void>
  
  // Data fetching
  fetchDivisionLeaderboards: (division?: DivisionTier) => Promise<void>
  fetchUserDivisionStatus: (userId: string) => Promise<void>
  
  // Utilities
  getDivisionByTier: (tier: DivisionTier) => Division | null
  calculateMMRChange: (userMMR: number, opponentMMR: number, result: 'win' | 'loss', gameData: any) => number
  checkPromotionEligibility: (status: UserDivisionStatus) => boolean
  checkDemotionRisk: (status: UserDivisionStatus) => boolean
  getRecommendedDivision: (skillRating: number) => DivisionTier
  
  // Setters
  setSelectedDivision: (division: DivisionTier | null) => void
  setError: (error: string | null) => void
}

export const useDivisionStore = create<DivisionStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentDivision: null,
      allDivisions: [],
      divisionLeaderboards: {} as Record<DivisionTier, DivisionLeaderboard>,
      skillAssessment: null,
      isInPlacementMatches: false,
      placementMatchesRemaining: 10,
      seasonInfo: {
        currentSeason: 'Season 1',
        seasonEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        nextResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      
      // UI State
      isLoading: false,
      error: null,
      selectedDivision: null,

      // Actions
      initializeDivisionSystem: () => {
        set({ 
          allDivisions: [], // Will be populated after DIVISION_CONFIGS is defined
          isLoading: false,
          error: null 
        })
      },

      assessUserSkill: async (userId: string, gameMode: GameMode) => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const assessment = await api.assessUserSkill(userId, gameMode)
          
          // Mock skill assessment
          const assessment: SkillAssessment = {
            userId,
            gameMode,
            overallSkillRating: 65,
            skillBreakdown: {
              accuracy: 70,
              speed: 60,
              consistency: 65,
              clutchPerformance: 55,
              improvement: 75
            },
            performanceFactors: {
              recentWinRate: 0.65,
              averageScore: 850,
              averageAccuracy: 72,
              averageReactionTime: 320,
              streakBonus: 1.1,
              opponentQuality: 0.8
            },
            recommendedDivision: get().getRecommendedDivision(65),
            confidence: 85,
            lastAssessed: new Date().toISOString()
          }

          set({ skillAssessment: assessment, isLoading: false })
          return assessment
        } catch (error) {
          set({ error: `Failed to assess skill: ${error}`, isLoading: false })
          throw error
        }
      },

      updateUserDivision: async (userId: string, gameData: any) => {
        try {
          set({ error: null })
          
          const currentStatus = get().currentDivision
          if (!currentStatus) return

          const opponentMMR = gameData.opponentMMR || currentStatus.currentMMR
          const mmrChange = get().calculateMMRChange(
            currentStatus.currentMMR,
            opponentMMR,
            gameData.result,
            gameData
          )

          const newMMR = Math.max(0, currentStatus.currentMMR + mmrChange)
          const newDivision = getDivisionForMMR(newMMR)
          
          // Check for promotion/demotion
          if (newDivision !== currentStatus.currentDivision) {
            if (DIVISION_ORDER.indexOf(newDivision) > DIVISION_ORDER.indexOf(currentStatus.currentDivision)) {
              await get().getPromotion(userId, newDivision)
            } else {
              await get().getDemotion(userId, newDivision)
            }
          } else {
            // Update MMR within division
            const updatedStatus: UserDivisionStatus = {
              ...currentStatus,
              currentMMR: newMMR,
              divisionMMR: calculateDivisionMMR(newMMR, newDivision),
              seasonStats: {
                ...currentStatus.seasonStats,
                gamesPlayed: currentStatus.seasonStats.gamesPlayed + 1,
                winRate: gameData.result === 'win' 
                  ? (currentStatus.seasonStats.winRate * currentStatus.seasonStats.gamesPlayed + 1) / (currentStatus.seasonStats.gamesPlayed + 1)
                  : (currentStatus.seasonStats.winRate * currentStatus.seasonStats.gamesPlayed) / (currentStatus.seasonStats.gamesPlayed + 1),
                currentStreak: gameData.result === 'win' 
                  ? Math.max(0, currentStatus.seasonStats.currentStreak + 1)
                  : Math.min(0, currentStatus.seasonStats.currentStreak - 1),
                averageAccuracy: (currentStatus.seasonStats.averageAccuracy + gameData.accuracy) / 2,
                averageReactionTime: (currentStatus.seasonStats.averageReactionTime + gameData.reactionTime) / 2
              },
              lastUpdated: new Date().toISOString()
            }

            set({ currentDivision: updatedStatus })
          }
          
          // TODO: Replace with actual API call
          // await api.updateUserDivision(userId, updatedStatus)
          
        } catch (error) {
          set({ error: `Failed to update division: ${error}` })
          throw error
        }
      },

      getPromotion: async (userId: string, newDivision: DivisionTier) => {
        try {
          const currentStatus = get().currentDivision
          if (!currentStatus) return

          const historyEntry: DivisionHistoryEntry = {
            id: `promotion_${Date.now()}`,
            fromDivision: currentStatus.currentDivision,
            toDivision: newDivision,
            type: 'promotion',
            reason: 'MMR threshold reached',
            mmrChange: 0,
            timestamp: new Date().toISOString(),
            gameMode: 'precision' // TODO: Get actual game mode
          }

          const updatedStatus: UserDivisionStatus = {
            ...currentStatus,
            currentDivision: newDivision,
            divisionMMR: 0, // Start at bottom of new division
            promotionProgress: {
              winsNeeded: 3, // Temporary fix
              currentWins: 0,
              currentStreak: Math.max(0, currentStatus.promotionProgress.currentStreak),
              isInPromotion: false
            },
            demotionShield: {
              isActive: true,
              gamesRemaining: 5 // Grace period for new division
            },
            seasonStats: {
              ...currentStatus.seasonStats,
              highestDivision: DIVISION_ORDER.indexOf(newDivision) > DIVISION_ORDER.indexOf(currentStatus.seasonStats.highestDivision)
                ? newDivision
                : currentStatus.seasonStats.highestDivision
            },
            history: [historyEntry, ...currentStatus.history],
            lastUpdated: new Date().toISOString()
          }

          set({ currentDivision: updatedStatus })
          
          // Show promotion notification
          console.log(`🎉 PROMOTED to ${newDivision.toUpperCase()}!`)
          
        } catch (error) {
          set({ error: `Failed to process promotion: ${error}` })
          throw error
        }
      },

      getDemotion: async (userId: string, newDivision: DivisionTier) => {
        try {
          const currentStatus = get().currentDivision
          if (!currentStatus || currentStatus.demotionShield.isActive) return

          const historyEntry: DivisionHistoryEntry = {
            id: `demotion_${Date.now()}`,
            fromDivision: currentStatus.currentDivision,
            toDivision: newDivision,
            type: 'demotion',
            reason: 'MMR below threshold',
            mmrChange: 0,
            timestamp: new Date().toISOString(),
            gameMode: 'precision' // TODO: Get actual game mode
          }

          const updatedStatus: UserDivisionStatus = {
            ...currentStatus,
            currentDivision: newDivision,
            divisionMMR: 100, // Start at top of lower division
            demotionShield: {
              isActive: false,
              gamesRemaining: 0
            },
            history: [historyEntry, ...currentStatus.history],
            lastUpdated: new Date().toISOString()
          }

          set({ currentDivision: updatedStatus })
          
          // Show demotion notification
          console.log(`📉 Demoted to ${newDivision.toUpperCase()}`)
          
        } catch (error) {
          set({ error: `Failed to process demotion: ${error}` })
          throw error
        }
      },

      startPlacementMatches: async (userId: string) => {
        try {
          set({ isInPlacementMatches: true, placementMatchesRemaining: 10 })
          
          // TODO: Replace with actual API call
          // await api.startPlacementMatches(userId)
          
        } catch (error) {
          set({ error: `Failed to start placement matches: ${error}` })
          throw error
        }
      },

      completeMatch: async (userId: string, matchResult: any) => {
        try {
          if (get().isInPlacementMatches) {
            const remaining = get().placementMatchesRemaining - 1
            set({ placementMatchesRemaining: remaining })
            
            if (remaining <= 0) {
              // Complete placement matches
              const assessment = await get().assessUserSkill(userId, matchResult.gameMode)
              const initialDivision = assessment.recommendedDivision
              
              const initialStatus: UserDivisionStatus = {
                userId,
                currentDivision: initialDivision,
                currentMMR: 1000, // Temporary fix
                divisionMMR: 50,
                promotionProgress: {
                  winsNeeded: 3, // Temporary fix
                  currentWins: 0,
                  currentStreak: 0,
                  isInPromotion: false
                },
                demotionShield: {
                  isActive: true,
                  gamesRemaining: 10
                },
                seasonStats: {
                  highestDivision: initialDivision,
                  gamesPlayed: 10,
                  winRate: matchResult.totalWins / 10,
                  averageAccuracy: matchResult.averageAccuracy,
                  averageReactionTime: matchResult.averageReactionTime,
                  currentStreak: 0,
                  longestWinStreak: matchResult.longestWinStreak || 0,
                  longestLossStreak: matchResult.longestLossStreak || 0
                },
                history: [],
                lastUpdated: new Date().toISOString()
              }

              set({ 
                currentDivision: initialStatus,
                isInPlacementMatches: false,
                placementMatchesRemaining: 0
              })
            }
          } else {
            await get().updateUserDivision(userId, matchResult)
          }
          
        } catch (error) {
          set({ error: `Failed to complete match: ${error}` })
          throw error
        }
      },

      fetchDivisionLeaderboards: async (division?: DivisionTier) => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const leaderboards = await api.getDivisionLeaderboards(division)
          
          set({ isLoading: false })
        } catch (error) {
          set({ error: `Failed to fetch leaderboards: ${error}`, isLoading: false })
        }
      },

      fetchUserDivisionStatus: async (userId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // TODO: Replace with actual API call
          // const status = await api.getUserDivisionStatus(userId)
          
          set({ isLoading: false })
        } catch (error) {
          set({ error: `Failed to fetch division status: ${error}`, isLoading: false })
        }
      },

      // Utilities
      getDivisionByTier: (tier) => {
        return get().allDivisions.find(d => d.tier === tier) || null
      },

      calculateMMRChange: (userMMR, opponentMMR, result, gameData) => {
        const K_FACTOR = 32 // Base K-factor
        const expectedScore = 1 / (1 + Math.pow(10, (opponentMMR - userMMR) / 400))
        const actualScore = result === 'win' ? 1 : 0
        
        // Performance multipliers
        const accuracyMultiplier = gameData.accuracy > 80 ? 1.2 : gameData.accuracy < 50 ? 0.8 : 1.0
        const streakMultiplier = Math.min(1.5, 1 + (Math.abs(gameData.currentStreak) * 0.1))
        
        const baseChange = K_FACTOR * (actualScore - expectedScore)
        const finalChange = Math.round(baseChange * accuracyMultiplier * streakMultiplier)
        
        return Math.max(-50, Math.min(50, finalChange)) // Cap MMR changes
      },

      checkPromotionEligibility: (status) => {
        const division = get().getDivisionByTier(status.currentDivision)
        if (!division) return false
        
        const hasRequiredWins = status.promotionProgress.currentWins >= division.promotionRequirement.winsRequired
        const hasRequiredStreak = !division.promotionRequirement.streakRequired || 
                                status.promotionProgress.currentStreak >= division.promotionRequirement.streakRequired
        const hasRequiredAccuracy = !division.promotionRequirement.minAccuracy ||
                                  status.seasonStats.averageAccuracy >= division.promotionRequirement.minAccuracy
        
        return hasRequiredWins && hasRequiredStreak && hasRequiredAccuracy && status.divisionMMR >= 80
      },

      checkDemotionRisk: (status) => {
        const division = get().getDivisionByTier(status.currentDivision)
        if (!division || status.demotionShield.isActive) return false
        
        return status.divisionMMR <= 20 || status.currentMMR <= division.minMMR
      },

      getRecommendedDivision: (skillRating) => {
        if (skillRating >= 90) return 'master'
        if (skillRating >= 80) return 'diamond'
        if (skillRating >= 70) return 'platinum'
        if (skillRating >= 60) return 'gold'
        if (skillRating >= 45) return 'silver'
        return 'bronze'
      },

      // Setters
      setSelectedDivision: (division) => set({ selectedDivision: division }),
      setError: (error) => set({ error })
    }),
    {
      name: 'division-store',
      partialize: (state) => ({
        currentDivision: state.currentDivision,
        divisionLeaderboards: state.divisionLeaderboards,
        skillAssessment: state.skillAssessment,
        isInPlacementMatches: state.isInPlacementMatches,
        placementMatchesRemaining: state.placementMatchesRemaining
      })
    }
  )
)

// Division configurations
const DIVISION_CONFIGS: Division[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    description: 'Starting your competitive journey',
    icon: '🥉',
    color: '#CD7F32',
    gradientColor: 'from-amber-600 to-orange-700',
    minMMR: 0,
    maxMMR: 1199,
    promotionRequirement: {
      winsRequired: 3,
      streakRequired: 2
    },
    demotionThreshold: {
      maxLosses: 5
    },
    rewards: {
      seasonEndRewards: {
        xp: 500,
        points: 100
      },
      monthlyRewards: {
        xp: 200,
        points: 50
      }
    },
    privileges: {
      exclusiveTournaments: false,
      priorityMatchmaking: false,
      customCosmetics: false,
      advancedAnalytics: false
    }
  },
  {
    tier: 'silver',
    name: 'Silver',
    description: 'Developing solid fundamentals',
    icon: '🥈',
    color: '#C0C0C0',
    gradientColor: 'from-gray-400 to-gray-500',
    minMMR: 1200,
    maxMMR: 1599,
    promotionRequirement: {
      winsRequired: 4,
      streakRequired: 3,
      minAccuracy: 65
    },
    demotionThreshold: {
      maxLosses: 4,
      streak: 3
    },
    rewards: {
      seasonEndRewards: {
        xp: 750,
        points: 150,
        cosmetics: ['silver_trail']
      },
      monthlyRewards: {
        xp: 300,
        points: 75
      }
    },
    privileges: {
      exclusiveTournaments: false,
      priorityMatchmaking: false,
      customCosmetics: true,
      advancedAnalytics: false
    }
  },
  {
    tier: 'gold',
    name: 'Gold',
    description: 'Above average skill level',
    icon: '🥇',
    color: '#FFD700',
    gradientColor: 'from-yellow-400 to-yellow-600',
    minMMR: 1600,
    maxMMR: 1999,
    promotionRequirement: {
      winsRequired: 5,
      streakRequired: 3,
      minAccuracy: 70
    },
    demotionThreshold: {
      maxLosses: 4,
      streak: 4
    },
    rewards: {
      seasonEndRewards: {
        xp: 1000,
        points: 200,
        cosmetics: ['gold_trail', 'gold_crosshair'],
        titles: ['Sharpshooter']
      },
      monthlyRewards: {
        xp: 400,
        points: 100
      }
    },
    privileges: {
      exclusiveTournaments: true,
      priorityMatchmaking: false,
      customCosmetics: true,
      advancedAnalytics: true
    }
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    description: 'High skill competitive player',
    icon: '💎',
    color: '#E5E4E2',
    gradientColor: 'from-slate-300 to-slate-500',
    minMMR: 2000,
    maxMMR: 2399,
    promotionRequirement: {
      winsRequired: 6,
      streakRequired: 4,
      minAccuracy: 75
    },
    demotionThreshold: {
      maxLosses: 3,
      streak: 5
    },
    rewards: {
      seasonEndRewards: {
        xp: 1500,
        points: 300,
        cosmetics: ['platinum_trail', 'platinum_crosshair', 'platinum_badge'],
        titles: ['Elite Marksman']
      },
      monthlyRewards: {
        xp: 600,
        points: 150
      }
    },
    privileges: {
      exclusiveTournaments: true,
      priorityMatchmaking: true,
      customCosmetics: true,
      advancedAnalytics: true
    }
  },
  {
    tier: 'diamond',
    name: 'Diamond',
    description: 'Elite competitive player',
    icon: '💠',
    color: '#B9F2FF',
    gradientColor: 'from-cyan-300 to-blue-500',
    minMMR: 2400,
    maxMMR: 2999,
    promotionRequirement: {
      winsRequired: 7,
      streakRequired: 5,
      minAccuracy: 80
    },
    demotionThreshold: {
      maxLosses: 3,
      streak: 6
    },
    rewards: {
      seasonEndRewards: {
        xp: 2000,
        points: 500,
        cosmetics: ['diamond_trail', 'diamond_crosshair', 'diamond_badge', 'diamond_avatar'],
        titles: ['Diamond Elite', 'Precision Master']
      },
      monthlyRewards: {
        xp: 800,
        points: 200
      }
    },
    privileges: {
      exclusiveTournaments: true,
      priorityMatchmaking: true,
      customCosmetics: true,
      advancedAnalytics: true
    }
  },
  {
    tier: 'master',
    name: 'Master',
    description: 'Top tier competitive elite',
    icon: '👑',
    color: '#FF6B35',
    gradientColor: 'from-orange-400 to-red-500',
    minMMR: 3000,
    maxMMR: 99999,
    promotionRequirement: {
      winsRequired: 10,
      streakRequired: 7,
      minAccuracy: 85
    },
    demotionThreshold: {
      maxLosses: 2,
      streak: 8
    },
    rewards: {
      seasonEndRewards: {
        xp: 3000,
        points: 1000,
        cosmetics: ['master_trail', 'master_crosshair', 'master_badge', 'master_avatar', 'master_victory_pose'],
        titles: ['Grandmaster', 'Aim Legend', 'Untouchable']
      },
      monthlyRewards: {
        xp: 1200,
        points: 300
      }
    },
    privileges: {
      exclusiveTournaments: true,
      priorityMatchmaking: true,
      customCosmetics: true,
      advancedAnalytics: true
    }
  }
]

const DIVISION_ORDER: DivisionTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']

// Helper functions (simplified for now)
function getDivisionForMMR(mmr: number): DivisionTier {
  if (mmr < 500) return 'bronze'
  if (mmr < 1000) return 'silver'
  if (mmr < 1500) return 'gold'
  if (mmr < 2000) return 'platinum'
  if (mmr < 2500) return 'diamond'
  return 'master'
}

function calculateDivisionMMR(totalMMR: number, division: DivisionTier): number {
  // Simplified calculation
  const ranges = {
    'bronze': { min: 0, max: 500 },
    'silver': { min: 500, max: 1000 },
    'gold': { min: 1000, max: 1500 },
    'platinum': { min: 1500, max: 2000 },
    'diamond': { min: 2000, max: 2500 },
    'master': { min: 2500, max: 3000 }
  }
  
  const range = ranges[division]
  if (!range) return 0
  
  const divisionRange = range.max - range.min
  const mmrInDivision = totalMMR - range.min
  
  return Math.round((mmrInDivision / divisionRange) * 100)
}

// Export helper functions
export const DivisionHelpers = {
  getDivisionForMMR,
  calculateDivisionMMR,
  
  formatDivisionName: (tier: DivisionTier): string => {
    const names = {
      'bronze': 'Bronze',
      'silver': 'Silver', 
      'gold': 'Gold',
      'platinum': 'Platinum',
      'diamond': 'Diamond',
      'master': 'Master'
    }
    return names[tier] || tier
  },
  
  getDivisionColor: (tier: DivisionTier): string => {
    const colors = {
      'bronze': '#CD7F32',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'platinum': '#E5E4E2',
      'diamond': '#B9F2FF',
      'master': '#FF6B6B'
    }
    return colors[tier] || '#808080'
  },
  
  getDivisionIcon: (tier: DivisionTier): string => {
    const icons = {
      'bronze': '🥉',
      'silver': '🥈',
      'gold': '🥇',
      'platinum': '💎',
      'diamond': '💠',
      'master': '👑'
    }
    return icons[tier] || '❓'
  },
  
  isHigherDivision: (division1: DivisionTier, division2: DivisionTier): boolean => {
    return DIVISION_ORDER.indexOf(division1) > DIVISION_ORDER.indexOf(division2)
  },
  
  getNextDivision: (currentDivision: DivisionTier): DivisionTier | null => {
    const currentIndex = DIVISION_ORDER.indexOf(currentDivision)
    return currentIndex < DIVISION_ORDER.length - 1 ? DIVISION_ORDER[currentIndex + 1] : null
  },
  
  getPreviousDivision: (currentDivision: DivisionTier): DivisionTier | null => {
    const currentIndex = DIVISION_ORDER.indexOf(currentDivision)
    return currentIndex > 0 ? DIVISION_ORDER[currentIndex - 1] : null
  }
} 