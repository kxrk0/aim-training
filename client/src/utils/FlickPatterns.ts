import * as THREE from 'three'

export interface FlickTarget {
  id: string
  position: [number, number, number]
  angle: number // Angle from center in degrees
  distance: number // Distance from center
  zone: 'near' | 'medium' | 'far'
  difficulty: number // 1-10 difficulty scale
  spawnTime: number
  expectedReactionTime: number // Expected time based on distance/angle
}

export interface FlickPattern {
  id: string
  name: string
  description: string
  targets: FlickTarget[]
  duration: number
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
}

export type PatternType = 
  | 'cardinal' // N, S, E, W directions
  | 'diagonal' // NE, NW, SE, SW directions  
  | 'clock' // 12 positions like clock
  | 'spiral' // Spiral outward pattern
  | 'random' // Random 360° placement
  | 'adaptive' // Adapts based on user performance

export class FlickPatternGenerator {
  private static readonly DISTANCE_ZONES = {
    near: { min: 8, max: 12 },
    medium: { min: 15, max: 20 },
    far: { min: 25, max: 35 }
  }

  private static readonly DIFFICULTY_MODIFIERS = {
    bronze: { sizeMultiplier: 1.2, timeMultiplier: 1.3 },
    silver: { sizeMultiplier: 1.0, timeMultiplier: 1.0 },
    gold: { sizeMultiplier: 0.8, timeMultiplier: 0.8 },
    platinum: { sizeMultiplier: 0.6, timeMultiplier: 0.6 },
    diamond: { sizeMultiplier: 0.4, timeMultiplier: 0.4 }
  }

  // Generate targets in cardinal directions (N, S, E, W)
  static generateCardinalPattern(difficulty: FlickPattern['difficulty']): FlickPattern {
    const angles = [0, 90, 180, 270] // N, E, S, W
    const targets: FlickTarget[] = []
    
    angles.forEach((angle, index) => {
      const zone: FlickTarget['zone'] = index < 2 ? 'medium' : 'far'
      const distance = this.getRandomDistanceForZone(zone)
      const position = this.angleToPosition(angle, distance)
      
      targets.push({
        id: `cardinal_${angle}_${Date.now()}`,
        position,
        angle,
        distance,
        zone,
        difficulty: this.calculateTargetDifficulty(distance, zone),
        spawnTime: Date.now() + (index * 2000), // 2s intervals
        expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
      })
    })

    return {
      id: `cardinal_${Date.now()}`,
      name: 'Cardinal Directions',
      description: 'Flick to North, East, South, West positions',
      targets,
      duration: 10000, // 10 seconds
      difficulty
    }
  }

  // Generate targets in diagonal directions (NE, NW, SE, SW)
  static generateDiagonalPattern(difficulty: FlickPattern['difficulty']): FlickPattern {
    const angles = [45, 135, 225, 315] // NE, SE, SW, NW
    const targets: FlickTarget[] = []
    
    angles.forEach((angle, index) => {
      const zone: FlickTarget['zone'] = index % 2 === 0 ? 'medium' : 'far'
      const distance = this.getRandomDistanceForZone(zone)
      const position = this.angleToPosition(angle, distance)
      
      targets.push({
        id: `diagonal_${angle}_${Date.now()}`,
        position,
        angle,
        distance,
        zone,
        difficulty: this.calculateTargetDifficulty(distance, zone) + 1, // Diagonals are harder
        spawnTime: Date.now() + (index * 1800),
        expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
      })
    })

    return {
      id: `diagonal_${Date.now()}`,
      name: 'Diagonal Precision',
      description: 'Flick to diagonal positions with precision',
      targets,
      duration: 8000,
      difficulty
    }
  }

