import { Router, Request, Response } from 'express'
import { prisma } from '../config/database'
// Async handler utility
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
import { verifyFirebaseToken } from '../middleware/firebaseAuth'

const router = Router()

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken)

// Get user's sensitivity profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  let profile = await prisma.sensitivityProfile.findUnique({
    where: { userId },
    include: {
      testResults: {
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50 tests
      },
      recommendations: {
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit to last 10 recommendations
      }
    }
  })

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.sensitivityProfile.create({
      data: {
        userId,
        primaryGame: 'valorant',
        currentSensitivity: 0.5,
        currentDPI: 800,
        preferredPlayStyle: 'hybrid'
      },
      include: {
        testResults: true,
        recommendations: true
      }
    })
  }

  res.json({
    message: 'Profile retrieved successfully',
    data: profile
  })
}))

// Update user's sensitivity profile
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const {
    primaryGame,
    currentSensitivity,
    currentDPI,
    mouseModel,
    monitorSize,
    preferredPlayStyle,
    defaultDuration,
    preferredDifficulty,
    autoStartTests,
    showRealTimeStats
  } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const updatedProfile = await prisma.sensitivityProfile.upsert({
    where: { userId },
    update: {
      ...(primaryGame && { primaryGame }),
      ...(currentSensitivity !== undefined && { currentSensitivity }),
      ...(currentDPI !== undefined && { currentDPI }),
      ...(mouseModel !== undefined && { mouseModel }),
      ...(monitorSize !== undefined && { monitorSize }),
      ...(preferredPlayStyle && { preferredPlayStyle }),
      ...(defaultDuration !== undefined && { defaultDuration }),
      ...(preferredDifficulty && { preferredDifficulty }),
      ...(autoStartTests !== undefined && { autoStartTests }),
      ...(showRealTimeStats !== undefined && { showRealTimeStats })
    },
    create: {
      userId,
      primaryGame: primaryGame || 'valorant',
      currentSensitivity: currentSensitivity || 0.5,
      currentDPI: currentDPI || 800,
      mouseModel,
      monitorSize,
      preferredPlayStyle: preferredPlayStyle || 'hybrid',
      defaultDuration: defaultDuration || 60,
      preferredDifficulty: preferredDifficulty || 'medium',
      autoStartTests: autoStartTests || false,
      showRealTimeStats: showRealTimeStats !== undefined ? showRealTimeStats : true
    },
    include: {
      testResults: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      recommendations: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  res.json({
    message: 'Profile updated successfully',
    data: updatedProfile
  })
}))

// Submit test result
router.post('/test-result', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const {
    testType,
    difficulty,
    duration,
    targetCount,
    targetSize,
    targetSpeed,
    spawnPattern,
    accuracy,
    averageTimeToHit,
    totalHits,
    totalMisses,
    flickOvershoot,
    flickUndershoot,
    trackingStability,
    correctionEfficiency,
    reactionConsistency,
    currentSensitivity,
    currentDPI,
    hitPositions,
    mouseTrajectory,
    targetSequence
  } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  // Get or create sensitivity profile
  let profile = await prisma.sensitivityProfile.findUnique({
    where: { userId }
  })

  if (!profile) {
    profile = await prisma.sensitivityProfile.create({
      data: {
        userId,
        primaryGame: 'valorant',
        currentSensitivity: currentSensitivity || 0.5,
        currentDPI: currentDPI || 800,
        preferredPlayStyle: 'hybrid'
      }
    })
  }

  // Create test result
  const testResult = await prisma.sensitivityTestResult.create({
    data: {
      userId,
      profileId: profile.id,
      testType,
      difficulty,
      duration,
      targetCount,
      targetSize,
      targetSpeed,
      spawnPattern,
      accuracy,
      averageTimeToHit,
      totalHits,
      totalMisses,
      flickOvershoot: flickOvershoot || 0,
      flickUndershoot: flickUndershoot || 0,
      trackingStability: trackingStability || 100,
      correctionEfficiency: correctionEfficiency || 0,
      reactionConsistency: reactionConsistency || 0,
      currentSensitivity,
      currentDPI,
      hitPositions: JSON.stringify(hitPositions || []),
      mouseTrajectory: JSON.stringify(mouseTrajectory || []),
      targetSequence: JSON.stringify(targetSequence || [])
    }
  })

  res.json({
    message: 'Test result saved successfully',
    data: testResult
  })
}))

