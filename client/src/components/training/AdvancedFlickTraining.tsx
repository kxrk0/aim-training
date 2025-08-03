import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

import { FlickPatternGenerator, FLICK_PATTERN_PRESETS, type FlickPattern, type FlickTarget, type PatternType } from '@/utils/FlickPatterns'
import { useAchievementTracker } from '@/hooks/useAchievementTracker'
import { useGameStore } from '@/stores/gameStore'

import { FaPlay, FaPause, FaStop, FaTrophy, FaBullseye, FaClock, FaFire, FaChevronDown } from 'react-icons/fa'

// Simple FPS Camera Controller placeholder
function FPSCameraController({ isActive }: { isActive: boolean }) {
  return null // Placeholder for now
}

// Simple Shooting System placeholder
function ShootingSystem({ 
  isActive, 
  onTargetHit 
}: { 
  isActive: boolean
  onTargetHit: (targetId: string, accuracy: number, distance: number) => void 
}) {
  return null // Placeholder for now
}

interface AdvancedFlickTarget {
  flickTarget: FlickTarget
  isActive: boolean
  isHit: boolean
}

interface FlickAnalytics {
  totalTargets: number
  hits: number
  misses: number
  accuracy: number
  averageReactionTime: number
  averageFlickDistance: number
  zoneAccuracy: {
    near: { hits: number; total: number }
    medium: { hits: number; total: number }
    far: { hits: number; total: number }
  }
  angleAccuracy: Record<string, { hits: number; total: number }> // Angle ranges
  perfectFlicks: number // < 300ms reaction time
  overshootCount: number
  undershootCount: number
}

