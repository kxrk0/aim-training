import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Get global leaderboard
router.get('/global', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode = 'precision', limit = 10 } = req.query
  
  // Mock global leaderboard data
  const mockLeaderboard = Array.from({ length: Number(limit) }, (_, i) => ({
    rank: i + 1,
    username: `Player${i + 1}`,
    score: 2500 - (i * 50),
    accuracy: 95 - (i * 2),
    reactionTime: 180 + (i * 10),
    country: ['US', 'CA', 'UK', 'DE', 'FR'][i % 5],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`
  }))
  
  res.json({
    gameMode,
    leaderboard: mockLeaderboard,
    totalPlayers: 10000,
    lastUpdated: new Date().toISOString()
  })
}))

// Get daily leaderboard
router.get('/daily', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode = 'precision' } = req.query
  
  // Mock daily leaderboard
  res.json({
    gameMode,
    period: 'daily',
    leaderboard: [
      { rank: 1, username: 'DailyChamp', score: 2450, accuracy: 94.5, country: 'US' },
      { rank: 2, username: 'SpeedDemon', score: 2380, accuracy: 91.2, country: 'CA' },
      { rank: 3, username: 'PrecisionPro', score: 2290, accuracy: 96.1, country: 'UK' }
    ],
    resetsIn: '18h 23m',
    totalParticipants: 1250
  })
}))

// Get weekly leaderboard
router.get('/weekly', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode = 'precision' } = req.query
  
  // Mock weekly leaderboard
  res.json({
    gameMode,
    period: 'weekly',
    leaderboard: [
      { rank: 1, username: 'WeeklyKing', score: 2500, accuracy: 95.8, country: 'DE' },
      { rank: 2, username: 'ConsistentAim', score: 2445, accuracy: 93.2, country: 'FR' },
      { rank: 3, username: 'SteadyShooter', score: 2390, accuracy: 94.7, country: 'US' }
    ],
    resetsIn: '4d 12h',
    totalParticipants: 5430
  })
}))

// Get user rank
router.get('/user-rank', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode = 'precision' } = req.query
  
  // Mock user rank data
  res.json({
    gameMode,
    globalRank: 1247,
    dailyRank: 156,
    weeklyRank: 89,
    score: 1850,
    accuracy: 87.5,
    percentile: 82.3,
    pointsToNextRank: 150,
    trend: 'up' // up, down, stable
  })
}))

export default router 