import type { GamePerformance } from '@/stores/levelStore'

export interface UserSkillProfile {
  overallSkill: number // 0-100 skill rating
  accuracyRating: number // 0-100
  speedRating: number // 0-100  
  consistencyRating: number // 0-100
  flickSkill: number // 0-100
  trackingSkill: number // 0-100
  precisionSkill: number // 0-100
  
  // Performance trends
  improvementRate: number // -100 to +100 (improvement/decline rate)
  confidence: number // 0-100 (how confident we are in the rating)
  
  // Adaptive metrics
  optimalDifficulty: number // 0-100 recommended difficulty
  challengeThreshold: number // Point where user starts to struggle
  comfortZone: number // Point where user performs consistently
  
  lastUpdated: number
  sessionsAnalyzed: number
}

export interface DifficultyRecommendation {
  targetDifficulty: number // 0-100
  reason: string
  adjustmentType: 'increase' | 'decrease' | 'maintain'
  confidence: number // 0-100
  
  // Specific adjustments
  targetSize: number // Multiplier for target size
  spawnRate: number // Multiplier for spawn rate
  targetLifetime: number // Multiplier for target lifetime
  movementSpeed: number // Multiplier for movement speed
  
  // Training recommendations
  recommendedModes: string[]
  focusAreas: string[] // Areas that need improvement
}

export interface PerformanceAnalysis {
  currentSession: {
    trend: 'improving' | 'declining' | 'stable'
    strength: number // 0-100 how strong the trend is
  }
  
  recentPerformance: {
    averageAccuracy: number
    averageReactionTime: number
    averageConsistency: number
    performanceStability: number // How consistent performance is
  }
  
  skillGaps: {
    accuracy: number // -100 to +100 (negative = below average)
    speed: number
    consistency: number
  }
  
  adaptationNeeded: boolean
  frustrationRisk: number // 0-100 (risk of user getting frustrated)
  boredomRisk: number // 0-100 (risk of user getting bored)
}

export class DifficultyAI {
  private static readonly PERFORMANCE_HISTORY_LIMIT = 50
  private static readonly CONFIDENCE_THRESHOLD = 70
  private static readonly ADAPTATION_SENSITIVITY = 0.15 // How quickly to adapt
  
  // Skill rating thresholds
  private static readonly SKILL_THRESHOLDS = {
    beginner: 20,
    intermediate: 40,
    advanced: 60,
    expert: 80,
    master: 95
  }

  // Performance tracking
  private static performanceHistory: GamePerformance[] = []
  
  /**
   * Main entry point - analyze user and provide difficulty recommendation
   */
  static analyzeAndRecommend(
    currentPerformance: GamePerformance,
    userProfile: UserSkillProfile,
    currentDifficulty: number
  ): { profile: UserSkillProfile; recommendation: DifficultyRecommendation; analysis: PerformanceAnalysis } {
    
    // Update performance history
    this.updatePerformanceHistory(currentPerformance)
    
    // Analyze current performance trends
    const analysis = this.analyzePerformance()
    
    // Update user skill profile
    const updatedProfile = this.updateSkillProfile(userProfile, currentPerformance, analysis)
    
    // Generate difficulty recommendation
    const recommendation = this.generateRecommendation(updatedProfile, analysis, currentDifficulty)
    
    return {
      profile: updatedProfile,
      recommendation,
      analysis
    }
  }

  /**
   * Create initial skill profile for new users
   */
  static createInitialProfile(): UserSkillProfile {
    return {
      overallSkill: 30, // Start slightly below average
      accuracyRating: 30,
      speedRating: 30,
      consistencyRating: 30,
      flickSkill: 30,
      trackingSkill: 30,
      precisionSkill: 30,
      
      improvementRate: 0,
      confidence: 20, // Low confidence initially
      
      optimalDifficulty: 25,
      challengeThreshold: 40,
      comfortZone: 20,
      
      lastUpdated: Date.now(),
      sessionsAnalyzed: 0
    }
  }

