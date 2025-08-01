import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { GameState, GameMode, Difficulty, Target, HitResult } from '../../../shared/types'

interface GameStoreState extends GameState {
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
      set({
        isActive: false,
        isPaused: false,
        targets: [],
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
      
      set({
        targets: state.targets.filter((t) => t.id !== targetId),
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
  }))
)

// Subscribe to game end when time runs out
useGameStore.subscribe(
  (state) => state.timeLeft,
  (timeLeft) => {
    if (timeLeft <= 0 && useGameStore.getState().isActive) {
      useGameStore.getState().endGame()
    }
  }
) 