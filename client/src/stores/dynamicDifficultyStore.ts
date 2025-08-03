import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  DifficultyAI, 
  type UserSkillProfile, 
  type DifficultyRecommendation, 
  type PerformanceAnalysis 
} from '@/utils/DifficultyAI'
import type { GamePerformance } from '@/stores/levelStore'

export interface DynamicDifficultyState {
  // User skill tracking
  userProfile: UserSkillProfile
  currentAnalysis: PerformanceAnalysis | null
  latestRecommendation: DifficultyRecommendation | null
  
  // Difficulty settings
  currentDifficulty: number // 0-100
  isDynamicModeEnabled: boolean
  autoAdjustEnabled: boolean
  adaptationSensitivity: 'low' | 'medium' | 'high' // How quickly to adapt
  
  // Real-time adjustments
  activeAdjustments: {
    targetSizeMultiplier: number
    spawnRateMultiplier: number
    targetLifetimeMultiplier: number
    movementSpeedMultiplier: number
  }
  
  // Performance history
  sessionPerformances: GamePerformance[]
  skillProgressHistory: { timestamp: number; skill: number }[]
  
  // UI state
  showRecommendations: boolean
  lastRecommendationSeen: number
  
  // Actions
  initializeProfile: () => void
  analyzePerformance: (performance: GamePerformance) => void
  applyRecommendation: (recommendation: DifficultyRecommendation) => void
  setDynamicMode: (enabled: boolean) => void
  setAutoAdjust: (enabled: boolean) => void
  setAdaptationSensitivity: (sensitivity: 'low' | 'medium' | 'high') => void
  setCurrentDifficulty: (difficulty: number) => void
  dismissRecommendation: () => void
  getOptimalDifficulty: () => number
  getRecommendedTrainingModes: () => string[]
  resetProfile: () => void
  
  // Skill insights
  getSkillTrends: () => {
    overall: 'improving' | 'declining' | 'stable'
    accuracy: 'improving' | 'declining' | 'stable' 
    speed: 'improving' | 'declining' | 'stable'
    consistency: 'improving' | 'declining' | 'stable'
  }
  getPerformanceInsights: () => {
    strengths: string[]
    weaknesses: string[]
    nextGoals: string[]
  }
}

const ADAPTATION_RATES = {
  low: 0.1,
  medium: 0.15,
  high: 0.25
}

