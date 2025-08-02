import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useLevelStore, type GamePerformance } from './levelStore'
import type { GameState, GameMode, Difficulty, Target, HitResult } from '../../../shared/types'

interface GameStoreState extends GameState {
  // Game session tracking
  gameStartTime: number | null
  perfectShots: number
  consistencyScores: number[]
  
  // Actions
  startGame: (gameMode: GameMode, difficulty: Difficulty) => void
  endGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  
  // Target management
  addTarget: (target: Target) => void
  removeTarget: (targetId: string) => void
  hitTarget: (targetId: string, hitResult: HitResult) => void
  missTarget: () => void
  
  // Score management
  updateScore: (points: number) => void
  resetScore: () => void
  
  // Time management
  updateTimeLeft: (time: number) => void
  
  // Settings
  updateSettings: (settings: Partial<GameState['settings']>) => void
  
  // Level integration
  calculateGamePerformance: () => GamePerformance | null
  awardXP: () => void
}

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isActive: false,
    isPaused: false,
    gameMode: null,
    settings: null,
    currentScore: 0,
    targets: [],
    timeLeft: 0,
    gameStartTime: null,
    perfectShots: 0,
    consistencyScores: [],
    stats: {
      hits: 0,
      misses: 0,
      accuracy: 0,
      averageReactionTime: 0,
      currentStreak: 0,
      bestStreak: 0,
    },

    // Actions
    startGame: (gameMode: GameMode, difficulty: Difficulty) => {
      const duration = gameMode === 'speed' ? 30 : 60
      
      set({
        isActive: true,
        isPaused: false,
        gameMode,
        timeLeft: duration,
        currentScore: 0,
        targets: [],
        settings: {
          gameMode,
          difficulty,
          duration,
          targetSize: difficulty === 'hard' ? 'small' : 'medium',
          spawnRate: gameMode === 'speed' ? 2.5 : 1.5,
        },
        stats: {
          hits: 0,
          misses: 0,
          accuracy: 0,
          averageReactionTime: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      })
    },

    endGame: () => {
      const state = get()
      
      // Award XP before resetting state
      if (state.isActive) {
        state.awardXP()
      }
      
      set({
        isActive: false,
        isPaused: false,
        targets: [],
        gameStartTime: null,
      })
    },

    pauseGame: () => {
      set({ isPaused: true })
    },

    resumeGame: () => {
      set({ isPaused: false })
    },

    // Target management
    addTarget: (target: Target) => {
      set((state) => ({
        targets: [...state.targets, target],
      }))
    },

    removeTarget: (targetId: string) => {
      set((state) => ({
        targets: state.targets.filter((t) => t.id !== targetId),
      }))
    },

    hitTarget: (targetId: string, hitResult: HitResult) => {
      const state = get()
      const newHits = state.stats.hits + 1
      const newTotal = newHits + state.stats.misses
      const newStreak = state.stats.currentStreak + 1
      
      // Track perfect shots (reaction time < 200ms and high accuracy)
      const isPerfect = hitResult.reactionTime < 200 && hitResult.accuracy > 0.9
      const newPerfectShots = isPerfect ? state.perfectShots + 1 : state.perfectShots
      
      // Track consistency (add current reaction time to scores)
      const newConsistencyScores = [...state.consistencyScores, hitResult.reactionTime].slice(-10) // Keep last 10
      
      set({
        targets: state.targets.filter((t) => t.id !== targetId),
        perfectShots: newPerfectShots,
        consistencyScores: newConsistencyScores,
        stats: {
          ...state.stats,
          hits: newHits,
          accuracy: newTotal > 0 ? (newHits / newTotal) * 100 : 0,
          currentStreak: newStreak,
          bestStreak: Math.max(state.stats.bestStreak, newStreak),
          averageReactionTime: state.stats.averageReactionTime > 0 
            ? (state.stats.averageReactionTime + hitResult.reactionTime) / 2 
            : hitResult.reactionTime,
        },
      })
    },

    missTarget: () => {
      const state = get()
      const newMisses = state.stats.misses + 1
      const newTotal = state.stats.hits + newMisses
      
      set({
        stats: {
          ...state.stats,
          misses: newMisses,
          accuracy: newTotal > 0 ? (state.stats.hits / newTotal) * 100 : 0,
          currentStreak: 0, // Reset streak on miss
        },
      })
    },

    // Score management
    updateScore: (points: number) => {
      set((state) => ({
        currentScore: state.currentScore + points,
      }))
    },

    resetScore: () => {
      set({ currentScore: 0 })
    },

    // Time management
    updateTimeLeft: (time: number) => {
      set({ timeLeft: time })
    },

    // Settings
    updateSettings: (newSettings) => {
      set((state) => ({
        settings: state.settings ? { ...state.settings, ...newSettings } : null,
      }))
    },

    // Level integration
    calculateGamePerformance: (): GamePerformance | null => {
      const state = get()
      
      if (!state.settings || !state.gameStartTime) return null
      
      const duration = (Date.now() - state.gameStartTime) / 1000 // seconds
      const totalShots = state.stats.hits + state.stats.misses
      
      // Calculate consistency score (lower standard deviation = higher consistency)
      const consistency = state.consistencyScores.length > 1 
        ? 100 - Math.min(100, (calculateStandardDeviation(state.consistencyScores) / 10))
        : 80 // Default for too few shots
      
      return {
        score: state.currentScore,
        accuracy: state.stats.accuracy,
        reactionTime: state.stats.averageReactionTime,
        hits: state.stats.hits,
        misses: state.stats.misses,
        streak: state.stats.bestStreak,
        gameMode: state.settings.gameMode,
        difficulty: state.settings.difficulty,
        duration,
        perfectShots: state.perfectShots,
        consistency: Math.max(0, Math.min(100, consistency))
      }
    },

    awardXP: () => {
      const state = get()
      const performance = state.calculateGamePerformance()
      
      if (!performance) return
      
      const levelStore = useLevelStore.getState()
      const xpAmount = levelStore.calculateXPFromPerformance(performance)
      
      // Determine XP source based on performance
      let source = 'Game Completed'
      if (performance.accuracy >= 95) source = 'Perfect Accuracy!'
      else if (performance.streak >= 10) source = 'Epic Streak!'
      else if (performance.perfectShots >= 5) source = 'Perfect Shots!'
      
      // Award XP
      levelStore.gainXP(xpAmount, source, performance.gameMode)
    },
  }))
)

// Helper function for consistency calculation
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2))
  const variance = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / values.length
  
  return Math.sqrt(variance)
}

// Subscribe to game end when time runs out
useGameStore.subscribe(
  (state) => state.timeLeft,
  (timeLeft) => {
    if (timeLeft <= 0 && useGameStore.getState().isActive) {
      useGameStore.getState().endGame()
    }
  }
) 