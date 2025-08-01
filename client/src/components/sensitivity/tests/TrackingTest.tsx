import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../../stores/sensitivityStore'
import { FaArrowsAlt, FaTimes, FaPause, FaPlay } from 'react-icons/fa'
import type { SensitivityTestConfig, SensitivityTestResult } from '../../../../../shared/types'

interface TrackingTestProps {
  config: SensitivityTestConfig
}

interface MovingTarget {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  spawnTime: number
  size: number
  path: Array<{ x: number, y: number, timestamp: number }>
}

interface TrackingResult {
  targetId: string
  trackingAccuracy: number
  trackingTime: number
  averageDistance: number
  consistency: number
}

export const TrackingTest: React.FC<TrackingTestProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const mouseTrajectoryRef = useRef<Array<{x: number, y: number, timestamp: number}>>([])
  
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [targets, setTargets] = useState<MovingTarget[]>([])
  const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([])
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 })
  const [isTracking, setIsTracking] = useState(false)
  const [currentTargetDistance, setCurrentTargetDistance] = useState<number>(0)
  const [averageDistance, setAverageDistance] = useState<number>(0)
  const [trackingAccuracy, setTrackingAccuracy] = useState<number>(100)
  
  const { completeTest, stopTest } = useSensitivityStore()

  // Create moving target with circular or linear movement
  const createMovingTarget = useCallback((canvasWidth: number, canvasHeight: number, currentTime: number) => {
    const margin = 100
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    
    // Create circular movement pattern
    const radius = Math.min(canvasWidth, canvasHeight) * 0.3
    const speed = (config.targetSpeed || 150) / 100 // pixels per frame
    const angle = Math.random() * Math.PI * 2
    
    return {
      id: `tracking-target-${Date.now()}-${Math.random()}`,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      velocityX: -Math.sin(angle) * speed,
      velocityY: Math.cos(angle) * speed,
      spawnTime: currentTime,
      size: (config.targetSize || 1.0) * 60,
      path: []
    }
  }, [config.targetSize, config.targetSpeed])

  // Update target positions
  const updateTargets = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setTargets(prevTargets => 
      prevTargets.map(target => {
        // Update position
        let newX = target.x + target.velocityX
        let newY = target.y + target.velocityY
        let newVelX = target.velocityX
        let newVelY = target.velocityY
        
        // Handle bouncing off walls
        if (newX <= target.size/2 || newX >= canvas.width - target.size/2) {
          newVelX = -newVelX
          newX = Math.max(target.size/2, Math.min(canvas.width - target.size/2, newX))
        }
        if (newY <= target.size/2 || newY >= canvas.height - target.size/2) {
          newVelY = -newVelY
          newY = Math.max(target.size/2, Math.min(canvas.height - target.size/2, newY))
        }
        
        // Add to path
        const newPath = [...target.path, { x: newX, y: newY, timestamp: currentTime }]
        
        return {
          ...target,
          x: newX,
          y: newY,
          velocityX: newVelX,
          velocityY: newVelY,
          path: newPath
        }
      })
    )
  }, [])

  // Calculate tracking accuracy
  const calculateTrackingAccuracy = useCallback((mousePos: { x: number, y: number }, targets: MovingTarget[]) => {
    if (targets.length === 0) return { distance: 0, accuracy: 100 }
    
    const closestTarget = targets.reduce((closest, target) => {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - target.x, 2) + 
        Math.pow(mousePos.y - target.y, 2)
      )
      return distance < closest.distance ? { target, distance } : closest
    }, { target: targets[0], distance: Infinity })
    
    const maxDistance = closestTarget.target.size
    const accuracy = Math.max(0, Math.min(100, (1 - closestTarget.distance / maxDistance) * 100))
    
    return { distance: closestTarget.distance, accuracy }
  }, [])

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    setCrosshairPosition({ x: mouseX, y: mouseY })
    
    if (isStarted && !isPaused) {
      // Record mouse trajectory
      const currentTime = performance.now()
      mouseTrajectoryRef.current.push({
        x: mouseX,
        y: mouseY,
        timestamp: currentTime
      })
      
      // Calculate real-time tracking accuracy
      const { distance, accuracy } = calculateTrackingAccuracy({ x: mouseX, y: mouseY }, targets)
      setCurrentTargetDistance(distance)
      setTrackingAccuracy(accuracy)
      
      // Update average distance
      setAverageDistance(prev => {
        const samples = mouseTrajectoryRef.current.length
        return ((prev * (samples - 1)) + distance) / samples
      })
      
      // Check if mouse is close enough to target (tracking)
      setIsTracking(distance < 100) // Within 100px of target
    }
  }, [isStarted, isPaused, targets, calculateTrackingAccuracy])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isStarted || isPaused) return
    
    const currentTime = performance.now()
    const startTime = startTimeRef.current || currentTime
    const elapsed = (currentTime - startTime) / 1000
    const remaining = Math.max(0, config.duration - elapsed)
    
    setTimeLeft(remaining)
    
    // Check if test should end
    if (remaining <= 0) {
      finishTest()
      return
    }
    
    // Update target positions
    updateTargets(currentTime)
    
    // Spawn targets if needed
    if (targets.length < (config.targetCount || 1)) {
      const canvas = canvasRef.current
      if (canvas) {
        const newTarget = createMovingTarget(canvas.width, canvas.height, currentTime)
        setTargets(prev => [...prev, newTarget])
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isStarted, isPaused, config.duration, config.targetCount, targets.length, updateTargets, createMovingTarget])

  // Finish test and save results
  const finishTest = useCallback(() => {
    setIsStarted(false)
    
    // Calculate final metrics
    const totalTrackingTime = mouseTrajectoryRef.current.length > 0 ? 
      mouseTrajectoryRef.current[mouseTrajectoryRef.current.length - 1].timestamp - 
      mouseTrajectoryRef.current[0].timestamp : 0
      
    const trackingQuality = trackingAccuracy
    const consistency = calculateTrackingConsistency()
    
    const result: SensitivityTestResult = {
      id: `tracking-test-${Date.now()}`,
      testType: 'tracking',
      userId: 'current-user',
      config,
      accuracy: trackingQuality,
      averageTimeToHit: totalTrackingTime / 1000, // Convert to seconds
      totalHits: Math.floor(trackingQuality / 10), // Simulated hits based on tracking quality
      totalMisses: Math.floor((100 - trackingQuality) / 10),
      flickOvershoot: 0, // Not applicable for tracking
      flickUndershoot: 0, // Not applicable for tracking
      trackingStability: consistency,
      correctionEfficiency: trackingQuality,
      reactionConsistency: consistency,
      hitPositions: mouseTrajectoryRef.current.map(pos => ({
        x: pos.x,
        y: pos.y,
        time: pos.timestamp
      })),
      mouseTrajectory: mouseTrajectoryRef.current,
      targetSequence: targets.map(target => ({
        id: target.id,
        spawnTime: target.spawnTime,
        position: { x: target.x, y: target.y },
        wasHit: true // For tracking, we consider "hit" as successful tracking
      })),
      currentSensitivity: 0.5, // From user profile
      currentDPI: 800, // From user profile
      testedAt: new Date().toISOString(),
      sessionDuration: config.duration
    }
    
    completeTest(result)
  }, [trackingAccuracy, targets, config, completeTest])

  // Calculate tracking consistency
  const calculateTrackingConsistency = (): number => {
    if (mouseTrajectoryRef.current.length < 10) return 0
    
    const distances: number[] = []
    for (let i = 1; i < mouseTrajectoryRef.current.length; i++) {
      const prev = mouseTrajectoryRef.current[i - 1]
      const curr = mouseTrajectoryRef.current[i]
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      )
      distances.push(distance)
    }
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = distances.reduce((acc, dist) => acc + Math.pow(dist - avgDistance, 2), 0) / distances.length
    const standardDeviation = Math.sqrt(variance)
    
    // Convert to 0-100 scale (lower standard deviation = higher consistency)
    return Math.max(0, 100 - (standardDeviation * 2))
  }

  // Start test
  const startTest = () => {
    setIsStarted(true)
    setIsPaused(false)
    startTimeRef.current = performance.now()
    mouseTrajectoryRef.current = []
    setTimeLeft(config.duration)
    setTargets([])
    setTrackingResults([])
    setAverageDistance(0)
    setTrackingAccuracy(100)
  }

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Stop test early
  const handleStopTest = () => {
    setIsStarted(false)
    stopTest()
  }

  // Setup game loop
  useEffect(() => {
    if (isStarted && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isStarted, isPaused, gameLoop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaArrowsAlt className="text-2xl text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Tracking Test</h2>
              <p className="text-sm text-slate-400">
                Follow moving targets with smooth, precise movements
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{Math.ceil(timeLeft)}</div>
                <div className="text-slate-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">
                  {Math.round(trackingAccuracy)}%
                </div>
                <div className="text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">
                  {Math.round(currentTargetDistance)}px
                </div>
                <div className="text-slate-400">Distance</div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-lg ${isTracking ? 'text-green-400' : 'text-red-400'}`}>
                  {isTracking ? 'ON' : 'OFF'}
                </div>
                <div className="text-slate-400">Tracking</div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              {!isStarted ? (
                <button
                  onClick={startTest}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-200"
                >
                  <FaPlay className="inline mr-2" />
                  Start Test
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-200"
                  >
                    {isPaused ? <FaPlay className="inline mr-2" /> : <FaPause className="inline mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleStopTest}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-all duration-200"
                  >
                    <FaTimes className="inline mr-2" />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full cursor-none bg-slate-900/50"
          onMouseMove={handleMouseMove}
          style={{ cursor: 'none' }}
        />
        
        {/* Moving Targets */}
        <AnimatePresence>
          {targets.map(target => (
            <motion.div
              key={target.id}
              className="absolute bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-lg pointer-events-none"
              style={{
                left: target.x - target.size / 2,
                top: target.y - target.size / 2,
                width: target.size,
                height: target.size,
              }}
              animate={{
                x: 0,
                y: 0,
              }}
              transition={{
                duration: 0,
                ease: "linear"
              }}
            >
              {/* Target center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
              
              {/* Tracking zone indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/30 rounded-full -mt-10 -ml-10" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Crosshair */}
        {isStarted && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: crosshairPosition.x - 12,
              top: crosshairPosition.y - 12,
            }}
          >
            <div className="w-6 h-6 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white opacity-70 transform -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white opacity-70 transform -translate-x-1/2" />
              <div className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                isTracking ? 'bg-green-500' : 'bg-blue-500'
              }`} />
            </div>
          </div>
        )}
        
        {/* Tracking trail */}
        {isStarted && mouseTrajectoryRef.current.length > 1 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <path
              d={`M ${mouseTrajectoryRef.current.slice(-50).map(pos => `${pos.x},${pos.y}`).join(' L ')}`}
              stroke={isTracking ? '#10b981' : '#3b82f6'}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </svg>
        )}
        
        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="text-center">
              <FaPause className="text-6xl text-white mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-2">Test Paused</h3>
              <p className="text-slate-400">Click Resume to continue</p>
            </div>
          </div>
        )}
        
        {/* Pre-start overlay */}
        {!isStarted && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="text-center max-w-md p-8">
              <FaArrowsAlt className="text-6xl text-blue-500 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-4">Tracking Test</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Keep your crosshair as close as possible to the moving targets. 
                Focus on smooth, consistent tracking movements rather than quick corrections.
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white ml-2">{config.duration}s</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Targets:</span>
                    <span className="text-white ml-2">{config.targetCount || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Speed:</span>
                    <span className="text-white ml-2">
                      {(config.targetSpeed || 150) > 200 ? 'Fast' : 
                       (config.targetSpeed || 150) > 100 ? 'Medium' : 'Slow'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="text-white ml-2 capitalize">{config.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Real-time feedback */}
        {isStarted && !isPaused && (
          <div className="absolute top-4 right-4 bg-slate-800/70 backdrop-blur-sm rounded-lg p-3 z-10">
            <div className="text-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tracking Quality:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-200 ${
                        trackingAccuracy > 80 ? 'bg-green-500' :
                        trackingAccuracy > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${trackingAccuracy}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {Math.round(trackingAccuracy)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}