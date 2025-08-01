import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Start a new game session
router.post('/start', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode, difficulty } = req.body
  
  // Mock game session creation
  res.json({
    sessionId: `session_${Date.now()}`,
    gameMode,
    difficulty,
    startTime: new Date().toISOString(),
    status: 'active',
    settings: {
      duration: gameMode === 'speed' ? 30 : 60,
      targetCount: gameMode === 'precision' ? 25 : 50,
      targetSize: difficulty === 'easy' ? 40 : difficulty === 'hard' ? 20 : 30
    }
  })
}))

// End game session
router.post('/end', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, score, accuracy, reactionTime, hits, misses } = req.body
  
  // Mock game session end
  res.json({
    sessionId,
    endTime: new Date().toISOString(),
    finalScore: score,
    accuracy,
    averageReactionTime: reactionTime,
    totalHits: hits,
    totalMisses: misses,
    ranking: 'A+',
    xpEarned: Math.floor(score / 10),
    newPersonalBest: score > 2000
  })
}))

// Get game history
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  // Mock game history
  res.json({
    games: [
      {
        id: '1',
        gameMode: 'precision',
        score: 2350,
        accuracy: 89.2,
        reactionTime: 234,
        playedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        gameMode: 'speed',
        score: 1890,
        accuracy: 78.5,
        reactionTime: 189,
        playedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ],
    totalGames: 150,
    averageScore: 1725,
    bestScore: 2500
  })
}))

// Submit score
router.post('/submit-score', asyncHandler(async (req: Request, res: Response) => {
  const { gameMode, score, accuracy, reactionTime, difficulty } = req.body
  
  // Mock score submission
  res.json({
    scoreId: `score_${Date.now()}`,
    submitted: true,
    newRank: score > 2000 ? 15 : 14,
    leaderboardPosition: Math.floor(Math.random() * 100) + 1,
    personalBest: score > 2000
  })
}))

export default router 