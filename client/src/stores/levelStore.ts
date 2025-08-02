import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

// Level progression formulas and constants
export const LEVEL_CONSTANTS = {
  BASE_XP_PER_LEVEL: 1000,
  MAX_LEVEL: 100,
  DAILY_BONUS_MULTIPLIER: 1.5,
  STREAK_BONUS_CAP: 3.0,
  PERFECT_GAME_BONUS: 500,
  FIRST_WIN_BONUS: 200,
  DIFFICULTY_MULTIPLIERS: {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
    extreme: 1.6
  },
  MODE_MULTIPLIERS: {
    precision: 1.2,
    speed: 1.0,
    tracking: 1.4,
    flick: 1.1,
    'micro-correction': 1.3
  }
}

export interface XPGain {
  amount: number
  source: string
  timestamp: Date
  gameMode?: string
  multiplier?: number
}

export interface LevelReward {
  level: number
  type: 'title' | 'badge' | 'cosmetic' | 'feature'
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export interface LevelProgress {
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  xpGainHistory: XPGain[]
  rewards: LevelReward[]
  dailyXPGained: number
  lastPlayDate: string
  levelUpAnimations: number[]
}

export interface LevelState extends LevelProgress {
  // Actions
  gainXP: (amount: number, source: string, gameMode?: string, multiplier?: number) => void
  calculateXPFromPerformance: (performance: GamePerformance) => number
  getXPRequiredForLevel: (level: number) => number
  getLevelFromXP: (xp: number) => number
  checkLevelUp: () => boolean
  claimReward: (level: number) => void
  resetDailyXP: () => void
  getProgressPercentage: () => number
  getTitleForLevel: (level: number) => string
  getNextMilestone: () => { level: number; reward: LevelReward } | null
}

export interface GamePerformance {
  score: number
  accuracy: number
  reactionTime: number
  hits: number
  misses: number
  streak: number
  gameMode: string
  difficulty: string
  duration: number
  perfectShots: number
  consistency: number
}

// XP calculation based on performance
const calculatePerformanceXP = (performance: GamePerformance): number => {
  const {
    score,
    accuracy,
    reactionTime,
    hits,
    streak,
    gameMode,
    difficulty,
    duration,
    perfectShots,
    consistency
  } = performance

  // Base XP from score (1 XP per 10 points)
  let baseXP = Math.floor(score / 10)

  // Accuracy bonus (0-100% accuracy gives 0-200 bonus XP)
  const accuracyBonus = Math.floor(accuracy * 2)

  // Reaction time bonus (faster = more XP, cap at 200ms)
  const reactionBonus = Math.max(0, Math.floor((500 - Math.min(reactionTime, 500)) / 2))

  // Streak bonus (exponential growth, capped)
  const streakMultiplier = Math.min(1 + (streak * 0.1), LEVEL_CONSTANTS.STREAK_BONUS_CAP)

  // Duration bonus (longer games give more XP)
  const durationBonus = Math.floor(duration / 30) * 10 // 10 XP per 30 seconds

  // Perfect shots bonus
  const perfectBonus = perfectShots * 25

  // Consistency bonus (0-100 consistency gives 0-100 bonus XP)
  const consistencyBonus = Math.floor(consistency)

  // Apply mode and difficulty multipliers
  const modeMultiplier = LEVEL_CONSTANTS.MODE_MULTIPLIERS[gameMode as keyof typeof LEVEL_CONSTANTS.MODE_MULTIPLIERS] || 1.0
  const difficultyMultiplier = LEVEL_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof LEVEL_CONSTANTS.DIFFICULTY_MULTIPLIERS] || 1.0

  // Calculate total XP
  const rawXP = baseXP + accuracyBonus + reactionBonus + durationBonus + perfectBonus + consistencyBonus
  const finalXP = Math.floor(rawXP * streakMultiplier * modeMultiplier * difficultyMultiplier)

  return Math.max(finalXP, 10) // Minimum 10 XP per game
}

// Level calculation using square root progression
const calculateLevelFromXP = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / LEVEL_CONSTANTS.BASE_XP_PER_LEVEL)) + 1
}

// XP required for specific level
const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0
  return Math.floor(Math.pow(level - 1, 2) * LEVEL_CONSTANTS.BASE_XP_PER_LEVEL)
}