  /**
   * Update performance history with latest session
   */
  private static updatePerformanceHistory(performance: GamePerformance): void {
    this.performanceHistory.push(performance)
    
    // Keep only recent performances
    if (this.performanceHistory.length > this.PERFORMANCE_HISTORY_LIMIT) {
      this.performanceHistory = this.performanceHistory.slice(-this.PERFORMANCE_HISTORY_LIMIT)
    }
  }

  /**
   * Analyze recent performance trends and patterns
   */
  private static analyzePerformance(): PerformanceAnalysis {
    if (this.performanceHistory.length < 3) {
      return this.getDefaultAnalysis()
    }

    const recent = this.performanceHistory.slice(-10) // Last 10 sessions
    const older = this.performanceHistory.slice(-20, -10) // Previous 10 sessions
    
    // Calculate trends
    const recentAvgAccuracy = this.average(recent.map(p => p.accuracy))
    const olderAvgAccuracy = older.length > 0 ? this.average(older.map(p => p.accuracy)) : recentAvgAccuracy
    
    const recentAvgReaction = this.average(recent.map(p => p.reactionTime))
    const olderAvgReaction = older.length > 0 ? this.average(older.map(p => p.reactionTime)) : recentAvgReaction
    
    const recentAvgConsistency = this.average(recent.map(p => p.consistency))
    const olderAvgConsistency = older.length > 0 ? this.average(older.map(p => p.consistency)) : recentAvgConsistency

    // Determine trend direction
    const accuracyTrend = recentAvgAccuracy - olderAvgAccuracy
    const reactionTrend = olderAvgReaction - recentAvgReaction // Lower reaction time = improvement
    const consistencyTrend = recentAvgConsistency - olderAvgConsistency
    
    const overallTrend = (accuracyTrend + reactionTrend + consistencyTrend) / 3
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (overallTrend > 2) trend = 'improving'
    else if (overallTrend < -2) trend = 'declining'

    // Calculate performance stability
    const accuracyStdDev = this.standardDeviation(recent.map(p => p.accuracy))
    const stabilityScore = Math.max(0, 100 - (accuracyStdDev * 2))

    // Skill gap analysis (compare to expected performance)
    const expectedAccuracy = this.getExpectedPerformance('accuracy', recentAvgAccuracy)
    const expectedReaction = this.getExpectedPerformance('reaction', recentAvgReaction)
    const expectedConsistency = this.getExpectedPerformance('consistency', recentAvgConsistency)

    return {
      currentSession: {
        trend,
        strength: Math.abs(overallTrend) * 10
      },
      recentPerformance: {
        averageAccuracy: recentAvgAccuracy,
        averageReactionTime: recentAvgReaction,
        averageConsistency: recentAvgConsistency,
        performanceStability: stabilityScore
      },
      skillGaps: {
        accuracy: (recentAvgAccuracy - expectedAccuracy) / expectedAccuracy * 100,
        speed: (expectedReaction - recentAvgReaction) / expectedReaction * 100,
        consistency: (recentAvgConsistency - expectedConsistency) / expectedConsistency * 100
      },
      adaptationNeeded: Math.abs(overallTrend) > 5,
      frustrationRisk: this.calculateFrustrationRisk(recent),
      boredomRisk: this.calculateBoredomRisk(recent)
    }
  }

