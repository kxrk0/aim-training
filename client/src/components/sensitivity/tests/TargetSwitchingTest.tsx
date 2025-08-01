import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../../stores/sensitivityStore'
import { FaExchangeAlt, FaTimes, FaPause, FaPlay } from 'react-icons/fa'
import type { SensitivityTestConfig, SensitivityTestResult } from '../../../../../shared/types'

interface TargetSwitchingTestProps {
  config: SensitivityTestConfig
}

interface SwitchingTarget {
  id: string
  x: number
  y: number
  spawnTime: number
  size: number
  isActive: boolean
  sequence: number
}

export const TargetSwitchingTest: React.FC<TargetSwitchingTestProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const mouseTrajectoryRef = useRef<Array<{x: number, y: number, timestamp: number}>>([])
  
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [targets, setTargets] = useState<SwitchingTarget[]>([])
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [switchingTimes, setSwitchingTimes] = useState<number[]>([])
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 })
  const [lastHitTime, setLastHitTime] = useState<number>(0)
  
  const { completeTest, stopTest } = useSensitivityStore()

  // Generate targets in sequence
  const generateTargets = useCallback((canvasWidth: number, canvasHeight: number) => {
    const targetCount = config.targetCount || 20
    const targets: SwitchingTarget[] = []
    const margin = 100
    const size = (config.targetSize || 1.0) * 50
    
    for (let i = 0; i < targetCount; i++) {
      // Position targets to encourage switching movements
      const angle = (i / targetCount) * Math.PI * 2
      const radius = Math.min(canvasWidth, canvasHeight) * 0.3
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      
      // Add some randomness to prevent predictable patterns
      const randomOffset = 50 + Math.random() * 100
      const x = centerX + Math.cos(angle) * (radius + randomOffset * (Math.random() - 0.5))
      const y = centerY + Math.sin(angle) * (radius + randomOffset * (Math.random() - 0.5))
      
      targets.push({
        id: `switch-target-${i}`,
        x: Math.max(margin, Math.min(canvasWidth - margin, x)),
        y: Math.max(margin, Math.min(canvasHeight - margin, y)),
        spawnTime: 0,
        size,
        isActive: i === 0, // Only first target is active initially
        sequence: i
      })
    }
    
    return targets
  }, [config.targetCount, config.targetSize])

  // Handle target hit
  const handleTargetHit = useCallback((target: SwitchingTarget, clickPosition: { x: number, y: number }) => {
    const currentTime = performance.now()
    
    if (target.sequence !== currentTargetIndex) {
      // Wrong target clicked
      setMisses(prev => prev + 1)
      return
    }
    
    // Calculate switching time (time since last hit)
    if (lastHitTime > 0) {
      const switchTime = currentTime - lastHitTime
      setSwitchingTimes(prev => [...prev, switchTime])
    }
    
    setHits(prev => prev + 1)
    setLastHitTime(currentTime)
    
    // Activate next target
    setCurrentTargetIndex(prev => prev + 1)
    setTargets(prevTargets => 
      prevTargets.map(t => ({
        ...t,
        isActive: t.sequence === currentTargetIndex + 1
      }))
    )
    
    // Record mouse trajectory
    mouseTrajectoryRef.current.push({
      x: clickPosition.x,
      y: clickPosition.y,
      timestamp: currentTime
    })
  }, [currentTargetIndex, lastHitTime])

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isStarted || isPaused) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    
    // Check if click hit the active target
    const activeTarget = targets.find(t => t.isActive)
    if (!activeTarget) return
    
    const distance = Math.sqrt(
      Math.pow(clickX - activeTarget.x, 2) + 
      Math.pow(clickY - activeTarget.y, 2)
    )
    
    if (distance <= activeTarget.size / 2) {
      handleTargetHit(activeTarget, { x: clickX, y: clickY })
    } else {
      setMisses(prev => prev + 1)
    }
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
    
    // Record mouse trajectory during active test
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
    
    const currentTime = performance.now()
    const startTime = startTimeRef.current || currentTime
    const elapsed = (currentTime - startTime) / 1000
    const remaining = Math.max(0, config.duration - elapsed)
    
    setTimeLeft(remaining)
    
    // Check if test should end
    if (remaining <= 0 || currentTargetIndex >= targets.length) {
      finishTest()
      return
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isStarted, isPaused, config.duration, currentTargetIndex, targets.length])

  // Finish test and save results
  const finishTest = useCallback(() => {
    setIsStarted(false)
    
    const totalTargets = targets.length
    const accuracy = totalTargets > 0 ? (hits / totalTargets) * 100 : 0
    const averageSwitchTime = switchingTimes.length > 0 
      ? switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length 
      : 0
    
    // Calculate switching efficiency
    const switchingEfficiency = switchingTimes.length > 0 
      ? Math.max(0, 100 - (averageSwitchTime / 10)) // Lower time = higher efficiency
      : 0
    
    const result: SensitivityTestResult = {
      id: `target-switching-test-${Date.now()}`,
      testType: 'target-switching',
      userId: 'current-user',
      config,
      accuracy,
      averageTimeToHit: averageSwitchTime,
      totalHits: hits,
      totalMisses: misses,
      flickOvershoot: 0,
      flickUndershoot: 0,
      trackingStability: 100, // Not applicable
      correctionEfficiency: switchingEfficiency,
      reactionConsistency: calculateSwitchingConsistency(),
      hitPositions: mouseTrajectoryRef.current
        .filter((_, index) => index % 10 === 0) // Sample every 10th position
        .map(pos => ({
          x: pos.x,
          y: pos.y,
          time: pos.timestamp
        })),
      mouseTrajectory: mouseTrajectoryRef.current,
      targetSequence: targets.map((target, index) => ({
        id: target.id,
        spawnTime: target.spawnTime,
        position: { x: target.x, y: target.y },
        wasHit: index < hits
      })),
      currentSensitivity: 0.5,
      currentDPI: 800,
      testedAt: new Date().toISOString(),
      sessionDuration: config.duration
    }
    
    completeTest(result)
  }, [hits, misses, targets, switchingTimes, config, completeTest])

  // Calculate switching consistency
  const calculateSwitchingConsistency = (): number => {
    if (switchingTimes.length < 2) return 0
    
    const mean = switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length
    const variance = switchingTimes.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / switchingTimes.length
    const standardDeviation = Math.sqrt(variance)
    
    // Convert to 0-100 scale (lower standard deviation = higher consistency)
    return Math.max(0, 100 - (standardDeviation / 10))
  }

  // Start test
  const startTest = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsStarted(true)
    setIsPaused(false)
    startTimeRef.current = performance.now()
    mouseTrajectoryRef.current = []
    setTimeLeft(config.duration)
    setCurrentTargetIndex(0)
    setHits(0)
    setMisses(0)
    setSwitchingTimes([])
    setLastHitTime(0)
    
    const newTargets = generateTargets(canvas.width, canvas.height)
    setTargets(newTargets)
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

  const averageSwitchTime = switchingTimes.length > 0 
    ? switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length 
    : 0

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaExchangeAlt className="text-2xl text-green-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Target Switching Test</h2>
              <p className="text-sm text-slate-400">
                Click targets in sequence as quickly as possible
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
                <div className="text-blue-400 font-bold text-lg">
                  {Math.round(averageSwitchTime)}ms
                </div>
                <div className="text-slate-400">Avg Switch</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-lg">
                  {currentTargetIndex + 1}/{targets.length}
                </div>
                <div className="text-slate-400">Progress</div>
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
        
        {/* Targets */}
        <AnimatePresence>
          {targets.map((target, index) => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: target.isActive ? 1 : 0.7, 
                opacity: target.isActive ? 1 : 0.3 
              }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute rounded-full border-2 pointer-events-none ${
                target.isActive 
                  ? 'bg-gradient-to-br from-green-500 to-teal-500 border-white shadow-lg shadow-green-500/50' 
                  : index < currentTargetIndex 
                    ? 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500'
              }`}
              style={{
                left: target.x - target.size / 2,
                top: target.y - target.size / 2,
                width: target.size,
                height: target.size,
              }}
            >
              {/* Target number */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-sm">
                {target.sequence + 1}
              </div>
              
              {/* Active target pulse effect */}
              {target.isActive && (
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Connection lines to next target */}
        {isStarted && !isPaused && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {targets.map((target, index) => {
              if (!target.isActive || index >= targets.length - 1) return null
              
              const nextTarget = targets[index + 1]
              if (!nextTarget) return null
              
              return (
                <motion.line
                  key={`line-${target.id}`}
                  x1={target.x}
                  y1={target.y}
                  x2={nextTarget.x}
                  y2={nextTarget.y}
                  stroke="rgba(34, 197, 94, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )
            })}
          </svg>
        )}
        
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
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
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
              <FaExchangeAlt className="text-6xl text-green-500 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-4">Target Switching Test</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Click the targets in numerical order as quickly as possible. 
                Focus on quick, accurate transitions between targets to improve your switching speed.
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