export const useDynamicDifficultyStore = create<DynamicDifficultyState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    userProfile: DifficultyAI.createInitialProfile(),
    currentAnalysis: null,
    latestRecommendation: null,
    
    currentDifficulty: 30, // Start at beginner level
    isDynamicModeEnabled: false,
    autoAdjustEnabled: false,
    adaptationSensitivity: 'medium',
    
    activeAdjustments: {
      targetSizeMultiplier: 1.0,
      spawnRateMultiplier: 1.0,
      targetLifetimeMultiplier: 1.0,
      movementSpeedMultiplier: 1.0
    },
    
    sessionPerformances: [],
    skillProgressHistory: [],
    
    showRecommendations: false,
    lastRecommendationSeen: 0,

    // Actions
    initializeProfile: () => {
      const state = get()
      if (state.userProfile.sessionsAnalyzed === 0) {
        set({
          userProfile: DifficultyAI.createInitialProfile(),
          skillProgressHistory: [{
            timestamp: Date.now(),
            skill: 30
          }]
        })
      }
    },

    analyzePerformance: (performance: GamePerformance) => {
      const state = get()
      
      // Update session performances
      const newSessionPerformances = [...state.sessionPerformances, performance]
      if (newSessionPerformances.length > 100) {
        newSessionPerformances.splice(0, 1) // Keep last 100 sessions
      }

      // Run AI analysis if dynamic mode is enabled
      if (state.isDynamicModeEnabled) {
        const result = DifficultyAI.analyzeAndRecommend(
          performance,
          state.userProfile,
          state.currentDifficulty
        )

        // Update skill progress history
        const newSkillProgress = [...state.skillProgressHistory, {
          timestamp: Date.now(),
          skill: result.profile.overallSkill
        }]
        if (newSkillProgress.length > 200) {
          newSkillProgress.splice(0, 1) // Keep last 200 entries
        }

        set({
          userProfile: result.profile,
          currentAnalysis: result.analysis,
          latestRecommendation: result.recommendation,
          sessionPerformances: newSessionPerformances,
          skillProgressHistory: newSkillProgress,
          showRecommendations: result.analysis.adaptationNeeded && 
                              Date.now() - state.lastRecommendationSeen > 300000 // 5 minutes
        })

        // Auto-apply adjustments if enabled
        if (state.autoAdjustEnabled && result.analysis.adaptationNeeded) {
          get().applyRecommendation(result.recommendation)
        }
      } else {
        set({
          sessionPerformances: newSessionPerformances
        })
      }
    },

    applyRecommendation: (recommendation: DifficultyRecommendation) => {
      const state = get()
      
      // Apply difficulty adjustment
      const sensitivityMultiplier = ADAPTATION_RATES[state.adaptationSensitivity]
      const difficultyChange = (recommendation.targetDifficulty - state.currentDifficulty) * sensitivityMultiplier
      const newDifficulty = Math.max(0, Math.min(100, state.currentDifficulty + difficultyChange))

      set({
        currentDifficulty: newDifficulty,
        activeAdjustments: {
          targetSizeMultiplier: recommendation.targetSize,
          spawnRateMultiplier: recommendation.spawnRate,
          targetLifetimeMultiplier: recommendation.targetLifetime,
          movementSpeedMultiplier: recommendation.movementSpeed
        },
        showRecommendations: false,
        lastRecommendationSeen: Date.now()
      })
    },

    setDynamicMode: (enabled: boolean) => {
      set({ isDynamicModeEnabled: enabled })
      if (enabled) {
        get().initializeProfile()
      }
    },

    setAutoAdjust: (enabled: boolean) => {
      set({ autoAdjustEnabled: enabled })
    },

    setAdaptationSensitivity: (sensitivity: 'low' | 'medium' | 'high') => {
      set({ adaptationSensitivity: sensitivity })
    },

    setCurrentDifficulty: (difficulty: number) => {
      set({ currentDifficulty: Math.max(0, Math.min(100, difficulty)) })
    },

    dismissRecommendation: () => {
      set({ 
        showRecommendations: false,
        lastRecommendationSeen: Date.now()
      })
    },

    getOptimalDifficulty: () => {
      const state = get()
      return state.userProfile?.optimalDifficulty || state.currentDifficulty
    },

    getRecommendedTrainingModes: () => {
      const state = get()
      return state.latestRecommendation?.recommendedModes || []
    },

    resetProfile: () => {
      set({
        userProfile: DifficultyAI.createInitialProfile(),
        currentAnalysis: null,
        latestRecommendation: null,
        sessionPerformances: [],
        skillProgressHistory: [{
          timestamp: Date.now(),
          skill: 30
        }],
        currentDifficulty: 30,
        activeAdjustments: {
          targetSizeMultiplier: 1.0,
          spawnRateMultiplier: 1.0,
          targetLifetimeMultiplier: 1.0,
          movementSpeedMultiplier: 1.0
        }
      })
    },

    getSkillTrends: () => {
      const state = get()
      const history = state.skillProgressHistory
      
      if (history.length < 10) {
        return {
          overall: 'stable' as const,
          accuracy: 'stable' as const,
          speed: 'stable' as const,
          consistency: 'stable' as const
        }
      }

      // Analyze trends from recent sessions
      const recent = history.slice(-10)
      const older = history.slice(-20, -10)
      
      const recentAvg = recent.reduce((sum, entry) => sum + entry.skill, 0) / recent.length
      const olderAvg = older.length > 0 
        ? older.reduce((sum, entry) => sum + entry.skill, 0) / older.length 
        : recentAvg

      const overallTrend = recentAvg > olderAvg + 2 ? 'improving' : 
                          recentAvg < olderAvg - 2 ? 'declining' : 'stable'

      // For individual skills, use current analysis if available
      const analysis = state.currentAnalysis
      if (!analysis) {
        return {
          overall: overallTrend,
          accuracy: 'stable' as const,
          speed: 'stable' as const,
          consistency: 'stable' as const
        }
      }

      const getTrend = (gap: number) => gap > 5 ? 'improving' : gap < -5 ? 'declining' : 'stable'

      return {
        overall: overallTrend,
        accuracy: getTrend(analysis.skillGaps.accuracy),
        speed: getTrend(analysis.skillGaps.speed),
        consistency: getTrend(analysis.skillGaps.consistency)
      }
    },

    getPerformanceInsights: () => {
      const state = get()
      const profile = state.userProfile
      const analysis = state.currentAnalysis
      
      const strengths: string[] = []
      const weaknesses: string[] = []
      const nextGoals: string[] = []

      // Analyze strengths
      if (profile.accuracyRating > 70) strengths.push('Excellent Accuracy')
      if (profile.speedRating > 70) strengths.push('Fast Reaction Time')
      if (profile.consistencyRating > 70) strengths.push('Consistent Performance')
      if (profile.flickSkill > 70) strengths.push('Flick Shot Mastery')
      if (profile.trackingSkill > 70) strengths.push('Tracking Proficiency')

      // Identify weaknesses
      if (profile.accuracyRating < 50) weaknesses.push('Accuracy needs work')
      if (profile.speedRating < 50) weaknesses.push('Reaction time improvement needed')
      if (profile.consistencyRating < 50) weaknesses.push('Consistency training required')
      if (analysis?.recentPerformance?.performanceStability && analysis.recentPerformance.performanceStability < 60) {
        weaknesses.push('Performance stability')
      }

      // Set next goals
      if (profile.overallSkill < 40) {
        nextGoals.push('Master fundamental aiming', 'Improve accuracy to 80%+')
      } else if (profile.overallSkill < 70) {
        nextGoals.push('Develop advanced techniques', 'Master flick training')
      } else {
        nextGoals.push('Perfect consistency', 'Compete at expert level')
      }

      // Add specific recommendations from latest recommendation
      const latestRecommendation = state.latestRecommendation
      if (latestRecommendation?.focusAreas) {
        nextGoals.push(...latestRecommendation.focusAreas.map((area: string) => `Focus on ${area}`))
      }

      return {
        strengths: strengths.length > 0 ? strengths : ['Dedicated practice'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Minor improvements needed'],
        nextGoals: nextGoals.slice(0, 3) // Limit to top 3 goals
      }
    }
  }))
)

// Auto-persist profile to localStorage
useDynamicDifficultyStore.subscribe(
  (state) => state.userProfile,
  (profile) => {
    if (profile.sessionsAnalyzed > 0) {
      localStorage.setItem('aim-trainer-skill-profile', JSON.stringify(profile))
    }
  }
)

// Load profile from localStorage on init
const savedProfile = localStorage.getItem('aim-trainer-skill-profile')
if (savedProfile) {
  try {
    const profile = JSON.parse(savedProfile) as UserSkillProfile
    useDynamicDifficultyStore.setState({ userProfile: profile })
  } catch (error) {
    console.warn('Failed to load saved skill profile:', error)
  }
} 