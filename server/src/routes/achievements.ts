import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { verifyFirebaseToken } from '../middleware/firebaseAuth'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken)

// Get all achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [
        { difficulty: 'asc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })
    
    res.json({ success: true, data: achievements })
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch achievements' })
  }
})

// Get user achievements with progress
router.get('/user', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: [
        { isCompleted: 'asc' },
        { currentProgress: 'desc' }
      ]
    })
    
    res.json({ success: true, data: userAchievements })
  } catch (error) {
    console.error('Failed to fetch user achievements:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch user achievements' })
  }
})

// Track achievement progress
router.post('/track-progress', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { type, data } = req.body

    // Get all active achievements that could be affected by this event
    const eligibleAchievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        OR: [
          { requirement: { contains: type } },
          { category: getAchievementCategory(type) }
        ]
      }
    })

    const updatedAchievements = []
    const newUnlocks = []
    const newRewards = []

    for (const achievement of eligibleAchievements) {
      const userAchievement = await processAchievementProgress(
        userId,
        achievement,
        type,
        data
      )

      if (userAchievement) {
        updatedAchievements.push(userAchievement)
        
        // Check if this achievement was just completed
        if (userAchievement.isCompleted && !userAchievement.completedAt) {
          newUnlocks.push(userAchievement)
          
          // Award any associated rewards
          const rewardUnlocks = await prisma.rewardUnlock.findMany({
            where: { achievementId: achievement.id, isAutomatic: true },
            include: { reward: true }
          })
          
          for (const rewardUnlock of rewardUnlocks) {
            const userReward = await prisma.userReward.create({
              data: {
                userId,
                rewardId: rewardUnlock.rewardId
              },
              include: { reward: true }
            })
            newRewards.push(userReward)
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        updatedAchievements,
        newUnlocks,
        newRewards
      }
    })
  } catch (error) {
    console.error('Failed to track achievement progress:', error)
    res.status(500).json({ success: false, error: 'Failed to track progress' })
  }
})

// Check specific achievement completion
router.post('/:achievementId/check', async (req, res) => {
  try {
    const userId = req.user?.id
    const { achievementId } = req.params
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    })

    if (!achievement) {
      return res.status(404).json({ success: false, error: 'Achievement not found' })
    }

    const userAchievement = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
      include: { achievement: true }
    })

    let completed = false
    if (userAchievement && userAchievement.currentProgress >= achievement.maxProgress) {
      // Mark as completed
      const updatedUserAchievement = await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        },
        include: { achievement: true }
      })
      
      completed = true
      res.json({ success: true, data: { completed, userAchievement: updatedUserAchievement } })
    } else {
      res.json({ success: true, data: { completed, userAchievement } })
    }
  } catch (error) {
    console.error('Failed to check achievement completion:', error)
    res.status(500).json({ success: false, error: 'Failed to check achievement' })
  }
})

// Claim achievement rewards
router.post('/:achievementId/claim', async (req, res) => {
  try {
    const userId = req.user?.id
    const { achievementId } = req.params
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const userAchievement = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
      include: { achievement: true }
    })

    if (!userAchievement || !userAchievement.isCompleted) {
      return res.status(400).json({ success: false, error: 'Achievement not completed' })
    }

    // Get available rewards
    const rewardUnlocks = await prisma.rewardUnlock.findMany({
      where: { achievementId },
      include: { reward: true }
    })

    const claimedRewards = []
    for (const rewardUnlock of rewardUnlocks) {
      // Check if user already has this reward
      const existingUserReward = await prisma.userReward.findUnique({
        where: { userId_rewardId: { userId, rewardId: rewardUnlock.rewardId } }
      })

      if (!existingUserReward) {
        const userReward = await prisma.userReward.create({
          data: {
            userId,
            rewardId: rewardUnlock.rewardId
          },
          include: { reward: true }
        })
        claimedRewards.push(userReward)
      }
    }

    res.json({
      success: true,
      data: {
        userAchievement,
        rewards: claimedRewards
      }
    })
  } catch (error) {
    console.error('Failed to claim achievement rewards:', error)
    res.status(500).json({ success: false, error: 'Failed to claim rewards' })
  }
})

// Helper function to determine achievement category from event type
function getAchievementCategory(eventType: string): string {
  switch (eventType) {
    case 'game_completed':
      return 'training'
    case 'level_up':
      return 'progression'
    case 'accuracy_milestone':
      return 'accuracy'
    case 'streak_achieved':
      return 'streak'
    case 'competition_won':
      return 'competition'
    case 'training_hours':
      return 'training'
    default:
      return 'special'
  }
}

// Helper function to process achievement progress
async function processAchievementProgress(
  userId: string,
  achievement: any,
  eventType: string,
  eventData: any
) {
  try {
    const requirement = JSON.parse(achievement.requirement)
    
    // Get or create user achievement
    let userAchievement = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
      include: { achievement: true }
    })

    if (!userAchievement) {
      userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          currentProgress: 0
        },
        include: { achievement: true }
      })
    }

    // Skip if already completed
    if (userAchievement.isCompleted) {
      return userAchievement
    }

    // Calculate progress based on achievement requirement
    let progressIncrement = 0
    
    switch (requirement.type) {
      case 'games_played':
        if (eventType === 'game_completed') {
          progressIncrement = 1
        }
        break
        
      case 'accuracy_threshold':
        if (eventType === 'accuracy_milestone' && eventData.accuracy >= requirement.accuracy) {
          progressIncrement = 1
        }
        break
        
      case 'streak_count':
        if (eventType === 'streak_achieved' && eventData.streakCount >= requirement.count) {
          progressIncrement = 1
        }
        break
        
      case 'total_score':
        if (eventType === 'game_completed') {
          progressIncrement = eventData.score
        }
        break
        
      case 'level_reached':
        if (eventType === 'level_up' && eventData.newLevel >= requirement.level) {
          progressIncrement = 1
        }
        break
        
      case 'training_hours':
        if (eventType === 'training_hours') {
          progressIncrement = eventData.hoursThisSession || 0
        }
        break
        
      case 'competition_wins':
        if (eventType === 'competition_won') {
          progressIncrement = 1
        }
        break
    }

    if (progressIncrement > 0) {
      const newProgress = Math.min(
        userAchievement.currentProgress + progressIncrement,
        achievement.maxProgress
      )
      
      const isCompleted = newProgress >= achievement.maxProgress
      
      const updatedUserAchievement = await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          currentProgress: newProgress,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          progressData: JSON.stringify(eventData)
        },
        include: { achievement: true }
      })
      
      return updatedUserAchievement
    }
    
    return userAchievement
  } catch (error) {
    console.error('Failed to process achievement progress:', error)
    return null
  }
}

export default router 