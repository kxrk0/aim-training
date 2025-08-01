import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Get user profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  // Mock user profile data
  res.json({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    level: 15,
    totalScore: 125000,
    accuracy: 87.5,
    averageReactionTime: 245,
    gamesPlayed: 150,
    hoursPlayed: 45.5,
    rank: 'Gold',
    achievements: ['First Shot', 'Speed Demon', 'Accuracy King']
  })
}))

// Update user profile
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const { username, settings } = req.body
  
  // Mock profile update
  res.json({
    message: 'Profile updated successfully',
    data: {
      username,
      settings,
      updatedAt: new Date().toISOString()
    }
  })
}))

// Get user statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // Mock statistics data
  res.json({
    totalGames: 150,
    totalShots: 15000,
    totalHits: 13125,
    accuracy: 87.5,
    averageReactionTime: 245,
    bestScore: 2500,
    favoriteGameMode: 'Precision',
    playtime: {
      total: 45.5,
      thisWeek: 8.2,
      thisMonth: 25.7
    },
    progression: {
      level: 15,
      xp: 12500,
      xpToNextLevel: 2500
    }
  })
}))

export default router 