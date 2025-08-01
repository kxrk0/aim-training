import type { GameMode, Difficulty, PerformanceMetrics } from '../types'

// Math utilities
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor
}

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1))
}

// Vector3 utilities
export type Vector3 = [number, number, number]

export const vector3Distance = (a: Vector3, b: Vector3): number => {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export const vector3Add = (a: Vector3, b: Vector3): Vector3 => {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export const vector3Multiply = (v: Vector3, scalar: number): Vector3 => {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar]
}

// Game utilities
export const calculateAccuracy = (hits: number, total: number): number => {
  if (total === 0) return 0
  return (hits / total) * 100
}

export const calculateScore = (hits: number, accuracy: number, reactionTime: number, gameMode: GameMode): number => {
  let baseScore = hits * 100
  
  // Accuracy bonus
  const accuracyBonus = accuracy * 10
  
  // Reaction time bonus (lower is better)
  const reactionBonus = Math.max(0, (500 - reactionTime) / 10)
  
  // Mode-specific multipliers
  const modeMultipliers = {
    precision: 1.2,
    speed: 1.0,
    tracking: 1.3,
    flick: 1.1
  }
  
  const finalScore = (baseScore + accuracyBonus + reactionBonus) * modeMultipliers[gameMode]
  return Math.round(finalScore)
}

export const getDifficultyMultiplier = (difficulty: Difficulty): number => {
  const multipliers = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
    expert: 1.6
  }
  return multipliers[difficulty]
}

export const getTargetSizeFromDifficulty = (difficulty: Difficulty): number => {
  const sizes = {
    easy: 0.8,
    medium: 0.5,
    hard: 0.3,
    expert: 0.2
  }
  return sizes[difficulty]
}

export const getSpawnRateFromMode = (gameMode: GameMode, difficulty: Difficulty): number => {
  const baseRates = {
    precision: 1.2,
    speed: 2.5,
    tracking: 1.0,
    flick: 1.5
  }
  
  return baseRates[gameMode] * getDifficultyMultiplier(difficulty)
}

// Performance analysis
export const calculateConsistency = (reactionTimes: number[]): number => {
  if (reactionTimes.length < 2) return 100
  
  const mean = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
  const variance = reactionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length
  const standardDeviation = Math.sqrt(variance)
  
  // Lower standard deviation = higher consistency
  // Normalize to 0-100 scale
  const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100)
  return Math.round(consistencyScore)
}

export const calculateImprovement = (previousScore: number, currentScore: number): number => {
  if (previousScore === 0) return 0
  return ((currentScore - previousScore) / previousScore) * 100
}

export const analyzePerformance = (scores: number[], reactionTimes: number[]): PerformanceMetrics => {
  const totalShots = scores.length
  const hits = scores.filter(score => score > 0).length
  const accuracy = calculateAccuracy(hits, totalShots)
  const averageReactionTime = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
  const consistencyScore = calculateConsistency(reactionTimes)
  
  // Simple improvement calculation (last vs first score)
  const improvementTrend = scores.length > 1 
    ? calculateImprovement(scores[0], scores[scores.length - 1])
    : 0
  
  return {
    accuracy,
    averageReactionTime,
    shotsPerMinute: (totalShots / (reactionTimes.length * averageReactionTime)) * 60000, // Convert to per minute
    consistencyScore,
    improvementTrend
  }
}

// Formatting utilities
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatReactionTime = (ms: number): string => {
  return `${ms.toFixed(0)}ms`
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8
}

// Local storage utilities
export const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error)
  }
}

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error)
    return defaultValue
  }
}

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove from localStorage: ${key}`, error)
  }
}

// Debug utilities
export const debugLog = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_DEBUG === 'true') {
    console.log(`[AimTrainer] ${message}`, data || '')
  }
}

export const performanceLog = (label: string, fn: () => any): any => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  debugLog(`Performance: ${label} took ${(end - start).toFixed(2)}ms`)
  return result
} 