// Get test results with filtering
router.get('/test-results', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const { 
    testType, 
    limit = '50', 
    offset = '0',
    startDate,
    endDate
  } = req.query

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const profile = await prisma.sensitivityProfile.findUnique({
    where: { userId }
  })

  if (!profile) {
    return res.json({
      message: 'No profile found',
      data: []
    })
  }

  const whereClause: any = {
    profileId: profile.id
  }

  if (testType && testType !== 'all') {
    whereClause.testType = testType
  }

  if (startDate || endDate) {
    whereClause.createdAt = {}
    if (startDate) whereClause.createdAt.gte = new Date(startDate as string)
    if (endDate) whereClause.createdAt.lte = new Date(endDate as string)
  }

  const results = await prisma.sensitivityTestResult.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
    skip: parseInt(offset as string)
  })

  const total = await prisma.sensitivityTestResult.count({
    where: whereClause
  })

  res.json({
    message: 'Test results retrieved successfully',
    data: results,
    total,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  })
}))

// Generate sensitivity recommendation
router.post('/recommendation', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const { testResultIds } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const profile = await prisma.sensitivityProfile.findUnique({
    where: { userId },
    include: {
      testResults: {
        where: testResultIds ? { id: { in: testResultIds } } : {},
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!profile || profile.testResults.length === 0) {
    return res.status(400).json({
      error: 'No test results found for recommendation'
    })
  }

  // Generate recommendation based on test results
  const recommendation = generateSensitivityRecommendation(profile.testResults, profile)

  // Save recommendation
  const savedRecommendation = await prisma.sensitivityRecommendation.create({
    data: {
      userId,
      profileId: profile.id,
      playStyle: recommendation.playStyle,
      recommendedSensitivity: recommendation.recommendedSensitivity,
      confidenceScore: recommendation.confidenceScore,
      reasoning: JSON.stringify(recommendation.reasoning),
      gameRecommendations: JSON.stringify(recommendation.gameRecommendations),
      expectedAccuracyImprovement: recommendation.expectedImprovement.accuracy,
      expectedConsistencyImprovement: recommendation.expectedImprovement.consistency,
      expectedReactionTimeImprovement: recommendation.expectedImprovement.reactionTime,
      basedOnResults: JSON.stringify(testResultIds || profile.testResults.map(r => r.id))
    }
  })

  res.json({
    message: 'Recommendation generated successfully',
    data: {
      ...recommendation,
      id: savedRecommendation.id
    }
  })
}))

// Sensitivity conversion
router.post('/convert', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const {
    fromGame,
    toGame,
    sensitivity,
    dpi
  } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const conversion = calculateSensitivityConversion(fromGame, toGame, sensitivity, dpi)

  // Save conversion for history
  await prisma.sensitivityConversion.create({
    data: {
      userId,
      fromGame,
      toGame,
      fromSensitivity: sensitivity,
      toSensitivity: conversion.toSensitivity,
      fromDPI: dpi,
      toDPI: dpi,
      fromCm360: conversion.fromCm360,
      toCm360: conversion.toCm360,
      effectiveDPIFrom: conversion.effectiveDPIFrom,
      effectiveDPITo: conversion.effectiveDPITo,
      conversionAccuracy: conversion.conversionAccuracy,
      notes: conversion.notes?.join('; ')
    }
  })

  res.json({
    message: 'Sensitivity converted successfully',
    data: conversion
  })
}))

// Get conversion history
router.get('/conversions', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const { limit = '20' } = req.query

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const conversions = await prisma.sensitivityConversion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string)
  })

  res.json({
    message: 'Conversion history retrieved successfully',
    data: conversions
  })
}))

