import * as THREE from 'three'

export interface TrackingTarget {
  id: string
  currentPosition: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  movementPattern: MovementPattern
  predictedPath: THREE.Vector3[]
  difficulty: number
  spawnTime: number
  lifetime: number
  size: number
  color: string
}

export interface MovementPattern {
  type: 'linear' | 'circular' | 'zigzag' | 'spiral' | 'random' | 'ai_adaptive'
  speed: number
  amplitude: number
  frequency: number
  direction: THREE.Vector3
  centerPoint: THREE.Vector3
  rotationAxis: THREE.Vector3
  phase: number
}

export interface PredictionChallenge {
  id: string
  name: string
  description: string
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  duration: number
  targetCount: number
  movementPatterns: MovementPattern[]
  predictionRequirement: number // How far ahead user must predict (in seconds)
  scoreMultiplier: number
  aiSettings: {
    adaptationEnabled: boolean
    learningRate: number
    predictionAccuracy: number
  }
}

export interface TrackingAnalysis {
  trackingAccuracy: number // How well user follows targets
  predictionAccuracy: number // How well user predicts target movement
  reactionTime: number
  smoothness: number // How smooth the tracking motion is
  anticipationSkill: number // How well user anticipates direction changes
  consistencyScore: number
  weakPoints: {
    movementType: string
    accuracy: number
    reason: string
  }[]
}

export interface UserTrackingProfile {
  averageTrackingAccuracy: number
  bestMovementType: string
  worstMovementType: string
  predictionSkillLevel: number
  reactionTimeProfile: number
  smoothnessRating: number
  adaptabilityScore: number
  sessionsAnalyzed: number
  improvementRate: number
  lastUpdated: number
}

export class TrackingAI {
  private static readonly PREDICTION_HISTORY_LIMIT = 100
  private static readonly MOVEMENT_BOUNDS = {
    x: { min: -15, max: 15 },
    y: { min: 0.5, max: 8 },
    z: { min: 5, max: 25 }
  }

  // Movement pattern generators
  static generateLinearMovement(
    startPos: THREE.Vector3, 
    direction: THREE.Vector3, 
    speed: number
  ): MovementPattern {
    return {
      type: 'linear',
      speed,
      amplitude: 0,
      frequency: 0,
      direction: direction.normalize(),
      centerPoint: startPos.clone(),
      rotationAxis: new THREE.Vector3(0, 1, 0),
      phase: 0
    }
  }

  static generateCircularMovement(
    center: THREE.Vector3,
    radius: number,
    angularSpeed: number,
    axis: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  ): MovementPattern {
    return {
      type: 'circular',
      speed: angularSpeed,
      amplitude: radius,
      frequency: angularSpeed / (2 * Math.PI),
      direction: new THREE.Vector3(1, 0, 0),
      centerPoint: center.clone(),
      rotationAxis: axis.normalize(),
      phase: Math.random() * Math.PI * 2
    }
  }

  static generateZigzagMovement(
    startPos: THREE.Vector3,
    primaryDirection: THREE.Vector3,
    amplitude: number,
    frequency: number,
    speed: number
  ): MovementPattern {
    return {
      type: 'zigzag',
      speed,
      amplitude,
      frequency,
      direction: primaryDirection.normalize(),
      centerPoint: startPos.clone(),
      rotationAxis: new THREE.Vector3(0, 1, 0),
      phase: 0
    }
  }

  static generateSpiralMovement(
    center: THREE.Vector3,
    initialRadius: number,
    radiusGrowth: number,
    angularSpeed: number
  ): MovementPattern {
    return {
      type: 'spiral',
      speed: angularSpeed,
      amplitude: initialRadius,
      frequency: radiusGrowth,
      direction: new THREE.Vector3(1, 0, 0),
      centerPoint: center.clone(),
      rotationAxis: new THREE.Vector3(0, 1, 0),
      phase: 0
    }
  }