  // Generate 12 targets in clock positions
  static generateClockPattern(difficulty: FlickPattern['difficulty']): FlickPattern {
    const targets: FlickTarget[] = []
    
    for (let hour = 1; hour <= 12; hour++) {
      const angle = (hour * 30) - 90 // Convert hour to angle (12 o'clock = 0°)
      const zone: FlickTarget['zone'] = hour % 3 === 0 ? 'far' : hour % 2 === 0 ? 'medium' : 'near'
      const distance = this.getRandomDistanceForZone(zone)
      const position = this.angleToPosition(angle, distance)
      
      targets.push({
        id: `clock_${hour}_${Date.now()}`,
        position,
        angle,
        distance,
        zone,
        difficulty: this.calculateTargetDifficulty(distance, zone),
        spawnTime: Date.now() + (hour * 1200), // 1.2s intervals
        expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
      })
    }

    return {
      id: `clock_${Date.now()}`,
      name: 'Clock Sweep',
      description: 'Follow the clock from 1 to 12 o\'clock',
      targets,
      duration: 15000,
      difficulty
    }
  }

  // Generate spiral pattern moving outward
  static generateSpiralPattern(difficulty: FlickPattern['difficulty']): FlickPattern {
    const targets: FlickTarget[] = []
    const spiralTurns = 3
    const targetsPerTurn = 8
    
    for (let turn = 0; turn < spiralTurns; turn++) {
      for (let step = 0; step < targetsPerTurn; step++) {
        const angle = (turn * 360) + (step * (360 / targetsPerTurn))
        const progressRatio = (turn * targetsPerTurn + step) / (spiralTurns * targetsPerTurn)
        
        // Distance increases as we spiral outward
        const minDist = this.DISTANCE_ZONES.near.min
        const maxDist = this.DISTANCE_ZONES.far.max
        const distance = minDist + (progressRatio * (maxDist - minDist))
        
        const zone: FlickTarget['zone'] = distance < 15 ? 'near' : distance < 25 ? 'medium' : 'far'
        const position = this.angleToPosition(angle, distance)
        
        targets.push({
          id: `spiral_${turn}_${step}_${Date.now()}`,
          position,
          angle,
          distance,
          zone,
          difficulty: this.calculateTargetDifficulty(distance, zone) + Math.floor(progressRatio * 3),
          spawnTime: Date.now() + ((turn * targetsPerTurn + step) * 800),
          expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
        })
      }
    }

    return {
      id: `spiral_${Date.now()}`,
      name: 'Spiral Challenge',
      description: 'Follow the spiral pattern from center to edge',
      targets,
      duration: 20000,
      difficulty
    }
  }

  // Generate random 360° flick targets
  static generateRandomPattern(
    targetCount: number, 
    difficulty: FlickPattern['difficulty'],
    focusZone?: FlickTarget['zone']
  ): FlickPattern {
    const targets: FlickTarget[] = []
    
    for (let i = 0; i < targetCount; i++) {
      const angle = Math.random() * 360
      const zone: FlickTarget['zone'] = focusZone || this.getRandomZone()
      const distance = this.getRandomDistanceForZone(zone)
      const position = this.angleToPosition(angle, distance)
      
      targets.push({
        id: `random_${i}_${Date.now()}`,
        position,
        angle,
        distance,
        zone,
        difficulty: this.calculateTargetDifficulty(distance, zone),
        spawnTime: Date.now() + (i * 1500),
        expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
      })
    }

    return {
      id: `random_${Date.now()}`,
      name: 'Random Flicks',
      description: `${targetCount} random targets across all zones`,
      targets,
      duration: targetCount * 1500,
      difficulty
    }
  }

