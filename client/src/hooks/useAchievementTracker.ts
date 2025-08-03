import { useEffect, useCallback } from 'react'
import { useAchievementStore, AchievementProgressEvent } from '@/stores/achievementStore'
import { useAuthStore } from '@/stores/authStore'
import { useLevelStore } from '@/stores/levelStore'

export function useAchievementTracker() {
  const { user } = useAuthStore()
  const { trackProgress } = useAchievementStore()
  const { currentLevel } = useLevelStore()

  // Track game completion
  const trackGameCompletion = useCallback(async (gameData: {
    gameMode: string
    score: number
    accuracy: number
    hits: number
    misses: number
    duration: number
    targetCount: number
  }) => {
    if (!user) return

    const event: AchievementProgressEvent = {
      type: 'game_completed',
      data: {
        gameMode: gameData.gameMode,
        score: gameData.score,
        accuracy: gameData.accuracy,
        hits: gameData.hits,
        misses: gameData.misses,
        duration: gameData.duration,
        targetCount: gameData.targetCount,
        averageReactionTime: gameData.duration / gameData.hits || 0
      },
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track game completion achievement:', error)
    }
  }, [user, trackProgress])

  // Track level up
  const trackLevelUp = useCallback(async (newLevel: number, oldLevel: number) => {
    if (!user || newLevel <= oldLevel) return

    const event: AchievementProgressEvent = {
      type: 'level_up',
      data: {
        newLevel,
        oldLevel,
        levelGain: newLevel - oldLevel
      },
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track level up achievement:', error)
    }
  }, [user, trackProgress])

  // Track accuracy milestones
  const trackAccuracyMilestone = useCallback(async (accuracy: number, gameMode: string) => {
    if (!user) return

    // Only track significant accuracy milestones
    const milestones = [50, 60, 70, 80, 85, 90, 95, 98, 99]
    const achievedMilestone = milestones.find(milestone => 
      accuracy >= milestone && accuracy < milestone + 5
    )

    if (!achievedMilestone) return

    const event: AchievementProgressEvent = {
      type: 'accuracy_milestone',
      data: {
        accuracy,
        milestone: achievedMilestone,
        gameMode
      },
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track accuracy milestone achievement:', error)
    }
  }, [user, trackProgress])

  // Track streak achievements
  const trackStreakAchieved = useCallback(async (streakCount: number, gameMode: string) => {
    if (!user) return

    const event: AchievementProgressEvent = {
      type: 'streak_achieved',
      data: {
        streakCount,
        gameMode
      },
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track streak achievement:', error)
    }
  }, [user, trackProgress])

  // Track competition wins
  const trackCompetitionWin = useCallback(async (competitionData: {
    competitionType: '1v1' | 'tournament' | 'party_challenge'
    opponent?: string
    score: number
    difficulty: string
  }) => {
    if (!user) return

    const event: AchievementProgressEvent = {
      type: 'competition_won',
      data: competitionData,
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track competition win achievement:', error)
    }
  }, [user, trackProgress])

  // Track training hours
  const trackTrainingTime = useCallback(async (sessionDuration: number, totalHours: number) => {
    if (!user) return

    // Only track every 30 minutes to avoid spam
    if (sessionDuration % 1800 !== 0) return

    const event: AchievementProgressEvent = {
      type: 'training_hours',
      data: {
        sessionDuration,
        totalHours,
        hoursThisSession: sessionDuration / 3600
      },
      userId: user.id,
      timestamp: new Date().toISOString()
    }

    try {
      await trackProgress(event)
    } catch (error) {
      console.error('Failed to track training hours achievement:', error)
    }
  }, [user, trackProgress])

  // Auto-track level changes
  useEffect(() => {
    const previousLevel = parseInt(localStorage.getItem('previousLevel') || '1')
    if (currentLevel > previousLevel) {
      trackLevelUp(currentLevel, previousLevel)
      localStorage.setItem('previousLevel', currentLevel.toString())
    }
  }, [currentLevel, trackLevelUp])

  return {
    trackGameCompletion,
    trackLevelUp,
    trackAccuracyMilestone,
    trackStreakAchieved,
    trackCompetitionWin,
    trackTrainingTime
  }
} 