  static generateAdaptiveMovement(
    userProfile: UserTrackingProfile,
    difficulty: number
  ): MovementPattern {
    // AI adapts movement based on user's weaknesses
    const worstType = userProfile.worstMovementType || 'linear'
    const adaptedSpeed = 2 + (difficulty / 100) * 8 // 2-10 speed range
    const adaptedAmplitude = 1 + (difficulty / 100) * 4 // 1-5 amplitude range
    
    // Generate movement that challenges user's weak points
    switch (worstType) {
      case 'circular':
        return this.generateCircularMovement(
          new THREE.Vector3(0, 4, 15),
          adaptedAmplitude,
          adaptedSpeed * 0.5
        )
      case 'zigzag':
        return this.generateZigzagMovement(
          new THREE.Vector3(-10, 4, 15),
          new THREE.Vector3(1, 0, 0),
          adaptedAmplitude,
          adaptedSpeed * 0.3,
          adaptedSpeed
        )
      default:
        return this.generateLinearMovement(
          new THREE.Vector3(-12, 4, 15),
          new THREE.Vector3(1, 0, 0),
          adaptedSpeed
        )
    }
  }

  // Target position calculation
  static updateTargetPosition(
    target: TrackingTarget, 
    deltaTime: number
  ): THREE.Vector3 {
    const pattern = target.movementPattern
    const elapsedTime = (Date.now() - target.spawnTime) / 1000

    switch (pattern.type) {
      case 'linear':
        return this.calculateLinearPosition(pattern, elapsedTime)
      
      case 'circular':
        return this.calculateCircularPosition(pattern, elapsedTime)
      
      case 'zigzag':
        return this.calculateZigzagPosition(pattern, elapsedTime)
      
      case 'spiral':
        return this.calculateSpiralPosition(pattern, elapsedTime)
      
      case 'random':
        return this.calculateRandomPosition(pattern, elapsedTime, deltaTime)
      
      case 'ai_adaptive':
        return this.calculateAdaptivePosition(pattern, elapsedTime)
      
      default:
        return target.currentPosition
    }
  }

