import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../../stores/sensitivityStore'
import { FaBullseye, FaTimes, FaPause, FaPlay } from 'react-icons/fa'
import type { SensitivityTestConfig, SensitivityTestResult } from '../../../../../shared/types'

interface FlickTestProps {
  config: SensitivityTestConfig
}

interface Target {
  id: string
  x: number
  y: number
  spawnTime: number
  size: number
}

interface HitResult {
  targetId: string
  hitTime: number
  reactionTime: number
  accuracy: number
  position: { x: number, y: number }
}

export const FlickTest: React.FC<FlickTestProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const lastTargetSpawnRef = useRef<number>(0)
  const mouseTrajectoryRef = useRef<Array<{x: number, y: number, timestamp: number}>>([])
  
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [targets, setTargets] = useState<Target[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [hitResults, setHitResults] = useState<HitResult[]>([])
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 })
  
  const { completeTest, stopTest } = useSensitivityStore()

  // Generate random target position
  const generateTargetPosition = useCallback((canvasWidth: number, canvasHeight: number, targetSize: number) => {
    const margin = targetSize * 50 // 50px margin
    return {
      x: margin + Math.random() * (canvasWidth - 2 * margin),
      y: margin + Math.random() * (canvasHeight - 2 * margin)
    }
  }, [])

  // Create new target
  const createTarget = useCallback((canvasWidth: number, canvasHeight: number, currentTime: number) => {
    const position = generateTargetPosition(canvasWidth, canvasHeight, config.targetSize)
    return {
      id: `target-${Date.now()}-${Math.random()}`,
      x: position.x,
      y: position.y,
      spawnTime: currentTime,
      size: config.targetSize * 50 // Base size 50px
    }
  }, [config.targetSize, generateTargetPosition])

  // Handle target hit
  const handleTargetHit = useCallback((target: Target, clickPosition: { x: number, y: number }) => {
    const currentTime = performance.now()
    const reactionTime = currentTime - target.spawnTime
    
    // Calculate accuracy based on distance from center
    const distance = Math.sqrt(
      Math.pow(clickPosition.x - target.x, 2) + 
      Math.pow(clickPosition.y - target.y, 2)
    )
    const accuracy = Math.max(0, 1 - (distance / target.size))
    
    const hitResult: HitResult = {
      targetId: target.id,
      hitTime: currentTime,
      reactionTime,
      accuracy,
      position: clickPosition
    }
    
    setHitResults(prev => [...prev, hitResult])
    setHits(prev => prev + 1)
    setCurrentStreak(prev => {
      const newStreak = prev + 1
      setBestStreak(current => Math.max(current, newStreak))
      return newStreak
    })
    
    // Remove hit target
    setTargets(prev => prev.filter(t => t.id !== target.id))
  }, [])

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isStarted || isPaused) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    
    // Check if click hit any target
    let hitTarget = false
    
    for (const target of targets) {
      const distance = Math.sqrt(
        Math.pow(clickX - target.x, 2) + 
        Math.pow(clickY - target.y, 2)
      )
      
      if (distance <= target.size / 2) {
        handleTargetHit(target, { x: clickX, y: clickY })
        hitTarget = true
        break
      }
    }
    
    if (!hitTarget) {
      setMisses(prev => prev + 1)
      setCurrentStreak(0)
    }
    
    // Record mouse trajectory
    mouseTrajectoryRef.current.push({
      x: clickX,
      y: clickY,
      timestamp: performance.now()
    })
  }, [isStarted, isPaused, targets, handleTargetHit])

  // Handle mouse move for crosshair
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    setCrosshairPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
    
    // Record mouse trajectory
    if (isStarted && !isPaused) {
      mouseTrajectoryRef.current.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
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
    
    // Spawn new targets based on spawn rate
    const timeSinceLastSpawn = currentTime - lastTargetSpawnRef.current
    const spawnInterval = 1000 // 1 second spawn interval
    
    if (timeSinceLastSpawn >= spawnInterval && targets.length < 3) {
      const newTarget = createTarget(canvas.width, canvas.height, currentTime)
      setTargets(prev => [...prev, newTarget])
      lastTargetSpawnRef.current = currentTime
    }
    
    // Remove targets that have been active too long (missed)
    setTargets(prev => prev.filter(target => {
      const targetAge = currentTime - target.spawnTime
      if (targetAge > 2000) { // 2 seconds timeout
        setMisses(misses => misses + 1)
        setCurrentStreak(0)
        return false
      }
      return true
    }))
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isStarted, isPaused, config.duration, targets.length, createTarget])

  // Finish test and save results
  const finishTest = useCallback(() => {
    setIsStarted(false)
    
    const totalShots = hits + misses
    const accuracy = totalShots > 0 ? (hits / totalShots) * 100 : 0
    const avgReactionTime = hitResults.length > 0 
      ? hitResults.reduce((acc, hit) => acc + hit.reactionTime, 0) / hitResults.length 
      : 0
    
    // Calculate advanced metrics
    const overshots = hitResults.filter(hit => hit.reactionTime > avgReactionTime * 1.2).length
    const undershots = hitResults.filter(hit => hit.reactionTime < avgReactionTime * 0.8).length
    
    const result: SensitivityTestResult = {
      id: `flick-test-${Date.now()}`,
      testType: 'flick',
      userId: 'current-user', // This should come from auth store
      config,
      accuracy,
      averageTimeToHit: avgReactionTime,
      totalHits: hits,
      totalMisses: misses,
      flickOvershoot: (overshots / hitResults.length) * 100 || 0,
      flickUndershoot: (undershots / hitResults.length) * 100 || 0,
      trackingStability: 100, // Not applicable for flick test
      correctionEfficiency: accuracy, // Simplified
      reactionConsistency: calculateConsistency(hitResults.map(h => h.reactionTime)),
      hitPositions: hitResults.map(hit => ({
        x: hit.position.x,
        y: hit.position.y,
        time: hit.hitTime
      })),
      mouseTrajectory: mouseTrajectoryRef.current,
      targetSequence: [], // Would need to track this during the test
      currentSensitivity: 0.5, // This should come from user profile
      currentDPI: 800, // This should come from user profile
      testedAt: new Date().toISOString(),
      sessionDuration: config.duration
    }
    
    completeTest(result)
  }, [hits, misses, hitResults, config, completeTest])

  // Calculate consistency (lower is better)
  const calculateConsistency = (reactionTimes: number[]): number => {
    if (reactionTimes.length < 2) return 0
    
    const mean = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const variance = reactionTimes.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / reactionTimes.length
    return Math.sqrt(variance)
  }

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
    setCurrentStreak(0)
    setBestStreak(0)
    setHitResults([])
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <FaBullseye className="text-xl sm:text-2xl text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Flick Shots Test</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Click targets as quickly and accurately as possible
              </p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 w-full lg:w-auto">
            {/* Stats */}
            <div className="grid grid-cols-5 lg:flex lg:items-center gap-3 lg:gap-4 text-sm w-full lg:w-auto">
              <div className="text-center bg-slate-700/50 rounded-lg p-2">
                <div className="text-white font-bold text-base lg:text-lg">{Math.ceil(timeLeft)}</div>
                <div className="text-slate-400 text-xs">Time</div>
              </div>
              <div className="text-center bg-slate-700/50 rounded-lg p-2">
                <div className="text-green-400 font-bold text-base lg:text-lg">{hits}</div>
                <div className="text-slate-400 text-xs">Hits</div>
              </div>
              <div className="text-center bg-slate-700/50 rounded-lg p-2">
                <div className="text-red-400 font-bold text-base lg:text-lg">{misses}</div>
                <div className="text-slate-400 text-xs">Misses</div>
              </div>
              <div className="text-center bg-slate-700/50 rounded-lg p-2">
                <div className="text-orange-400 font-bold text-base lg:text-lg">{currentStreak}</div>
                <div className="text-slate-400 text-xs">Streak</div>
              </div>
              <div className="text-center bg-slate-700/50 rounded-lg p-2">
                <div className="text-blue-400 font-bold text-base lg:text-lg">
                  {hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%
                </div>
                <div className="text-slate-400 text-xs">Accuracy</div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
              {!isStarted ? (
                <button
                  onClick={startTest}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-[1.02] flex items-center space-x-2"
                >
                  <FaPlay className="text-sm" />
                  <span>Start Test</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-[1.02] flex items-center space-x-2"
                  >
                    {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                    <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={handleStopTest}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-[1.02] flex items-center space-x-2"
                  >
                    <FaTimes className="text-sm" />
                    <span className="hidden sm:inline">Stop</span>
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
          style={{ cursor: 'none', imageRendering: 'pixelated' }}
        />
        
        {/* Targets */}
        <AnimatePresence>
          {targets.map(target => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute bg-gradient-to-br from-red-500 to-orange-500 rounded-full border-2 border-white shadow-lg pointer-events-none"
              style={{
                left: target.x - target.size / 2,
                top: target.y - target.size / 2,
                width: target.size,
                height: target.size,
              }}
            >
              {/* Target center dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Crosshair */}
        {isStarted && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: crosshairPosition.x - 10,
              top: crosshairPosition.y - 10,
            }}
          >
            <div className="w-5 h-5 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white opacity-70 transform -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white opacity-70 transform -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
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
              <FaBullseye className="text-6xl text-red-500 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-4">Flick Shots Test</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Targets will appear randomly on screen. Click them as quickly and accurately as possible. 
                Test your reaction time and precision with rapid target acquisition.
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
                    <span className="text-white ml-2">
                      {config.targetSize === 0.6 ? 'Small' : config.targetSize === 1.0 ? 'Medium' : 'Large'}
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
      </div>
    </div>
  )
}