  // Generate adaptive pattern based on user performance
  static generateAdaptivePattern(
    userStats: {
      averageReactionTime: number
      accuracy: number
      bestZone: FlickTarget['zone']
      worstZone: FlickTarget['zone']
    },
    difficulty: FlickPattern['difficulty']
  ): FlickPattern {
    const targets: FlickTarget[] = []
    
    // Focus more on worst performing zone
    const zoneDistribution = {
      [userStats.worstZone]: 0.5, // 50% worst zone
      [userStats.bestZone]: 0.2, // 20% best zone
      'medium': 0.3 // 30% medium zone
    }

    const targetCount = 12
    const zones = Object.keys(zoneDistribution) as FlickTarget['zone'][]
    
    for (let i = 0; i < targetCount; i++) {
      // Weighted zone selection
      const rand = Math.random()
      let cumulativeWeight = 0
      let selectedZone: FlickTarget['zone'] = 'medium'
      
      for (const [zone, weight] of Object.entries(zoneDistribution)) {
        cumulativeWeight += weight
        if (rand <= cumulativeWeight) {
          selectedZone = zone as FlickTarget['zone']
          break
        }
      }
      
      const angle = Math.random() * 360
      const distance = this.getRandomDistanceForZone(selectedZone)
      const position = this.angleToPosition(angle, distance)
      
      targets.push({
        id: `adaptive_${i}_${Date.now()}`,
        position,
        angle,
        distance,
        zone: selectedZone,
        difficulty: this.calculateTargetDifficulty(distance, selectedZone),
        spawnTime: Date.now() + (i * Math.max(800, userStats.averageReactionTime * 1.2)),
        expectedReactionTime: this.calculateExpectedReactionTime(distance, difficulty)
      })
    }

    return {
      id: `adaptive_${Date.now()}`,
      name: 'Adaptive Training',
      description: 'Personalized pattern based on your performance',
      targets,
      duration: targetCount * Math.max(800, userStats.averageReactionTime * 1.2),
      difficulty
    }
  }

  // Utility functions
  private static angleToPosition(angle: number, distance: number): [number, number, number] {
    const radians = (angle * Math.PI) / 180
    const x = Math.cos(radians) * distance
    const z = Math.sin(radians) * distance
    const y = 1.6 + (Math.random() - 0.5) * 2 // Eye level ± 1 unit
    
    return [x, y, z]
  }

  private static getRandomDistanceForZone(zone: FlickTarget['zone']): number {
    const zoneConfig = this.DISTANCE_ZONES[zone]
    return zoneConfig.min + Math.random() * (zoneConfig.max - zoneConfig.min)
  }

  private static getRandomZone(): FlickTarget['zone'] {
    const zones: FlickTarget['zone'][] = ['near', 'medium', 'far']
    return zones[Math.floor(Math.random() * zones.length)]
  }

  private static calculateTargetDifficulty(distance: number, zone: FlickTarget['zone']): number {
    const baseDifficulty = {
      near: 3,
      medium: 5,
      far: 7
    }[zone]
    
    // Add difficulty based on exact distance within zone
    const zoneConfig = this.DISTANCE_ZONES[zone]
    const distanceRatio = (distance - zoneConfig.min) / (zoneConfig.max - zoneConfig.min)
    
    return Math.min(10, baseDifficulty + Math.floor(distanceRatio * 2))
  }

  private static calculateExpectedReactionTime(
    distance: number, 
    difficulty: FlickPattern['difficulty']
  ): number {
    const baseTimes = {
      bronze: 800,
      silver: 600,
      gold: 450,
      platinum: 350,
      diamond: 250
    }
    
    const baseTime = baseTimes[difficulty]
    const distanceMultiplier = Math.max(0.8, Math.min(2.0, distance / 20))
    
    return Math.round(baseTime * distanceMultiplier)
  }
}

// Pre-defined pattern presets
export const FLICK_PATTERN_PRESETS = {
  beginner: {
    cardinal: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateCardinalPattern(difficulty),
    random_near: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateRandomPattern(6, difficulty, 'near')
  },
  
  intermediate: {
    diagonal: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateDiagonalPattern(difficulty),
    clock: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateClockPattern(difficulty),
    random_mixed: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateRandomPattern(10, difficulty)
  },
  
  advanced: {
    spiral: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateSpiralPattern(difficulty),
    random_far: (difficulty: FlickPattern['difficulty']) => 
      FlickPatternGenerator.generateRandomPattern(12, difficulty, 'far'),
    adaptive: (difficulty: FlickPattern['difficulty'], userStats: any) => 
      FlickPatternGenerator.generateAdaptivePattern(userStats, difficulty)
  }
} 