  private static calculateLinearPosition(pattern: MovementPattern, time: number): THREE.Vector3 {
    const distance = pattern.speed * time
    const newPos = pattern.centerPoint.clone()
    newPos.add(pattern.direction.clone().multiplyScalar(distance))
    
    // Bounce off boundaries
    if (newPos.x < this.MOVEMENT_BOUNDS.x.min || newPos.x > this.MOVEMENT_BOUNDS.x.max) {
      pattern.direction.x *= -1
    }
    if (newPos.y < this.MOVEMENT_BOUNDS.y.min || newPos.y > this.MOVEMENT_BOUNDS.y.max) {
      pattern.direction.y *= -1
    }
    if (newPos.z < this.MOVEMENT_BOUNDS.z.min || newPos.z > this.MOVEMENT_BOUNDS.z.max) {
      pattern.direction.z *= -1
    }
    
    return newPos.clamp(
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.min, this.MOVEMENT_BOUNDS.y.min, this.MOVEMENT_BOUNDS.z.min),
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.max, this.MOVEMENT_BOUNDS.y.max, this.MOVEMENT_BOUNDS.z.max)
    )
  }

  private static calculateCircularPosition(pattern: MovementPattern, time: number): THREE.Vector3 {
    const angle = pattern.phase + (pattern.speed * time)
    const radius = pattern.amplitude
    
    const x = pattern.centerPoint.x + Math.cos(angle) * radius
    const z = pattern.centerPoint.z + Math.sin(angle) * radius
    const y = pattern.centerPoint.y
    
    return new THREE.Vector3(x, y, z)
  }

  private static calculateZigzagPosition(pattern: MovementPattern, time: number): THREE.Vector3 {
    const primaryDistance = pattern.speed * time
    const zigzagOffset = Math.sin(time * pattern.frequency * Math.PI * 2) * pattern.amplitude
    
    const newPos = pattern.centerPoint.clone()
    newPos.add(pattern.direction.clone().multiplyScalar(primaryDistance))
    
    // Add perpendicular zigzag motion
    const perpendicular = new THREE.Vector3()
    perpendicular.crossVectors(pattern.direction, pattern.rotationAxis).normalize()
    newPos.add(perpendicular.multiplyScalar(zigzagOffset))
    
    return newPos.clamp(
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.min, this.MOVEMENT_BOUNDS.y.min, this.MOVEMENT_BOUNDS.z.min),
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.max, this.MOVEMENT_BOUNDS.y.max, this.MOVEMENT_BOUNDS.z.max)
    )
  }

  private static calculateSpiralPosition(pattern: MovementPattern, time: number): THREE.Vector3 {
    const angle = pattern.speed * time
    const radius = pattern.amplitude + (pattern.frequency * time)
    
    const x = pattern.centerPoint.x + Math.cos(angle) * radius
    const z = pattern.centerPoint.z + Math.sin(angle) * radius
    const y = pattern.centerPoint.y
    
    return new THREE.Vector3(x, y, z)
  }

  private static calculateRandomPosition(
    pattern: MovementPattern, 
    time: number, 
    deltaTime: number
  ): THREE.Vector3 {
    // Smooth random movement with momentum
    const noiseScale = 0.01
    const noiseX = (Math.sin(time * noiseScale * 137) + Math.sin(time * noiseScale * 71)) * 0.5
    const noiseY = (Math.sin(time * noiseScale * 101) + Math.sin(time * noiseScale * 89)) * 0.5
    const noiseZ = (Math.sin(time * noiseScale * 113) + Math.sin(time * noiseScale * 97)) * 0.5
    
    const targetPos = new THREE.Vector3(
      pattern.centerPoint.x + noiseX * pattern.amplitude,
      pattern.centerPoint.y + noiseY * pattern.amplitude * 0.5,
      pattern.centerPoint.z + noiseZ * pattern.amplitude
    )
    
    return targetPos.clamp(
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.min, this.MOVEMENT_BOUNDS.y.min, this.MOVEMENT_BOUNDS.z.min),
      new THREE.Vector3(this.MOVEMENT_BOUNDS.x.max, this.MOVEMENT_BOUNDS.y.max, this.MOVEMENT_BOUNDS.z.max)
    )
  }

  private static calculateAdaptivePosition(pattern: MovementPattern, time: number): THREE.Vector3 {
    // AI-driven adaptive movement that changes based on user performance
    const baseMovement = this.calculateLinearPosition(pattern, time)
    
    // Add unpredictable direction changes
    const changeFrequency = 2.0 // Changes every 2 seconds
    const changePhase = Math.floor(time / changeFrequency)
    
    if (changePhase % 2 === 0) {
      // Sudden direction change
      const newDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ).normalize()
      
      pattern.direction.lerp(newDirection, 0.1)
    }
    
    return baseMovement
  }

  // Prediction algorithms
  static predictTargetPath(
    target: TrackingTarget, 
    predictionTime: number, 
    steps: number = 10
  ): THREE.Vector3[] {
    const path: THREE.Vector3[] = []
    const deltaTime = predictionTime / steps
    
    for (let i = 0; i < steps; i++) {
      const futureTime = i * deltaTime
      const futurePos = this.updateTargetPosition({
        ...target,
        spawnTime: target.spawnTime - futureTime * 1000
      }, deltaTime)
      path.push(futurePos)
    }
    
    return path
  }

  // Performance analysis
  static analyzeTrackingPerformance(
    userPath: THREE.Vector3[],
    targetPath: THREE.Vector3[],
    timestamps: number[]
  ): TrackingAnalysis {
    if (userPath.length === 0 || targetPath.length === 0) {
      return this.getDefaultAnalysis()
    }

    // Calculate tracking accuracy
    const trackingAccuracy = this.calculateTrackingAccuracy(userPath, targetPath)
    
    // Calculate prediction accuracy
    const predictionAccuracy = this.calculatePredictionAccuracy(userPath, targetPath)
    
    // Calculate reaction time
    const reactionTime = this.calculateAverageReactionTime(timestamps)
    
    // Calculate smoothness
    const smoothness = this.calculateMovementSmoothness(userPath)
    
    // Calculate anticipation skill
    const anticipationSkill = this.calculateAnticipationSkill(userPath, targetPath)
    
    // Calculate consistency
    const consistencyScore = this.calculateConsistencyScore(userPath, targetPath)

    return {
      trackingAccuracy,
      predictionAccuracy,
      reactionTime,
      smoothness,
      anticipationSkill,
      consistencyScore,
      weakPoints: this.identifyWeakPoints(userPath, targetPath)
    }
  }

  private static calculateTrackingAccuracy(userPath: THREE.Vector3[], targetPath: THREE.Vector3[]): number {
    let totalDistance = 0
    const minLength = Math.min(userPath.length, targetPath.length)
    
    for (let i = 0; i < minLength; i++) {
      totalDistance += userPath[i].distanceTo(targetPath[i])
    }
    
    const averageDistance = totalDistance / minLength
    return Math.max(0, 100 - (averageDistance * 10)) // Convert to percentage
  }

  private static calculatePredictionAccuracy(userPath: THREE.Vector3[], targetPath: THREE.Vector3[]): number {
    // Analyze how well user predicted target movement
    if (userPath.length < 5 || targetPath.length < 5) return 50
    
    let predictionScore = 0
    const lookAhead = 3 // Look 3 steps ahead
    
    for (let i = 0; i < userPath.length - lookAhead; i++) {
      if (i + lookAhead < targetPath.length) {
        const userDirection = userPath[i + 1].clone().sub(userPath[i]).normalize()
        const targetDirection = targetPath[i + lookAhead].clone().sub(targetPath[i]).normalize()
        const dotProduct = userDirection.dot(targetDirection)
        predictionScore += Math.max(0, dotProduct)
      }
    }
    
    return (predictionScore / (userPath.length - lookAhead)) * 100
  }

  private static calculateAverageReactionTime(timestamps: number[]): number {
    if (timestamps.length < 2) return 300
    
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  }

  private static calculateMovementSmoothness(userPath: THREE.Vector3[]): number {
    if (userPath.length < 3) return 50
    
    let totalJerk = 0
    for (let i = 2; i < userPath.length; i++) {
      const acceleration1 = userPath[i - 1].clone().sub(userPath[i - 2])
      const acceleration2 = userPath[i].clone().sub(userPath[i - 1])
      const jerk = acceleration2.sub(acceleration1).length()
      totalJerk += jerk
    }
    
    const averageJerk = totalJerk / (userPath.length - 2)
    return Math.max(0, 100 - (averageJerk * 50))
  }

  private static calculateAnticipationSkill(userPath: THREE.Vector3[], targetPath: THREE.Vector3[]): number {
    // Measure how well user anticipates direction changes
    if (userPath.length < 10 || targetPath.length < 10) return 50
    
    let anticipationScore = 0
    let directionChanges = 0
    
    for (let i = 3; i < Math.min(userPath.length, targetPath.length) - 3; i++) {
      const targetDir1 = targetPath[i].clone().sub(targetPath[i - 1]).normalize()
      const targetDir2 = targetPath[i + 1].clone().sub(targetPath[i]).normalize()
      
      if (targetDir1.dot(targetDir2) < 0.5) { // Direction change detected
        directionChanges++
        const userDir = userPath[i].clone().sub(userPath[i - 1]).normalize()
        const anticipation = userDir.dot(targetDir2)
        anticipationScore += Math.max(0, anticipation)
      }
    }
    
    return directionChanges > 0 ? (anticipationScore / directionChanges) * 100 : 75
  }

  private static calculateConsistencyScore(userPath: THREE.Vector3[], targetPath: THREE.Vector3[]): number {
    if (userPath.length < 10) return 50
    
    const errors = []
    const minLength = Math.min(userPath.length, targetPath.length)
    
    for (let i = 0; i < minLength; i++) {
      errors.push(userPath[i].distanceTo(targetPath[i]))
    }
    
    const mean = errors.reduce((sum, error) => sum + error, 0) / errors.length
    const variance = errors.reduce((sum, error) => sum + Math.pow(error - mean, 2), 0) / errors.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.max(0, 100 - (standardDeviation * 20))
  }

  private static identifyWeakPoints(
    userPath: THREE.Vector3[], 
    targetPath: THREE.Vector3[]
  ): TrackingAnalysis['weakPoints'] {
    const weakPoints: TrackingAnalysis['weakPoints'] = []
    
    // Analyze different movement phases
    const phases = this.segmentMovementPhases(targetPath)
    
    phases.forEach(phase => {
      const phaseAccuracy = this.calculatePhaseAccuracy(userPath, targetPath, phase.start, phase.end)
      
      if (phaseAccuracy < 60) {
        weakPoints.push({
          movementType: phase.type,
          accuracy: phaseAccuracy,
          reason: this.getWeaknessReason(phase.type, phaseAccuracy)
        })
      }
    })
    
    return weakPoints
  }

  private static segmentMovementPhases(targetPath: THREE.Vector3[]): {
    type: string, start: number, end: number
  }[] {
    // Simple phase detection - can be enhanced with ML
    const phases = []
    let currentPhase = { type: 'linear', start: 0, end: 0 }
    
    for (let i = 1; i < targetPath.length - 1; i++) {
      const dir1 = targetPath[i].clone().sub(targetPath[i - 1]).normalize()
      const dir2 = targetPath[i + 1].clone().sub(targetPath[i]).normalize()
      const curvature = 1 - dir1.dot(dir2)
      
      if (curvature > 0.3) { // Curved movement
        if (currentPhase.type !== 'curved') {
          currentPhase.end = i
          phases.push({...currentPhase})
          currentPhase = { type: 'curved', start: i, end: 0 }
        }
      } else { // Linear movement
        if (currentPhase.type !== 'linear') {
          currentPhase.end = i
          phases.push({...currentPhase})
          currentPhase = { type: 'linear', start: i, end: 0 }
        }
      }
    }
    
    currentPhase.end = targetPath.length - 1
    phases.push(currentPhase)
    
    return phases
  }

  private static calculatePhaseAccuracy(
    userPath: THREE.Vector3[], 
    targetPath: THREE.Vector3[], 
    start: number, 
    end: number
  ): number {
    let totalError = 0
    let count = 0
    
    for (let i = start; i <= end && i < userPath.length && i < targetPath.length; i++) {
      totalError += userPath[i].distanceTo(targetPath[i])
      count++
    }
    
    const averageError = count > 0 ? totalError / count : 5
    return Math.max(0, 100 - (averageError * 10))
  }

  private static getWeaknessReason(movementType: string, accuracy: number): string {
    if (accuracy < 30) {
      return `Very poor ${movementType} tracking - needs fundamental practice`
    } else if (accuracy < 50) {
      return `Weak ${movementType} tracking - requires focused training`
    } else {
      return `Below average ${movementType} tracking - minor improvements needed`
    }
  }

  private static getDefaultAnalysis(): TrackingAnalysis {
    return {
      trackingAccuracy: 0,
      predictionAccuracy: 0,
      reactionTime: 500,
      smoothness: 50,
      anticipationSkill: 50,
      consistencyScore: 50,
      weakPoints: []
    }
  }

  // Challenge generators
  static generatePredictionChallenge(
    difficulty: PredictionChallenge['difficulty'],
    userProfile?: UserTrackingProfile
  ): PredictionChallenge {
    const difficultyMap = {
      bronze: { speed: 2, complexity: 1, prediction: 0.5 },
      silver: { speed: 3, complexity: 2, prediction: 1.0 },
      gold: { speed: 4, complexity: 3, prediction: 1.5 },
      platinum: { speed: 5, complexity: 4, prediction: 2.0 },
      diamond: { speed: 6, complexity: 5, prediction: 2.5 }
    }
    
    const config = difficultyMap[difficulty]
    const patterns: MovementPattern[] = []
    
    // Generate movement patterns based on difficulty
    for (let i = 0; i < config.complexity; i++) {
      if (userProfile && config.complexity > 3) {
        patterns.push(this.generateAdaptiveMovement(userProfile, config.speed * 20))
      } else {
        patterns.push(this.generateRandomPattern(config.speed, config.complexity))
      }
    }
    
    return {
      id: `prediction_${difficulty}_${Date.now()}`,
      name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Prediction Challenge`,
      description: `Track and predict ${config.complexity} moving targets with ${config.prediction}s prediction requirement`,
      difficulty,
      duration: 45000 + (config.complexity * 15000), // 45s base + 15s per complexity
      targetCount: config.complexity,
      movementPatterns: patterns,
      predictionRequirement: config.prediction,
      scoreMultiplier: config.complexity * 0.5,
      aiSettings: {
        adaptationEnabled: difficulty === 'diamond',
        learningRate: 0.1,
        predictionAccuracy: 0.8 + (config.complexity * 0.05)
      }
    }
  }

  private static generateRandomPattern(speed: number, complexity: number): MovementPattern {
    const patterns = ['linear', 'circular', 'zigzag', 'spiral']
    const randomType = patterns[Math.floor(Math.random() * patterns.length)]
    
    const centerPoint = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      2 + Math.random() * 4,
      10 + Math.random() * 10
    )
    
    switch (randomType) {
      case 'circular':
        return this.generateCircularMovement(
          centerPoint,
          2 + Math.random() * 3,
          speed * 0.5
        )
      case 'zigzag':
        return this.generateZigzagMovement(
          centerPoint,
          new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
          1 + Math.random() * 2,
          speed * 0.3,
          speed
        )
      case 'spiral':
        return this.generateSpiralMovement(
          centerPoint,
          1 + Math.random() * 2,
          0.5,
          speed * 0.4
        )
      default: // linear
        return this.generateLinearMovement(
          centerPoint,
          new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
          speed
        )
    }
  }
} 