  /**
   * Update user skill profile based on performance
   */
  private static updateSkillProfile(
    currentProfile: UserSkillProfile,
    performance: GamePerformance,
    analysis: PerformanceAnalysis
  ): UserSkillProfile {
    
    const adaptationRate = Math.min(0.3, this.ADAPTATION_SENSITIVITY * (1 + currentProfile.sessionsAnalyzed * 0.01))
    
    // Update skill ratings based on performance
    const accuracyRating = this.updateSkillRating(currentProfile.accuracyRating, performance.accuracy, adaptationRate)
    const speedRating = this.updateSkillRating(currentProfile.speedRating, this.reactionTimeToRating(performance.reactionTime), adaptationRate)
    const consistencyRating = this.updateSkillRating(currentProfile.consistencyRating, performance.consistency, adaptationRate)
    
    // Update mode-specific skills
    const flickSkill = performance.gameMode === 'flick' 
      ? this.updateSkillRating(currentProfile.flickSkill, (performance.accuracy + this.reactionTimeToRating(performance.reactionTime)) / 2, adaptationRate)
      : currentProfile.flickSkill
      
    const trackingSkill = performance.gameMode === 'tracking'
      ? this.updateSkillRating(currentProfile.trackingSkill, (performance.accuracy + performance.consistency) / 2, adaptationRate)
      : currentProfile.trackingSkill
      
    const precisionSkill = performance.gameMode === 'precision'
      ? this.updateSkillRating(currentProfile.precisionSkill, performance.accuracy, adaptationRate)
      : currentProfile.precisionSkill

    // Calculate overall skill
    const overallSkill = (accuracyRating + speedRating + consistencyRating + flickSkill + trackingSkill + precisionSkill) / 6

    // Update improvement rate
    const improvementRate = analysis.currentSession.trend === 'improving' ? analysis.currentSession.strength :
                           analysis.currentSession.trend === 'declining' ? -analysis.currentSession.strength : 0

    // Update confidence (more sessions = higher confidence)
    const confidence = Math.min(100, currentProfile.confidence + 2)

    // Calculate optimal difficulty
    const optimalDifficulty = this.calculateOptimalDifficulty(overallSkill, analysis)

    return {
      ...currentProfile,
      accuracyRating,
      speedRating,
      consistencyRating,
      flickSkill,
      trackingSkill,
      precisionSkill,
      overallSkill,
      improvementRate,
      confidence,
      optimalDifficulty,
      challengeThreshold: optimalDifficulty + 20,
      comfortZone: optimalDifficulty - 10,
      lastUpdated: Date.now(),
      sessionsAnalyzed: currentProfile.sessionsAnalyzed + 1
    }
  }

  /**
   * Generate difficulty recommendation
   */
  private static generateRecommendation(
    profile: UserSkillProfile,
    analysis: PerformanceAnalysis,
    currentDifficulty: number
  ): DifficultyRecommendation {
    
    let targetDifficulty = profile.optimalDifficulty
    let adjustmentType: 'increase' | 'decrease' | 'maintain' = 'maintain'
    let reason = 'Maintaining current difficulty based on stable performance'

    // Decide on difficulty adjustment
    if (analysis.boredomRisk > 70) {
      targetDifficulty = Math.min(100, currentDifficulty + 15)
      adjustmentType = 'increase'
      reason = 'Increasing difficulty to prevent boredom - performance is too consistent'
    } else if (analysis.frustrationRisk > 70) {
      targetDifficulty = Math.max(0, currentDifficulty - 15)
      adjustmentType = 'decrease'
      reason = 'Decreasing difficulty to reduce frustration - performance is declining'
    } else if (analysis.currentSession.trend === 'improving' && analysis.currentSession.strength > 15) {
      targetDifficulty = Math.min(100, currentDifficulty + 10)
      adjustmentType = 'increase'
      reason = 'Increasing difficulty based on strong improvement trend'
    } else if (analysis.currentSession.trend === 'declining' && analysis.currentSession.strength > 15) {
      targetDifficulty = Math.max(0, currentDifficulty - 10)
      adjustmentType = 'decrease'
      reason = 'Decreasing difficulty based on declining performance'
    }

    // Calculate specific game adjustments
    const difficultyRatio = targetDifficulty / 100
    const targetSize = Math.max(0.4, 1.2 - (difficultyRatio * 0.8)) // Smaller targets for higher difficulty
    const spawnRate = 0.8 + (difficultyRatio * 0.4) // Faster spawning for higher difficulty
    const targetLifetime = Math.max(0.3, 1.0 - (difficultyRatio * 0.7)) // Shorter lifetime for higher difficulty
    const movementSpeed = 0.5 + (difficultyRatio * 1.0) // Faster movement for higher difficulty

    // Generate training recommendations
    const recommendedModes = this.getRecommendedModes(profile, analysis)
    const focusAreas = this.getFocusAreas(analysis)

    return {
      targetDifficulty,
      reason,
      adjustmentType,
      confidence: Math.min(100, profile.confidence + (analysis.recentPerformance.performanceStability / 2)),
      targetSize,
      spawnRate,
      targetLifetime,
      movementSpeed,
      recommendedModes,
      focusAreas
    }
  }

