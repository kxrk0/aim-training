import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../../stores/sensitivityStore'
import { FaCrosshairs, FaTimes, FaPause, FaPlay } from 'react-icons/fa'
import type { SensitivityTestConfig, SensitivityTestResult } from '../../../../../shared/types'

interface MicroCorrectionTestProps {
  config: SensitivityTestConfig
}

interface MicroTarget {
  id: string
  x: number
  y: number
  spawnTime: number
  size: number
  precision: number // How precise the hit needs to be (0-1)
  jitterAmount: number
  jitterDirection: { x: number, y: number }
}

export const MicroCorrectionTest: React.FC<MicroCorrectionTestProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const lastTargetSpawnRef = useRef<number>(0)
  const mouseTrajectoryRef = useRef<Array<{x: number, y: number, timestamp: number}>>([])
  
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [targets, setTargets] = useState<MicroTarget[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [precisionHits, setPrecisionHits] = useState(0) // Hits in the center zone
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 })
  const [precisionScores, setPrecisionScores] = useState<number[]>([])
  const [correctionMovements, setCorrectionMovements] = useState<number[]>([])
  
  const { completeTest, stopTest } = useSensitivityStore()

  // Generate micro correction target
  const createMicroTarget = useCallback((canvasWidth: number, canvasHeight: number, currentTime: number) => {
    const margin = 80
    const baseSize = (config.targetSize || 0.6) * 30 // Very small targets
    
    // Add slight jitter to make targets more challenging
    const jitterAmount = 2 + Math.random() * 3
    const jitterDirection = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2
    }
    
    return {
      id: `micro-target-${Date.now()}-${Math.random()}`,
      x: margin + Math.random() * (canvasWidth - 2 * margin),
      y: margin + Math.random() * (canvasHeight - 2 * margin),
      spawnTime: currentTime,
      size: baseSize,
      precision: 0.7, // 70% of target size for precision zone
      jitterAmount,
      jitterDirection
    }
  }, [config.targetSize])

  // Calculate jittered position
  const getJitteredPosition = useCallback((target: MicroTarget, currentTime: number) => {
    const timeSinceSpawn = currentTime - target.spawnTime
    const jitterCycle = Math.sin(timeSinceSpawn * 0.01) * target.jitterAmount
    
    return {
      x: target.x + jitterCycle * target.jitterDirection.x,
      y: target.y + jitterCycle * target.jitterDirection.y
    }
  }, [])

  // Handle target hit with precision calculation
  const handleTargetHit = useCallback((target: MicroTarget, clickPosition: { x: number, y: number }, currentTime: number) => {
    const targetPos = getJitteredPosition(target, currentTime)
    const distance = Math.sqrt(
      Math.pow(clickPosition.x - targetPos.x, 2) + 
      Math.pow(clickPosition.y - targetPos.y, 2)
    )
    
    // Calculate precision score based on distance from center
    const precisionRadius = target.size * target.precision / 2
    const precision = Math.max(0, Math.min(1, (precisionRadius - distance) / precisionRadius))
    
    if (distance <= target.size / 2) {
      setHits(prev => prev + 1)
      setPrecisionScores(prev => [...prev, precision])
      
      // Count as precision hit if within precision zone
      if (distance <= precisionRadius) {
        setPrecisionHits(prev => prev + 1)
      }
      
      // Record correction movement (distance from previous position)
      if (mouseTrajectoryRef.current.length > 0) {
        const lastPos = mouseTrajectoryRef.current[mouseTrajectoryRef.current.length - 1]
        const correctionDistance = Math.sqrt(
          Math.pow(clickPosition.x - lastPos.x, 2) + 
          Math.pow(clickPosition.y - lastPos.y, 2)
        )
        setCorrectionMovements(prev => [...prev, correctionDistance])
      }
      
      // Remove hit target
      setTargets(prev => prev.filter(t => t.id !== target.id))
    } else {
      setMisses(prev => prev + 1)
    }
    
    // Record mouse position
    mouseTrajectoryRef.current.push({
      x: clickPosition.x,
      y: clickPosition.y,
      timestamp: currentTime
    })
  }, [getJitteredPosition])

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isStarted || isPaused) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const currentTime = performance.now()
    
    // Check if click hit any target
    let hitTarget = false
    
    for (const target of targets) {
      const targetPos = getJitteredPosition(target, currentTime)
      const distance = Math.sqrt(
        Math.pow(clickX - targetPos.x, 2) + 
        Math.pow(clickY - targetPos.y, 2)
      )
      
      if (distance <= target.size / 2) {
        handleTargetHit(target, { x: clickX, y: clickY }, currentTime)
        hitTarget = true
        break
      }
    }
    
    if (!hitTarget) {
      setMisses(prev => prev + 1)
    }
  }, [isStarted, isPaused, targets, getJitteredPosition, handleTargetHit])

  // Handle mouse move for crosshair and micro-movement tracking
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    setCrosshairPosition({ x: mouseX, y: mouseY })
    
    // Record high-resolution mouse trajectory for micro-movement analysis
    if (isStarted && !isPaused) {
      mouseTrajectoryRef.current.push({
        x: mouseX,
        y: mouseY,
        timestamp: performance.now()
      })
    }
  }, [isStarted, isPaused])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isStarted || isPaused) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
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
    
    // Update target positions with jitter
    setTargets(prevTargets => 
      prevTargets.map(target => ({
        ...target,
        // Targets are updated by reference, position calculated in render
      }))
    )
    
    // Spawn new targets at a slower rate for precision
    const timeSinceLastSpawn = currentTime - lastTargetSpawnRef.current
    const spawnInterval = 1500 // 1.5 seconds between targets
    
    if (timeSinceLastSpawn >= spawnInterval && targets.length < 2) {
      const newTarget = createMicroTarget(canvas.width, canvas.height, currentTime)
      setTargets(prev => [...prev, newTarget])
      lastTargetSpawnRef.current = currentTime
    }
    
    // Remove targets that have been active too long
    setTargets(prev => prev.filter(target => {
      const targetAge = currentTime - target.spawnTime
      if (targetAge > 4000) { // 4 seconds timeout
        setMisses(misses => misses + 1)
        return false
      }
      return true
    }))
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isStarted, isPaused, config.duration, targets.length, createMicroTarget])

  // Finish test and save results
  const finishTest = useCallback(() => {
    setIsStarted(false)
    
    const totalShots = hits + misses
    const accuracy = totalShots > 0 ? (hits / totalShots) * 100 : 0
    const precisionAccuracy = hits > 0 ? (precisionHits / hits) * 100 : 0
    const averagePrecision = precisionScores.length > 0 
      ? precisionScores.reduce((a, b) => a + b, 0) / precisionScores.length * 100
      : 0
    
    // Calculate micro-correction efficiency
    const averageCorrectionDistance = correctionMovements.length > 0
      ? correctionMovements.reduce((a, b) => a + b, 0) / correctionMovements.length
      : 0
    
    const correctionEfficiency = Math.max(0, 100 - (averageCorrectionDistance / 5))
    
    const result: SensitivityTestResult = {
      id: `micro-correction-test-${Date.now()}`,
      testType: 'micro-correction',
      userId: 'current-user',
      config,
      accuracy,
      averageTimeToHit: 0, // Not applicable for micro correction
      totalHits: hits,
      totalMisses: misses,
      flickOvershoot: 0, // Not applicable
      flickUndershoot: 0, // Not applicable
      trackingStability: 100, // Not applicable
      correctionEfficiency,
      reactionConsistency: precisionAccuracy,
      hitPositions: mouseTrajectoryRef.current
        .filter((_, index) => index % 5 === 0) // Sample every 5th position for micro-movement analysis
        .map(pos => ({
          x: pos.x,
          y: pos.y,
          time: pos.timestamp
        })),
      mouseTrajectory: mouseTrajectoryRef.current,
      targetSequence: [], // Not applicable for micro correction
      currentSensitivity: 0.5,
      currentDPI: 800,
      testedAt: new Date().toISOString(),
      sessionDuration: config.duration
    }
    
    completeTest(result)
  }, [hits, misses, precisionHits, precisionScores, correctionMovements, config, completeTest])

  // Start test
  const startTest = () => {
    setIsStarted(true)
    setIsPaused(false)
    startTimeRef.current = performance.now()
    lastTargetSpawnRef.current = performance.now()
    mouseTrajectoryRef.current = []
    setTimeLeft(config.duration)
    setTargets([])
    setHits(0)
    setMisses(0)
    setPrecisionHits(0)
    setPrecisionScores([])
    setCorrectionMovements([])
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

  const averagePrecision = precisionScores.length > 0 
    ? precisionScores.reduce((a, b) => a + b, 0) / precisionScores.length * 100
    : 0

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaCrosshairs className="text-2xl text-purple-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Micro Correction Test</h2>
              <p className="text-sm text-slate-400">
                Precise aiming with small, controlled movements
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
                <div className="text-green-400 font-bold text-lg">{hits}</div>
                <div className="text-slate-400">Hits</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">{misses}</div>
                <div className="text-slate-400">Misses</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-lg">{precisionHits}</div>
                <div className="text-slate-400">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">
                  {Math.round(averagePrecision)}%
                </div>
                <div className="text-slate-400">Quality</div>
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
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'none' }}
        />
        
        {/* Micro Targets with Jitter */}
        <AnimatePresence>
          {targets.map(target => {
            const currentTime = performance.now()
            const jitteredPos = getJitteredPosition(target, currentTime)
            const precisionRadius = target.size * target.precision / 2
            
            return (
              <motion.div
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute pointer-events-none"
                style={{
                  left: jitteredPos.x - target.size / 2,
                  top: jitteredPos.y - target.size / 2,
                  width: target.size,
                  height: target.size,
                }}
              >
                {/* Outer target ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border border-white opacity-80" />
                
                {/* Precision zone */}
                <div 
                  className="absolute bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border border-white"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: precisionRadius * 2,
                    height: precisionRadius * 2,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
                
                {/* Subtle pulse animation */}
                <motion.div
                  className="absolute inset-0 bg-purple-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.1, 0.2]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {/* Enhanced crosshair for precision */}
        {isStarted && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: crosshairPosition.x - 15,
              top: crosshairPosition.y - 15,
            }}
          >
            <div className="w-8 h-8 relative">
              {/* Main crosshair */}
              <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white opacity-80 transform -translate-y-1/2" />
              <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-white opacity-80 transform -translate-x-1/2" />
              
              {/* Center precision dot */}
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              
              {/* Corner brackets for precision reference */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-white" />
              <div className="absolute top-0 right-0 w-1 h-1 bg-white" />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-white" />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-white" />
            </div>
          </div>
        )}
        
        {/* Micro-movement trail */}
        {isStarted && mouseTrajectoryRef.current.length > 10 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <path
              d={`M ${mouseTrajectoryRef.current.slice(-20).map(pos => `${pos.x},${pos.y}`).join(' L ')}`}
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth="1"
              fill="none"
              opacity="0.8"
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
              <FaCrosshairs className="text-6xl text-purple-500 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-4">Micro Correction Test</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Click the center of small, jittering targets with maximum precision. 
                Focus on controlled, minimal movements to hit the yellow precision zone for bonus points.
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white ml-2">{config.duration}s</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Targets:</span>
                    <span className="text-white ml-2">{config.targetCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size:</span>
                    <span className="text-white ml-2">Very Small</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="text-white ml-2 capitalize">{config.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                <p>💡 Yellow zone = Precision hits</p>
                <p>🎯 Minimize mouse movement for best scores</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}