// Generate analytics
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  const profile = await prisma.sensitivityProfile.findUnique({
    where: { userId },
    include: {
      testResults: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' })
  }

  const analytics = generateAnalytics(profile.testResults)

  // Save analytics
  await prisma.sensitivityAnalytics.create({
    data: {
      userId,
      profileId: profile.id,
      totalTests: analytics.overallStats.totalTests,
      averageAccuracy: analytics.overallStats.averageAccuracy,
      averageReactionTime: analytics.overallStats.averageReactionTime,
      mostImprovedMetric: analytics.overallStats.mostImprovedMetric,
      weakestArea: analytics.overallStats.weakestArea,
      strongestArea: analytics.overallStats.strongestArea,
      testAnalytics: JSON.stringify(analytics.testAnalytics),
      heatmapData: JSON.stringify(analytics.heatmapData),
      performanceCharts: JSON.stringify(analytics.performanceCharts),
      improvementSuggestions: JSON.stringify(analytics.improvementSuggestions),
      nextRecommendedTest: analytics.nextRecommendedTest
    }
  })

  res.json({
    message: 'Analytics generated successfully',
    data: analytics
  })
}))

// Delete test result
router.delete('/test-result/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid
  const { id } = req.params

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  // Verify ownership
  const testResult = await prisma.sensitivityTestResult.findUnique({
    where: { id },
    include: { profile: true }
  })

  if (!testResult || testResult.userId !== userId) {
    return res.status(404).json({ error: 'Test result not found' })
  }

  await prisma.sensitivityTestResult.delete({
    where: { id }
  })

  res.json({
    message: 'Test result deleted successfully'
  })
}))

// Clear all user data
router.delete('/profile/clear', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).firebaseUser?.uid

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  // Delete all related data
  await prisma.$transaction([
    prisma.sensitivityAnalytics.deleteMany({ where: { userId } }),
    prisma.sensitivityConversion.deleteMany({ where: { userId } }),
    prisma.sensitivityRecommendation.deleteMany({ where: { userId } }),
    prisma.sensitivityTestResult.deleteMany({ where: { userId } }),
    prisma.sensitivityProfile.delete({ where: { userId } })
  ])

  res.json({
    message: 'All sensitivity data cleared successfully'
  })
}))

// Helper Functions

function generateSensitivityRecommendation(testResults: any[], profile: any) {
  const avgAccuracy = testResults.reduce((acc, r) => acc + r.accuracy, 0) / testResults.length
  const avgReactionTime = testResults.reduce((acc, r) => acc + r.averageTimeToHit, 0) / testResults.length
  
  // Analyze performance patterns
  const flickResults = testResults.filter(r => r.testType === 'flick')
  const trackingResults = testResults.filter(r => r.testType === 'tracking')
  
  let playStyle = profile.preferredPlayStyle
  let recommendedSensitivity = profile.currentSensitivity
  let confidenceScore = 75
  const reasoning: string[] = []
  
  // Determine optimal sensitivity based on performance
  if (flickResults.length > 0 && trackingResults.length > 0) {
    const flickAccuracy = flickResults.reduce((acc, r) => acc + r.accuracy, 0) / flickResults.length
    const trackingAccuracy = trackingResults.reduce((acc, r) => acc + r.accuracy, 0) / trackingResults.length
    
    if (flickAccuracy > trackingAccuracy + 10) {
      playStyle = 'flick-heavy'
      recommendedSensitivity *= 1.15 // Higher sensitivity for flick players
      reasoning.push('Excellent flick performance suggests you can handle higher sensitivity')
      confidenceScore += 10
    } else if (trackingAccuracy > flickAccuracy + 10) {
      playStyle = 'tracking-heavy'
      recommendedSensitivity *= 0.85 // Lower sensitivity for tracking players
      reasoning.push('Strong tracking performance suggests lower sensitivity for precision')
      confidenceScore += 10
    } else {
      playStyle = 'hybrid'
      reasoning.push('Balanced performance across different aim styles')
    }
  }
  
  // Adjust based on overall accuracy
  if (avgAccuracy < 70) {
    recommendedSensitivity *= 0.9
    reasoning.push('Lower sensitivity recommended to improve accuracy')
  } else if (avgAccuracy > 90) {
    recommendedSensitivity *= 1.1
    reasoning.push('High accuracy allows for slightly higher sensitivity')
    confidenceScore += 5
  }
  
  return {
    playStyle,
    recommendedSensitivity: Number(recommendedSensitivity.toFixed(3)),
    confidenceScore: Math.min(100, confidenceScore),
    reasoning,
    gameRecommendations: {},
    expectedImprovement: {
      accuracy: Math.max(0, 100 - avgAccuracy) * 0.1,
      consistency: 8,
      reactionTime: Math.max(0, avgReactionTime - 200) * 0.05
    }
  }
}