// Generate level rewards
const generateLevelRewards = (): LevelReward[] => {
  const rewards: LevelReward[] = []
  
  // Title rewards every 10 levels
  for (let i = 10; i <= 100; i += 10) {
    const titles = [
      { name: 'Novice Shooter', icon: '🎯' },
      { name: 'Skilled Marksman', icon: '🎖️' },
      { name: 'Expert Gunner', icon: '⭐' },
      { name: 'Elite Sniper', icon: '💎' },
      { name: 'Master Assassin', icon: '👑' },
      { name: 'Legendary Aim', icon: '🔥' },
      { name: 'Godlike Precision', icon: '⚡' },
      { name: 'Unstoppable Force', icon: '💀' },
      { name: 'Aimbot Suspicion', icon: '🤖' },
      { name: 'Inhuman Reactions', icon: '👹' }
    ]
    
    const titleIndex = (i / 10) - 1
    if (titleIndex < titles.length) {
      rewards.push({
        level: i,
        type: 'title',
        name: titles[titleIndex].name,
        description: `Unlocked at level ${i}`,
        icon: titles[titleIndex].icon,
        unlocked: false
      })
    }
  }

  // Badge rewards every 5 levels
  for (let i = 5; i <= 100; i += 5) {
    if (i % 10 !== 0) { // Skip title levels
      rewards.push({
        level: i,
        type: 'badge',
        name: `Level ${i} Badge`,
        description: `Commemorative badge for reaching level ${i}`,
        icon: '🏆',
        unlocked: false
      })
    }
  }

  // Special milestone rewards
  const milestones = [
    { level: 25, name: 'Advanced Analytics', type: 'feature' as const, icon: '📊', description: 'Unlock detailed performance analytics' },
    { level: 50, name: 'Custom Crosshairs', type: 'cosmetic' as const, icon: '⚔️', description: 'Unlock custom crosshair designs' },
    { level: 75, name: 'Elite Status', type: 'title' as const, icon: '💫', description: 'Join the elite player ranks' },
    { level: 100, name: 'Grandmaster', type: 'title' as const, icon: '👑', description: 'Ultimate achievement - Maximum level reached' }
  ]

  milestones.forEach(milestone => {
    rewards.push({
      level: milestone.level,
      type: milestone.type,
      name: milestone.name,
      description: milestone.description,
      icon: milestone.icon,
      unlocked: false
    })
  })

  return rewards.sort((a, b) => a.level - b.level)
}

export const useLevelStore = create<LevelState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: LEVEL_CONSTANTS.BASE_XP_PER_LEVEL,
        totalXP: 0,
        xpGainHistory: [],
        rewards: generateLevelRewards(),
        dailyXPGained: 0,
        lastPlayDate: new Date().toDateString(),
        levelUpAnimations: [],

        // Actions
        gainXP: (amount, source, gameMode, multiplier = 1) => {
          const state = get()
          const today = new Date().toDateString()
          
          // Reset daily XP if it's a new day
          if (state.lastPlayDate !== today) {
            set({ dailyXPGained: 0, lastPlayDate: today })
          }

          // Apply daily bonus for first game
          let finalAmount = amount * multiplier
          if (state.dailyXPGained === 0) {
            finalAmount *= LEVEL_CONSTANTS.DAILY_BONUS_MULTIPLIER
          }

          const newTotalXP = state.totalXP + finalAmount
          const newLevel = calculateLevelFromXP(newTotalXP)
          const newCurrentXP = newTotalXP - calculateXPForLevel(newLevel)
          const newXPToNext = calculateXPForLevel(newLevel + 1) - calculateXPForLevel(newLevel)

          const xpGain: XPGain = {
            amount: finalAmount,
            source,
            timestamp: new Date(),
            gameMode,
            multiplier
          }

          // Check for level up
          const leveledUp = newLevel > state.currentLevel
          const animations = leveledUp ? [...state.levelUpAnimations, newLevel] : state.levelUpAnimations

          set({
            currentLevel: newLevel,
            currentXP: newCurrentXP,
            xpToNextLevel: newXPToNext,
            totalXP: newTotalXP,
            xpGainHistory: [xpGain, ...state.xpGainHistory.slice(0, 99)], // Keep last 100
            dailyXPGained: state.dailyXPGained + finalAmount,
            levelUpAnimations: animations
          })

          // Auto-unlock rewards for achieved levels
          if (leveledUp) {
            const unlockedRewards = state.rewards.map(reward => 
              reward.level <= newLevel && !reward.unlocked
                ? { ...reward, unlocked: true, unlockedAt: new Date() }
                : reward
            )
            set({ rewards: unlockedRewards })
          }
        },

        calculateXPFromPerformance: (performance) => {
          return calculatePerformanceXP(performance)
        },

        getXPRequiredForLevel: (level) => {
          return calculateXPForLevel(level)
        },

        getLevelFromXP: (xp) => {
          return calculateLevelFromXP(xp)
        },

        checkLevelUp: () => {
          const state = get()
          return state.levelUpAnimations.length > 0
        },

        claimReward: (level) => {
          set((state) => ({
            rewards: state.rewards.map(reward =>
              reward.level === level
                ? { ...reward, unlocked: true, unlockedAt: new Date() }
                : reward
            ),
            levelUpAnimations: state.levelUpAnimations.filter(l => l !== level)
          }))
        },

        resetDailyXP: () => {
          set({ dailyXPGained: 0, lastPlayDate: new Date().toDateString() })
        },

        getProgressPercentage: () => {
          const state = get()
          if (state.currentLevel >= LEVEL_CONSTANTS.MAX_LEVEL) return 100
          return (state.currentXP / (state.currentXP + state.xpToNextLevel)) * 100
        },

        getTitleForLevel: (level) => {
          const state = get()
          const titleReward = state.rewards
            .filter(r => r.type === 'title' && r.level <= level && r.unlocked)
            .pop()
          return titleReward?.name || 'Rookie Shooter'
        },

        getNextMilestone: () => {
          const state = get()
          const nextReward = state.rewards.find(r => r.level > state.currentLevel)
          return nextReward ? { level: nextReward.level, reward: nextReward } : null
        }
      }),
      {
        name: 'level-storage',
        partialize: (state) => ({
          currentLevel: state.currentLevel,
          currentXP: state.currentXP,
          xpToNextLevel: state.xpToNextLevel,
          totalXP: state.totalXP,
          xpGainHistory: state.xpGainHistory,
          rewards: state.rewards,
          dailyXPGained: state.dailyXPGained,
          lastPlayDate: state.lastPlayDate
        })
      }
    )
  )
)