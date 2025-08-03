import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

import { 
  TrackingAI, 
  type TrackingTarget, 
  type PredictionChallenge, 
  type TrackingAnalysis,
  type UserTrackingProfile,
  type MovementPattern 
} from '@/utils/TrackingAI'
import { useAchievementTracker } from '@/hooks/useAchievementTracker'
import { useGameStore } from '@/stores/gameStore'

import { 
  FaBrain, FaPlay, FaPause, FaStop, FaCrosshairs, FaChartLine, 
  FaEye, FaBolt, FaRocket, FaFire, FaTrophy,
  FaArrowUp, FaArrowDown, FaCheckCircle 
} from 'react-icons/fa'

interface AIPredictionTrainingProps {
  onTrainingComplete?: (analysis: TrackingAnalysis) => void
}

interface TrackingSession {
  targets: TrackingTarget[]
  userPath: THREE.Vector3[]
  targetPaths: { [targetId: string]: THREE.Vector3[] }
  startTime: number
  isActive: boolean
  isPaused: boolean
}

// Simple FPS Camera Controller placeholder
function FPSCameraController({ isActive }: { isActive: boolean }) {
  return null // Placeholder for now
}

export function AIPredictionTraining({ onTrainingComplete }: AIPredictionTrainingProps) {
  // State management
  const [selectedChallenge, setSelectedChallenge] = useState<PredictionChallenge['difficulty']>('silver')
  const [currentChallenge, setCurrentChallenge] = useState<PredictionChallenge | null>(null)
  const [session, setSession] = useState<TrackingSession>({
    targets: [],
    userPath: [],
    targetPaths: {},
    startTime: 0,
    isActive: false,
    isPaused: false
  })
  const [analysis, setAnalysis] = useState<TrackingAnalysis | null>(null)
  const [userProfile, setUserProfile] = useState<UserTrackingProfile>({
    averageTrackingAccuracy: 65,
    bestMovementType: 'linear',
    worstMovementType: 'circular',
    predictionSkillLevel: 60,
    reactionTimeProfile: 320,
    smoothnessRating: 70,
    adaptabilityScore: 55,
    sessionsAnalyzed: 0,
    improvementRate: 0,
    lastUpdated: Date.now()
  })
  const [showPredictionPath, setShowPredictionPath] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Refs
  const mousePositionRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const lastUpdateTime = useRef<number>(Date.now())
  const animationFrame = useRef<number>()

  // Hooks
  const { trackGameCompletion } = useAchievementTracker()
  const gameStore = useGameStore()

  // Challenge configurations
  const challengeConfigs = {
    bronze: { name: 'Bronze', icon: '🥉', color: 'from-amber-600 to-yellow-500', description: 'Basic linear movement' },
    silver: { name: 'Silver', icon: '🥈', color: 'from-gray-400 to-gray-300', description: 'Circular and zigzag patterns' },
    gold: { name: 'Gold', icon: '🥇', color: 'from-yellow-500 to-yellow-400', description: 'Complex spiral movements' },
    platinum: { name: 'Platinum', icon: '💎', color: 'from-blue-400 to-purple-500', description: 'Adaptive AI patterns' },
    diamond: { name: 'Diamond', icon: '💠', color: 'from-purple-500 to-pink-500', description: 'Unpredictable AI-driven targets' }
  }

  // Start training session
  const startTraining = useCallback(() => {
    const challenge = TrackingAI.generatePredictionChallenge(selectedChallenge, userProfile)
    setCurrentChallenge(challenge)
    
    // Generate initial targets
    const targets: TrackingTarget[] = challenge.movementPatterns.map((pattern, index) => ({
      id: `target_${index}_${Date.now()}`,
      currentPosition: pattern.centerPoint.clone(),
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      movementPattern: pattern,
      predictedPath: [],
      difficulty: index + 1,
      spawnTime: Date.now(),
      lifetime: challenge.duration,
      size: 0.4 - (index * 0.05),
      color: `hsl(${120 + index * 60}, 70%, 60%)`
    }))

    setSession({
      targets,
      userPath: [],
      targetPaths: {},
      startTime: Date.now(),
      isActive: true,
      isPaused: false
    })

    setAnalysis(null)
  }, [selectedChallenge, userProfile])

  // Stop training session
  const stopTraining = useCallback(() => {
    if (!session.isActive || !currentChallenge) return

    setSession(prev => ({ ...prev, isActive: false }))

    // Analyze performance
    const primaryTarget = session.targets[0]
    if (primaryTarget && session.userPath.length > 10) {
      const targetPath = session.targetPaths[primaryTarget.id] || []
      const timestamps = session.userPath.map((_, i) => session.startTime + i * 16) // Assume 60fps
      
      const performanceAnalysis = TrackingAI.analyzeTrackingPerformance(
        session.userPath,
        targetPath,
        timestamps
      )

      setAnalysis(performanceAnalysis)
      
      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        averageTrackingAccuracy: (prev.averageTrackingAccuracy + performanceAnalysis.trackingAccuracy) / 2,
        predictionSkillLevel: (prev.predictionSkillLevel + performanceAnalysis.predictionAccuracy) / 2,
        reactionTimeProfile: (prev.reactionTimeProfile + performanceAnalysis.reactionTime) / 2,
        smoothnessRating: (prev.smoothnessRating + performanceAnalysis.smoothness) / 2,
        sessionsAnalyzed: prev.sessionsAnalyzed + 1,
        lastUpdated: Date.now()
      }))

      // Track achievements
      trackGameCompletion({
        gameMode: `ai_tracking_${selectedChallenge}`,
        score: Math.round(performanceAnalysis.trackingAccuracy * 10),
        accuracy: performanceAnalysis.trackingAccuracy,
        hits: Math.round(performanceAnalysis.trackingAccuracy / 10),
        misses: Math.round((100 - performanceAnalysis.trackingAccuracy) / 10),
        duration: Date.now() - session.startTime,
        targetCount: session.targets.length
      })

      onTrainingComplete?.(performanceAnalysis)
    }
  }, [session, currentChallenge, selectedChallenge, trackGameCompletion, onTrainingComplete])

  // Toggle pause
  const togglePause = useCallback(() => {
    setSession(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }, [])

  // Update loop
  useEffect(() => {
    if (!session.isActive || session.isPaused) return

    const updateTargets = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTime.current) / 1000
      lastUpdateTime.current = now

      setSession(prev => {
        const updatedTargets = prev.targets.map(target => {
          const newPosition = TrackingAI.updateTargetPosition(target, deltaTime)
          
          // Update predicted path
          const predictedPath = TrackingAI.predictTargetPath(target, 2.0, 20) // 2 seconds ahead
          
          return {
            ...target,
            currentPosition: newPosition,
            predictedPath
          }
        })

        // Update target paths for analysis
        const newTargetPaths = { ...prev.targetPaths }
        updatedTargets.forEach(target => {
          if (!newTargetPaths[target.id]) {
            newTargetPaths[target.id] = []
          }
          newTargetPaths[target.id].push(target.currentPosition.clone())
        })

        return {
          ...prev,
          targets: updatedTargets,
          targetPaths: newTargetPaths
        }
      })

      // Continue animation
      if (session.isActive && !session.isPaused) {
        animationFrame.current = requestAnimationFrame(updateTargets)
      }
    }

    animationFrame.current = requestAnimationFrame(updateTargets)

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [session.isActive, session.isPaused])

  // Auto-stop when challenge duration ends
  useEffect(() => {
    if (!session.isActive || !currentChallenge) return

    const timeout = setTimeout(() => {
      stopTraining()
    }, currentChallenge.duration)

    return () => clearTimeout(timeout)
  }, [session.isActive, currentChallenge, stopTraining])

  // Mouse tracking
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!session.isActive || session.isPaused) return

    // Convert mouse position to 3D world position (simplified)
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    
    const worldPos = new THREE.Vector3(x * 15, y * 8 + 4, 15)
    mousePositionRef.current = worldPos

    setSession(prev => ({
      ...prev,
      userPath: [...prev.userPath.slice(-100), worldPos.clone()] // Keep last 100 positions
    }))
  }, [session.isActive, session.isPaused])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-400'
    if (value >= 60) return 'text-yellow-400'
    if (value >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800 relative">
      {/* 3D Training Environment */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.6, 0]}
          fov={75}
        />
        
        <FPSCameraController isActive={session.isActive} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Moving Targets */}
        {session.targets.map(target => (
          <MovingTargetMesh
            key={target.id}
            target={target}
            showPrediction={showPredictionPath}
          />
        ))}

        {/* User Cursor */}
        <UserCursorMesh position={mousePositionRef.current} />

        {/* Environment */}
        <gridHelper args={[50, 50, '#333333', '#333333']} position={[0, 0, 0]} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Challenge Info */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FaBrain className="text-purple-400" />
              <span>AI Prediction Training</span>
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-blue-400">Challenge: {challengeConfigs[selectedChallenge].name}</span>
              <span className="text-green-400">Targets: {session.targets.length}</span>
              {currentChallenge && (
                <span className="text-yellow-400">
                  Time: {Math.max(0, Math.round((currentChallenge.duration - (Date.now() - session.startTime)) / 1000))}s
                </span>
              )}
            </div>
          </div>

          {/* Real-time Stats */}
          {session.isActive && (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2 min-w-[200px]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {userProfile.predictionSkillLevel.toFixed(0)}%
                  </div>
                  <div className="text-gray-400">Prediction</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {userProfile.averageTrackingAccuracy.toFixed(0)}%
                  </div>
                  <div className="text-gray-400">Tracking</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
          {/* Challenge Selection */}
          {!session.isActive && (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Select Challenge</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(challengeConfigs).map(([difficulty, config]) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedChallenge(difficulty as PredictionChallenge['difficulty'])}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedChallenge === difficulty
                        ? `bg-gradient-to-r ${config.color} text-white`
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <div className="text-lg">{config.icon}</div>
                    <div className="text-xs">{config.name}</div>
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-gray-400">
                {challengeConfigs[selectedChallenge].description}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center space-x-3">
            {!session.isActive ? (
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
                  {session.isPaused ? <FaPlay /> : <FaPause />}
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

            {/* Settings */}
            <button
              onClick={() => setShowPredictionPath(!showPredictionPath)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                showPredictionPath 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              <FaEye />
            </button>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border border-white/50 rounded-full bg-white/10"></div>
        </div>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-600"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <FaTrophy className="text-yellow-400" />
                  <span>Training Analysis</span>
                </h3>
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { name: 'Tracking Accuracy', value: analysis.trackingAccuracy, icon: FaCrosshairs },
                  { name: 'Prediction Skill', value: analysis.predictionAccuracy, icon: FaBrain },
                  { name: 'Movement Smoothness', value: analysis.smoothness, icon: FaChartLine },
                  { name: 'Reaction Time', value: analysis.reactionTime, icon: FaBolt, unit: 'ms' },
                  { name: 'Anticipation', value: analysis.anticipationSkill, icon: FaEye },
                  { name: 'Consistency', value: analysis.consistencyScore, icon: FaCheckCircle }
                ].map(metric => (
                  <div key={metric.name} className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <metric.icon className="text-blue-400 text-xl" />
                    </div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(metric.value)}`}>
                      {metric.unit === 'ms' ? Math.round(metric.value) : metric.value.toFixed(1)}
                      {metric.unit || '%'}
                    </div>
                    <div className="text-gray-400 text-sm">{metric.name}</div>
                  </div>
                ))}
              </div>

              {/* Weak Points */}
              {analysis.weakPoints.length > 0 && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {analysis.weakPoints.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <FaArrowDown className="text-red-400" />
                        <span className="text-gray-300">
                          <span className="font-medium">{weakness.movementType}</span>: {weakness.reason}
                        </span>
                        <span className={`font-bold ${getPerformanceColor(weakness.accuracy)}`}>
                          {weakness.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Moving Target Component
function MovingTargetMesh({ 
  target, 
  showPrediction 
}: { 
  target: TrackingTarget
  showPrediction: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentPos, setCurrentPos] = useState(target.currentPosition)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(target.currentPosition)
      setCurrentPos(target.currentPosition.clone())
    }
  })

  return (
    <group>
      {/* Main Target */}
      <mesh ref={meshRef} position={currentPos}>
        <sphereGeometry args={[target.size, 16, 16]} />
        <meshStandardMaterial 
          color={target.color}
          emissive={target.color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Prediction Trail */}
      {showPrediction && target.predictedPath.length > 1 && (
        <PredictionTrail path={target.predictedPath} color={target.color} />
      )}
    </group>
  )
}

// Prediction Trail Component - Fixed for Three.js
function PredictionTrail({ path, color }: { path: THREE.Vector3[], color: string }) {
  const lineRef = useRef<THREE.Line>(null)

  useEffect(() => {
    if (lineRef.current && path.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(path)
      lineRef.current.geometry = geometry
    }
  }, [path])

  return (
    <primitive 
      object={new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(path),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
      )}
    />
  )
}

// User Cursor Component
function UserCursorMesh({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  )
} 