function calculateSensitivityConversion(fromGame: string, toGame: string, sensitivity: number, dpi: number) {
  // Game sensitivity multipliers (simplified)
  const gameMultipliers: Record<string, number> = {
    'valorant': 0.07,
    'cs2': 0.022,
    'apex': 0.022,
    'fortnite': 0.0066,
    'overwatch2': 0.0066,
    'cod': 0.0066,
    'rainbow6': 0.00223
  }
  
  const fromMultiplier = gameMultipliers[fromGame] || 0.022
  const toMultiplier = gameMultipliers[toGame] || 0.022
  
  // Calculate cm/360 for source
  const fromCm360 = (360 / (sensitivity * dpi * fromMultiplier)) * 2.54
  
  // Calculate target sensitivity for same cm/360
  const toSensitivity = (360 / (fromCm360 / 2.54)) / (dpi * toMultiplier)
  
  return {
    fromGame,
    toGame,
    fromSensitivity: sensitivity,
    toSensitivity: Number(toSensitivity.toFixed(4)),
    fromDPI: dpi,
    toDPI: dpi,
    fromCm360,
    toCm360: fromCm360,
    effectiveDPIFrom: sensitivity * dpi,
    effectiveDPITo: toSensitivity * dpi,
    conversionAccuracy: 'exact' as const,
    notes: [`Converted from ${fromGame} to ${toGame} maintaining ${fromCm360.toFixed(2)}cm/360`]
  }
}

function generateAnalytics(testResults: any[]) {
  const overallStats = {
    totalTests: testResults.length,
    averageAccuracy: testResults.length > 0 ? testResults.reduce((acc, r) => acc + r.accuracy, 0) / testResults.length : 0,
    averageReactionTime: testResults.length > 0 ? testResults.reduce((acc, r) => acc + r.averageTimeToHit, 0) / testResults.length : 0,
    mostImprovedMetric: 'accuracy',
    weakestArea: 'micro-correction',
    strongestArea: 'flick'
  }
  
  const testTypes = ['flick', 'tracking', 'target-switching', 'micro-correction']
  const testAnalytics: Record<string, any> = {}
  
  testTypes.forEach(testType => {
    const typeResults = testResults.filter(r => r.testType === testType)
    if (typeResults.length > 0) {
      testAnalytics[testType] = {
        averageAccuracy: typeResults.reduce((acc, r) => acc + r.accuracy, 0) / typeResults.length,
        averageReactionTime: typeResults.reduce((acc, r) => acc + r.averageTimeToHit, 0) / typeResults.length,
        improvementTrend: 0.1,
        lastTested: typeResults[0].createdAt,
        bestScore: Math.max(...typeResults.map(r => r.accuracy))
      }
    }
  })
  
  return {
    overallStats,
    testAnalytics,
    heatmapData: { points: [], bounds: { minX: 0, maxX: 1920, minY: 0, maxY: 1080 } },
    performanceCharts: [],
    improvementSuggestions: [
      'Focus on consistency in your weaker test types',
      'Try different sensitivity values to find your optimal setting',
      'Practice regular training sessions to maintain performance'
    ],
    nextRecommendedTest: 'micro-correction'
  }
}

export default router