export function AdvancedFlickTraining() {
  // State
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('cardinal')
  const [selectedDifficulty, setSelectedDifficulty] = useState<FlickPattern['difficulty']>('silver')
  const [currentPattern, setCurrentPattern] = useState<FlickPattern | null>(null)
  const [targets, setTargets] = useState<AdvancedFlickTarget[]>([])
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [analytics, setAnalytics] = useState<FlickAnalytics>({
    totalTargets: 0,
    hits: 0,
    misses: 0,
    accuracy: 0,
    averageReactionTime: 0,
    averageFlickDistance: 0,
    zoneAccuracy: {
      near: { hits: 0, total: 0 },
      medium: { hits: 0, total: 0 },
      far: { hits: 0, total: 0 }
    },
    angleAccuracy: {},
    perfectFlicks: 0,
    overshootCount: 0,
    undershootCount: 0
  })
  const [showPatternSelect, setShowPatternSelect] = useState(false)
  
  // Refs
  const sessionStartTime = useRef<number>(0)
  const targetTimeouts = useRef<NodeJS.Timeout[]>([])
  
  // Hooks
  const { trackGameCompletion, trackStreakAchieved } = useAchievementTracker()
  const gameStore = useGameStore()

  // Pattern configuration
  const patternTypes: Record<PatternType, { name: string; description: string; icon: string }> = {
    cardinal: { name: 'Cardinal', description: 'N, S, E, W directions', icon: '🧭' },
    diagonal: { name: 'Diagonal', description: 'NE, NW, SE, SW positions', icon: '📐' },
    clock: { name: 'Clock', description: '12 o\'clock positions', icon: '🕐' },
    spiral: { name: 'Spiral', description: 'Spiral from center outward', icon: '🌀' },
    random: { name: 'Random', description: '360° random placement', icon: '🎲' },
    adaptive: { name: 'Adaptive', description: 'AI-adjusted based on performance', icon: '🧠' }
  }

  // Start training session
  const startTraining = useCallback(() => {
    let pattern: FlickPattern

    // Generate pattern based on selection
    switch (selectedPattern) {
      case 'cardinal':
        pattern = FLICK_PATTERN_PRESETS.beginner.cardinal(selectedDifficulty)
        break
      case 'diagonal':
        pattern = FLICK_PATTERN_PRESETS.intermediate.diagonal(selectedDifficulty)
        break
      case 'clock':
        pattern = FLICK_PATTERN_PRESETS.intermediate.clock(selectedDifficulty)
        break
      case 'spiral':
        pattern = FLICK_PATTERN_PRESETS.advanced.spiral(selectedDifficulty)
        break
      case 'random':
        pattern = FLICK_PATTERN_PRESETS.intermediate.random_mixed(selectedDifficulty)
        break
      case 'adaptive':
        // Use user stats for adaptive pattern
        const userStats = {
          averageReactionTime: gameStore.stats.averageReactionTime || 500,
          accuracy: gameStore.stats.accuracy || 70,
          bestZone: 'near' as const,
          worstZone: 'far' as const
        }
        pattern = FLICK_PATTERN_PRESETS.advanced.adaptive(selectedDifficulty, userStats)
        break
    }

    setCurrentPattern(pattern)
    setCurrentTargetIndex(0)
    setIsActive(true)
    setIsPaused(false)
    sessionStartTime.current = Date.now()

    // Reset analytics
    setAnalytics({
      totalTargets: pattern.targets.length,
      hits: 0,
      misses: 0,
      accuracy: 0,
      averageReactionTime: 0,
      averageFlickDistance: 0,
      zoneAccuracy: {
        near: { hits: 0, total: 0 },
        medium: { hits: 0, total: 0 },
        far: { hits: 0, total: 0 }
      },
      angleAccuracy: {},
      perfectFlicks: 0,
      overshootCount: 0,
      undershootCount: 0
    })

    // Convert pattern targets to active targets
    const activeTargets: AdvancedFlickTarget[] = pattern.targets.map(flickTarget => ({
      flickTarget,
      isActive: false,
      isHit: false
    }))
    setTargets(activeTargets)

    // Schedule target activations
    pattern.targets.forEach((target, index) => {
      const timeout = setTimeout(() => {
        if (isActive && !isPaused) {
          setTargets(prev => 
            prev.map((t, i) => 
              i === index ? { ...t, isActive: true } : t
            )
          )
          setCurrentTargetIndex(index)
        }
      }, target.spawnTime - Date.now())
      
      targetTimeouts.current.push(timeout)
    })

  }, [selectedPattern, selectedDifficulty, isActive, isPaused, gameStore.stats])

  // Stop training
  const stopTraining = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setCurrentPattern(null)
    setTargets([])
    setCurrentTargetIndex(0)
    
    // Clear all timeouts
    targetTimeouts.current.forEach(timeout => clearTimeout(timeout))
    targetTimeouts.current = []

    // Track completion for achievements
    if (analytics.totalTargets > 0) {
      trackGameCompletion({
        gameMode: `advanced_flick_${selectedPattern}`,
        score: Math.round(analytics.accuracy * 10),
        accuracy: analytics.accuracy,
        hits: analytics.hits,
        misses: analytics.misses,
        duration: Date.now() - sessionStartTime.current,
        targetCount: analytics.totalTargets
      })

      // Track streak achievements
      if (analytics.hits >= 5) {
        trackStreakAchieved(analytics.hits, `advanced_flick_${selectedPattern}`)
      }
    }
  }, [analytics, selectedPattern, trackGameCompletion, trackStreakAchieved])

  // Pause/Resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Handle target hit
  const handleTargetHit = useCallback((targetId: string, accuracy: number, distance: number) => {
    const hitTime = Date.now()
    const targetIndex = targets.findIndex(t => t.flickTarget.id === targetId)
    
    if (targetIndex === -1) return

    const target = targets[targetIndex]
    const reactionTime = hitTime - target.flickTarget.spawnTime
    const expectedTime = target.flickTarget.expectedReactionTime

    // Update target state
    setTargets(prev => 
      prev.map((t, i) => 
        i === targetIndex ? { ...t, isHit: true, isActive: false } : t
      )
    )

    // Update analytics
    setAnalytics(prev => {
      const newHits = prev.hits + 1
      const newTotalAttempts = newHits + prev.misses
      const isPerfectFlick = reactionTime < 300 && accuracy > 0.9

      // Zone accuracy
      const zoneKey = target.flickTarget.zone
      const newZoneAccuracy = {
        ...prev.zoneAccuracy,
        [zoneKey]: {
          hits: prev.zoneAccuracy[zoneKey].hits + 1,
          total: prev.zoneAccuracy[zoneKey].total + 1
        }
      }

      // Angle accuracy (group by 45° segments)
      const angleSegment = Math.floor(target.flickTarget.angle / 45) * 45
      const angleKey = `${angleSegment}-${angleSegment + 45}`
      const newAngleAccuracy = {
        ...prev.angleAccuracy,
        [angleKey]: {
          hits: (prev.angleAccuracy[angleKey]?.hits || 0) + 1,
          total: (prev.angleAccuracy[angleKey]?.total || 0) + 1
        }
      }

      return {
        ...prev,
        hits: newHits,
        accuracy: (newHits / newTotalAttempts) * 100,
        averageReactionTime: (prev.averageReactionTime * (newHits - 1) + reactionTime) / newHits,
        averageFlickDistance: (prev.averageFlickDistance * (newHits - 1) + target.flickTarget.distance) / newHits,
        zoneAccuracy: newZoneAccuracy,
        angleAccuracy: newAngleAccuracy,
        perfectFlicks: isPerfectFlick ? prev.perfectFlicks + 1 : prev.perfectFlicks,
        overshootCount: reactionTime > expectedTime * 1.5 ? prev.overshootCount + 1 : prev.overshootCount
      }
    })

    // Move to next target
    if (targetIndex < targets.length - 1) {
      setCurrentTargetIndex(targetIndex + 1)
    } else {
      // Training complete
      setTimeout(stopTraining, 1000)
    }
  }, [targets, stopTraining])

  // Handle target miss (timeout)
  const handleTargetMiss = useCallback((targetId: string) => {
    const targetIndex = targets.findIndex(t => t.flickTarget.id === targetId)
    
    if (targetIndex === -1) return

    const target = targets[targetIndex]
    
    // Update analytics
    setAnalytics(prev => {
      const newMisses = prev.misses + 1
      const newTotalAttempts = prev.hits + newMisses

      // Zone accuracy
      const zoneKey = target.flickTarget.zone
      const newZoneAccuracy = {
        ...prev.zoneAccuracy,
        [zoneKey]: {
          ...prev.zoneAccuracy[zoneKey],
          total: prev.zoneAccuracy[zoneKey].total + 1
        }
      }

      // Angle accuracy
      const angleSegment = Math.floor(target.flickTarget.angle / 45) * 45
      const angleKey = `${angleSegment}-${angleSegment + 45}`
      const newAngleAccuracy = {
        ...prev.angleAccuracy,
        [angleKey]: {
          hits: prev.angleAccuracy[angleKey]?.hits || 0,
          total: (prev.angleAccuracy[angleKey]?.total || 0) + 1
        }
      }

      return {
        ...prev,
        misses: newMisses,
        accuracy: prev.hits > 0 ? (prev.hits / newTotalAttempts) * 100 : 0,
        zoneAccuracy: newZoneAccuracy,
        angleAccuracy: newAngleAccuracy,
        undershootCount: prev.undershootCount + 1
      }
    })

    // Remove missed target
    setTargets(prev => 
      prev.map((t, i) => 
        i === targetIndex ? { ...t, isActive: false } : t
      )
    )
  }, [targets])

  // Auto-remove targets after timeout
  useEffect(() => {
    targets.forEach((target, index) => {
      if (target.isActive && !target.isHit) {
        const timeout = setTimeout(() => {
          handleTargetMiss(target.flickTarget.id)
        }, 3000) // 3 second timeout

        return () => clearTimeout(timeout)
      }
    })
  }, [targets, handleTargetMiss])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      targetTimeouts.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 relative">
      {/* Training Arena */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.6, 0]}
          fov={75}
        />
        
        <FPSCameraController isActive={isActive} />
        <ShootingSystem 
          isActive={isActive && !isPaused} 
          onTargetHit={handleTargetHit} 
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Advanced Flick Targets */}
        {targets.map((target, index) => 
          target.isActive && !target.isHit && (
            <AdvancedFlickTargetMesh
              key={target.flickTarget.id}
              flickTarget={target.flickTarget}
              onHit={handleTargetHit}
              isCurrentTarget={index === currentTargetIndex}
            />
          )
        )}

        {/* Distance Zone Indicators */}
        <ZoneIndicators />
        
        {/* Environment */}
        <gridHelper args={[100, 100, '#333333', '#333333']} position={[0, 0, 0]} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Training Info */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{patternTypes[selectedPattern].icon}</span>
              <span>Advanced Flick: {patternTypes[selectedPattern].name}</span>
            </h2>
            <p className="text-gray-300 text-sm">{patternTypes[selectedPattern].description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-blue-400">Difficulty: {selectedDifficulty.toUpperCase()}</span>
              <span className="text-green-400">Progress: {currentTargetIndex + 1}/{analytics.totalTargets}</span>
            </div>
          </div>

          {/* Real-time Analytics */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2 min-w-[200px]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.hits}</div>
                <div className="text-gray-400">Hits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.misses}</div>
                <div className="text-gray-400">Misses</div>
              </div>
              <div className="text-center col-span-2">
                <div className="text-xl font-bold text-yellow-400">{analytics.accuracy.toFixed(1)}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
          {/* Pattern Selection */}
          {!isActive && (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Training Configuration</h3>
              
              {/* Pattern Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowPatternSelect(!showPatternSelect)}
                  className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white flex items-center justify-between hover:bg-gray-600/50 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <span>{patternTypes[selectedPattern].icon}</span>
                    <span>{patternTypes[selectedPattern].name}</span>
                  </span>
                  <FaChevronDown className={`transition-transform ${showPatternSelect ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showPatternSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full mb-2 w-full bg-gray-800 border border-gray-600/30 rounded-lg overflow-hidden shadow-xl z-10"
                    >
                      {Object.entries(patternTypes).map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedPattern(type as PatternType)
                            setShowPatternSelect(false)
                          }}
                          className={`w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-600/20 last:border-b-0 ${
                            selectedPattern === type ? 'bg-blue-600/20 text-blue-400' : 'text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{config.icon}</span>
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-xs text-gray-400">{config.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Difficulty Selector */}
              <div className="flex space-x-2">
                {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center space-x-3">
            {!isActive ? (
              <motion.button
                onClick={startTraining}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay />
                <span>Start Training</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={togglePause}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPaused ? <FaPlay /> : <FaPause />}
                </motion.button>
                
                <motion.button
                  onClick={stopTraining}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaStop />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border border-white/50 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>
  )
}

// Individual Target Component
function AdvancedFlickTargetMesh({ 
  flickTarget, 
  onHit, 
  isCurrentTarget 
}: { 
  flickTarget: FlickTarget
  onHit: (targetId: string, accuracy: number, distance: number) => void
  isCurrentTarget: boolean 
}) {
  const [isHit, setIsHit] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  const handleClick = useCallback((event: any) => {
    if (isHit) return
    
    const intersectPoint = event.point as THREE.Vector3
    const targetCenter = new THREE.Vector3(...flickTarget.position)
    const distance = intersectPoint.distanceTo(targetCenter)
    const accuracy = Math.max(0, Math.min(1, 1 - (distance / 0.5))) // 0.5 unit radius for perfect accuracy
    
    setIsHit(true)
    onHit(flickTarget.id, accuracy, flickTarget.distance)
  }, [flickTarget, onHit, isHit])

  const getZoneColor = () => {
    switch (flickTarget.zone) {
      case 'near': return '#00ff88'
      case 'medium': return '#ffaa00'
      case 'far': return '#ff4444'
      default: return '#00ff88'
    }
  }

  const targetSize = 0.3 + (flickTarget.difficulty / 10) * 0.2

  return (
    <group position={flickTarget.position}>
      {/* Target sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        scale={isCurrentTarget ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      >
        <sphereGeometry args={[targetSize, 16, 16]} />
        <meshStandardMaterial 
          color={getZoneColor()}
          emissive={getZoneColor()}
          emissiveIntensity={isCurrentTarget ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Zone indicator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[targetSize * 1.5, targetSize * 1.8, 16]} />
        <meshBasicMaterial 
          color={getZoneColor()}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Current target pulse */}
      {isCurrentTarget && (
        <mesh scale={[2, 2, 2]}>
          <sphereGeometry args={[targetSize, 8, 8]} />
          <meshBasicMaterial 
            color={getZoneColor()}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  )
}

// Zone Indicators Component
function ZoneIndicators() {
  return (
    <group>
      {/* Near zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[8, 12, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.1} />
      </mesh>
      
      {/* Medium zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[15, 20, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.1} />
      </mesh>
      
      {/* Far zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[25, 35, 32]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.1} />
      </mesh>
    </group>
  )
} 