  // Helper methods
  private static updateSkillRating(current: number, newValue: number, rate: number): number {
    return Math.max(0, Math.min(100, current + (newValue - current) * rate))
  }

  private static reactionTimeToRating(reactionTime: number): number {
    // Convert reaction time to 0-100 rating (lower time = higher rating)
    return Math.max(0, Math.min(100, 100 - ((reactionTime - 100) / 10)))
  }

  private static calculateOptimalDifficulty(skill: number, analysis: PerformanceAnalysis): number {
    // Optimal difficulty should challenge user without frustrating them
    let optimal = skill * 0.8 // Start at 80% of skill level
    
    // Adjust based on frustration/boredom risk
    if (analysis.frustrationRisk > 50) optimal -= 10
    if (analysis.boredomRisk > 50) optimal += 10
    
    return Math.max(0, Math.min(100, optimal))
  }

  private static calculateFrustrationRisk(performances: GamePerformance[]): number {
    if (performances.length < 3) return 0
    
    const recent = performances.slice(-3)
    const declineCount = recent.filter((p, i) => i > 0 && p.accuracy < recent[i-1].accuracy).length
    const lowAccuracyCount = recent.filter(p => p.accuracy < 60).length
    
    return Math.min(100, (declineCount * 25) + (lowAccuracyCount * 20))
  }

  private static calculateBoredomRisk(performances: GamePerformance[]): number {
    if (performances.length < 5) return 0
    
    const consistentHighPerformance = performances.slice(-5).filter(p => p.accuracy > 85).length
    const lowVariation = this.standardDeviation(performances.slice(-5).map(p => p.accuracy)) < 5
    
    return Math.min(100, (consistentHighPerformance * 15) + (lowVariation ? 25 : 0))
  }

  private static getRecommendedModes(profile: UserSkillProfile, analysis: PerformanceAnalysis): string[] {
    const modes: string[] = []
    
    // Recommend modes based on skill gaps
    if (analysis.skillGaps.accuracy < -20) modes.push('precision')
    if (analysis.skillGaps.speed < -20) modes.push('speed')
    if (analysis.skillGaps.consistency < -20) modes.push('tracking')
    
    // Recommend advanced modes for high-skill users
    if (profile.overallSkill > 70) {
      modes.push('advanced-flick', 'multishot')
    }
    
    return modes.length > 0 ? modes : ['precision'] // Default recommendation
  }

  private static getFocusAreas(analysis: PerformanceAnalysis): string[] {
    const areas: string[] = []
    
    if (analysis.skillGaps.accuracy < -15) areas.push('Accuracy Training')
    if (analysis.skillGaps.speed < -15) areas.push('Reaction Time')
    if (analysis.skillGaps.consistency < -15) areas.push('Consistency')
    if (analysis.recentPerformance.performanceStability < 60) areas.push('Stability')
    
    return areas
  }

  private static getExpectedPerformance(metric: string, current: number): number {
    // Simple baseline expectations
    const baselines = { accuracy: 70, reaction: 400, consistency: 60 }
    return baselines[metric as keyof typeof baselines] || current
  }

  private static getDefaultAnalysis(): PerformanceAnalysis {
    return {
      currentSession: { trend: 'stable', strength: 0 },
      recentPerformance: { averageAccuracy: 0, averageReactionTime: 0, averageConsistency: 0, performanceStability: 50 },
      skillGaps: { accuracy: 0, speed: 0, consistency: 0 },
      adaptationNeeded: false,
      frustrationRisk: 0,
      boredomRisk: 0
    }
  }

  private static average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0
  }

  private static standardDeviation(numbers: number[]): number {
    if (numbers.length < 2) return 0
    const avg = this.average(numbers)
    const squareDiffs = numbers.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(this.average(squareDiffs))
  }
} 