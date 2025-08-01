import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { FaPause, FaPlay, FaStop, FaTimes } from 'react-icons/fa'
import type { SensitivityTestConfig, SensitivityTestResult } from '../../../../shared/types'

interface SensitivityGameCanvasProps {
  config: SensitivityTestConfig
  onTestComplete: (result: SensitivityTestResult) => void
  onTestExit: () => void
}

interface Target3D {
  id: string
  position: [number, number, number]
  spawnTime: number
  size: number
  type: string
  velocity?: [number, number, number] // for moving targets
}

interface HitData {
  targetId: string
  hitTime: number
  reactionTime: number
  accuracy: number
  position: { x: number, y: number, z: number }
}

// FPS Camera Controller for Sensitivity Tests
function SensitivityCameraController({ 
  isActive, 
  onMouseMove 
}: { 
  isActive: boolean
  onMouseMove: (movementX: number, movementY: number) => void
}) {
  const { camera, gl } = useThree()
  const [isLocked, setIsLocked] = useState(false)
  const mouseSensitivity = useRef(0.002)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const yaw = useRef(0)
  const pitch = useRef(0)

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseMoveEvent = (event: MouseEvent) => {
      if (!isLocked || !isActive) return

      const movementX = event.movementX || 0
      const movementY = event.movementY || 0

      // Record mouse movement for sensitivity analysis
      onMouseMove(movementX, movementY)

      yaw.current -= movementX * mouseSensitivity.current
      pitch.current -= movementY * mouseSensitivity.current

      // Limit pitch rotation
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current))

      // Apply rotation to camera
      euler.current.x = pitch.current
      euler.current.y = yaw.current
      camera.rotation.copy(euler.current)
    }

    const onPointerLockChange = () => {
      const isCurrentlyLocked = document.pointerLockElement === canvas
      setIsLocked(isCurrentlyLocked)
      
      if (isCurrentlyLocked) {
        document.body.style.cursor = 'none'
      } else {
        document.body.style.cursor = 'default'
      }
    }

    const onPointerLockError = () => {
      console.error('Pointer lock failed')
    }

    const onClick = () => {
      if (isActive && !isLocked) {
        canvas.requestPointerLock()
      }
    }

    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mousemove', onMouseMoveEvent)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.addEventListener('pointerlockerror', onPointerLockError)

    return () => {
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mousemove', onMouseMoveEvent)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      document.removeEventListener('pointerlockerror', onPointerLockError)
    }
  }, [isActive, gl, onMouseMove])

  return null
}

// 3D Target Component
function Target3D({ 
  target, 
  onHit 
}: { 
  target: Target3D
  onHit: (targetId: string, hitAccuracy: number) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isHit, setIsHit] = useState(false)
  
  // Animation for moving targets
  useFrame((state, delta) => {
    if (meshRef.current && target.velocity && !isHit) {
      meshRef.current.position.x += target.velocity[0] * delta
      meshRef.current.position.y += target.velocity[1] * delta
      meshRef.current.position.z += target.velocity[2] * delta
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    if (isHit) return

    setIsHit(true)
    
    // Calculate hit accuracy based on distance from center
    const hitPoint = event.point
    const targetCenter = meshRef.current?.position
    if (targetCenter) {
      const distance = hitPoint.distanceTo(targetCenter)
      const accuracy = Math.max(0, 1 - (distance / (target.size / 2)))
      onHit(target.id, accuracy)
    }
  }

  const targetColor = isHit ? '#22c55e' : 
                    target.type === 'flick' ? '#ef4444' :
                    target.type === 'tracking' ? '#3b82f6' :
                    target.type === 'switching' ? '#f59e0b' :
                    '#8b5cf6'

  return (
    <mesh
      ref={meshRef}
      position={target.position}
      onClick={handleClick}
      scale={isHit ? 1.2 : 1}
    >
      <sphereGeometry args={[target.size / 2, 16, 16]} />
      <meshStandardMaterial 
        color={targetColor}
        emissive={targetColor}
        emissiveIntensity={0.2}
        transparent
        opacity={isHit ? 0.7 : 0.9}
      />
    </mesh>
  )
}

// Shooting System for Sensitivity Tests
function SensitivityShootingSystem({ 
  isActive, 
  targets,
  onTargetHit,
  onTargetMiss
}: { 
  isActive: boolean
  targets: Target3D[]
  onTargetHit: (targetId: string, accuracy: number) => void
  onTargetMiss: () => void
}) {
  const { camera, raycaster } = useThree()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isActive || event.target !== event.currentTarget) return

      // Create raycaster from camera center (crosshair position)
      const pointer = new THREE.Vector2(0, 0) // Center of screen
      raycaster.setFromCamera(pointer, camera)

      // Check for intersections with targets
      const targetMeshes = targets.map(target => 
        document.querySelector(`[data-target-id="${target.id}"]`)
      ).filter(Boolean)

      // For now, we'll handle this in the Target3D component's onClick
      // This is a backup miss detection
      onTargetMiss()
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('click', handleClick)
      return () => canvas.removeEventListener('click', handleClick)
    }
  }, [isActive, targets, camera, raycaster, onTargetHit, onTargetMiss])

  return null
}

export const SensitivityGameCanvas: React.FC<SensitivityGameCanvasProps> = ({
  config,
  onTestComplete,
  onTestExit
}) => {
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [targets, setTargets] = useState<Target3D[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [hitData, setHitData] = useState<HitData[]>([])
  const [mouseTrajectory, setMouseTrajectory] = useState<Array<{x: number, y: number, timestamp: number}>>([])
  
  const startTimeRef = useRef<number>()
  const lastSpawnTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const spawnIntervalRef = useRef<NodeJS.Timeout>()
  const targetIdCounter = useRef(0)

  // Calculate test statistics
  const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0
  const averageReactionTime = hitData.length > 0 ? 
    hitData.reduce((sum, hit) => sum + hit.reactionTime, 0) / hitData.length : 0

  // Mouse movement tracking
  const handleMouseMove = useCallback((movementX: number, movementY: number) => {
    setMouseTrajectory(prev => [...prev, {
      x: movementX,
      y: movementY,
      timestamp: Date.now()
    }])
  }, [])

  // Target generation based on test type with advanced patterns
  const generateTarget = useCallback((): Target3D => {
    targetIdCounter.current += 1
    const baseSize = config.targetSize || 1.0
    
    switch (config.testType) {
      case 'flick':
        // Flick targets spawn far apart for quick snapping
        const angle = Math.random() * Math.PI * 2
        const distance = 8 + Math.random() * 12
        return {
          id: `target_${targetIdCounter.current}`,
          position: [
            Math.cos(angle) * distance,
            Math.random() * 6 + 1,
            Math.sin(angle) * distance - 10
          ],
          spawnTime: Date.now(),
          size: baseSize,
          type: 'flick'
        }
      
      case 'tracking':
        // Tracking targets move in predictable patterns
        const trackingPatterns = ['horizontal', 'vertical', 'circular', 'figure8']
        const pattern = trackingPatterns[Math.floor(Math.random() * trackingPatterns.length)]
        let velocity: [number, number, number] = [0, 0, 0]
        
        switch (pattern) {
          case 'horizontal':
            velocity = [(Math.random() > 0.5 ? 1 : -1) * (config.targetSpeed || 2), 0, 0]
            break
          case 'vertical':
            velocity = [0, (Math.random() > 0.5 ? 1 : -1) * (config.targetSpeed || 2), 0]
            break
          case 'circular':
            velocity = [Math.cos(Date.now() * 0.001) * (config.targetSpeed || 2), Math.sin(Date.now() * 0.001) * (config.targetSpeed || 2), 0]
            break
          case 'figure8':
            velocity = [Math.sin(Date.now() * 0.002) * (config.targetSpeed || 2), Math.cos(Date.now() * 0.001) * (config.targetSpeed || 2), 0]
            break
        }
        
        return {
          id: `target_${targetIdCounter.current}`,
          position: [
            (Math.random() - 0.5) * 12,
            Math.random() * 4 + 2,
            Math.random() * -8 - 6
          ],
          spawnTime: Date.now(),
          size: baseSize * 1.2,
          type: 'tracking',
          velocity
        }
      
      case 'target-switching':
        // Switching targets spawn in sequences for rapid transitions
        const switchingPositions = [
          [-8, 3, -10], [8, 3, -10], [0, 6, -8], 
          [-6, 1, -12], [6, 1, -12], [0, 1, -15],
          [-4, 5, -7], [4, 5, -7]
        ]
        const randomPos = switchingPositions[Math.floor(Math.random() * switchingPositions.length)]
        
        return {
          id: `target_${targetIdCounter.current}`,
          position: [
            randomPos[0] + (Math.random() - 0.5) * 2,
            randomPos[1] + (Math.random() - 0.5) * 1,
            randomPos[2] + (Math.random() - 0.5) * 2
          ],
          spawnTime: Date.now(),
          size: baseSize * 0.9,
          type: 'switching'
        }
      
      case 'micro-correction':
        // Micro targets are very small and close together
        const microPatterns = ['cluster', 'line', 'triangle', 'cross']
        const microPattern = microPatterns[Math.floor(Math.random() * microPatterns.length)]
        let position: [number, number, number] = [0, 2, -8]
        
        switch (microPattern) {
          case 'cluster':
            position = [
              (Math.random() - 0.5) * 4,
              2 + (Math.random() - 0.5) * 2,
              -6 + (Math.random() - 0.5) * 2
            ]
            break
          case 'line':
            const lineOffset = (targetIdCounter.current % 5) - 2
            position = [lineOffset * 1.5, 2.5, -7]
            break
          case 'triangle':
            const triAngles = [0, Math.PI * 2/3, Math.PI * 4/3]
            const triAngle = triAngles[targetIdCounter.current % 3]
            position = [
              Math.cos(triAngle) * 2,
              2 + Math.sin(triAngle) * 1,
              -7
            ]
            break
          case 'cross':
            const crossPositions = [[0, 2, -7], [2, 2, -7], [-2, 2, -7], [0, 4, -7], [0, 0, -7]]
            const crossPos = crossPositions[targetIdCounter.current % 5]
            position = [crossPos[0], crossPos[1], crossPos[2]]
            break
        }
        
        return {
          id: `target_${targetIdCounter.current}`,
          position,
          spawnTime: Date.now(),
          size: baseSize * 0.5,
          type: 'micro'
        }
      
      default:
        return {
          id: `target_${targetIdCounter.current}`,
          position: [0, 2, -10],
          spawnTime: Date.now(),
          size: baseSize,
          type: 'default'
        }
    }
  }, [config])

  // Target spawning logic
  useEffect(() => {
    if (!isStarted || isPaused) return

    const spawnInterval = 60000 / (config.targetCount || 30) // ms between spawns
    
    spawnIntervalRef.current = setInterval(() => {
      if (targets.length < 5) { // Max 5 targets on screen
        const newTarget = generateTarget()
        setTargets(prev => [...prev, newTarget])
        
        // Auto-remove target after lifetime
        setTimeout(() => {
          setTargets(prev => prev.filter(t => t.id !== newTarget.id))
          setMisses(prev => prev + 1)
        }, 3000) // 3 second lifetime
      }
    }, spawnInterval)

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }
  }, [isStarted, isPaused, targets.length, generateTarget, config])

  // Game timer
  useEffect(() => {
    if (isStarted && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isStarted, isPaused, timeLeft])

  // Handle target hit
  const handleTargetHit = useCallback((targetId: string, accuracy: number) => {
    const target = targets.find(t => t.id === targetId)
    if (!target) return

    const hitTime = Date.now()
    const reactionTime = hitTime - target.spawnTime

    setHits(prev => prev + 1)
    setTargets(prev => prev.filter(t => t.id !== targetId))
    
    setHitData(prev => [...prev, {
      targetId,
      hitTime,
      reactionTime,
      accuracy,
      position: { x: target.position[0], y: target.position[1], z: target.position[2] }
    }])
  }, [targets])

  // Handle target miss
  const handleTargetMiss = useCallback(() => {
    // This will be called for general misses
  }, [])

  // Start test
  const startTest = useCallback(() => {
    setIsStarted(true)
    setIsPaused(false)
    startTimeRef.current = Date.now()
  }, [])

  // Pause/Resume test
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Stop test
  const stopTest = useCallback(() => {
    setIsStarted(false)
    setIsPaused(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    onTestExit()
  }, [onTestExit])

  // Finish test and generate results
  const finishTest = useCallback(() => {
    const endTime = Date.now()
    const testDuration = startTimeRef.current ? endTime - startTimeRef.current : config.duration * 1000

    const result: SensitivityTestResult = {
      id: `test_${Date.now()}`,
      testType: config.testType,
      userId: 'current_user', // TODO: Get from auth store
      config,
      accuracy,
      averageTimeToHit: averageReactionTime,
      totalHits: hits,
      totalMisses: misses,
      flickOvershoot: 0, // TODO: Calculate from mouse trajectory
      flickUndershoot: 0, // TODO: Calculate from mouse trajectory
      trackingStability: 100, // TODO: Calculate from mouse stability
      correctionEfficiency: 0, // TODO: Calculate efficiency metrics
      reactionConsistency: 0, // TODO: Calculate consistency
      hitPositions: hitData.map(h => ({ x: h.position.x, y: h.position.y, time: h.hitTime })),
      mouseTrajectory,
      targetSequence: [], // TODO: Record target sequence
      currentSensitivity: 0.5, // TODO: Get from settings
      currentDPI: 800, // TODO: Get from settings
      testedAt: new Date().toISOString(),
      sessionDuration: testDuration / 1000
    }

    setIsStarted(false)
    onTestComplete(result)
  }, [config, accuracy, averageReactionTime, hits, misses, hitData, mouseTrajectory, onTestComplete])

  return (
    <div className="w-full h-screen relative">
      <Canvas
        className="bg-gradient-to-b from-gray-900 to-black"
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight)
        }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.6, 0]}
          fov={75}
        />
        
        <SensitivityCameraController 
          isActive={isStarted && !isPaused} 
          onMouseMove={handleMouseMove}
        />
        
        <SensitivityShootingSystem
          isActive={isStarted && !isPaused}
          targets={targets}
          onTargetHit={handleTargetHit}
          onTargetMiss={handleTargetMiss}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Targets */}
        {targets.map(target => (
          <Target3D
            key={target.id}
            target={target}
            onHit={handleTargetHit}
          />
        ))}
        
        {/* Environment */}
        <gridHelper args={[50, 50, '#333333', '#333333']} position={[0, 0, 0]} />
        
        {/* Walls for reference */}
        <mesh position={[0, 5, -25]}>
          <planeGeometry args={[50, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </Canvas>

      {/* Enhanced Game UI */}
      <div className="absolute top-4 left-4 text-white space-y-3 z-10">
        {/* Test Header */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                {config.testType.toUpperCase()} TEST
              </div>
              <div className="text-sm text-orange-300">
                {config.testType === 'flick' ? 'Quick snap aiming' :
                 config.testType === 'tracking' ? 'Follow moving targets' :
                 config.testType === 'target-switching' ? 'Rapid target transitions' :
                 'Precise micro adjustments'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300">Progress</span>
            <span className="text-sm text-white font-mono">{timeLeft}s</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((config.duration - timeLeft) / config.duration) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Hits:</span>
              <span className="text-green-400 font-mono">{hits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Misses:</span>
              <span className="text-red-400 font-mono">{misses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accuracy:</span>
              <span className={`font-mono ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg RT:</span>
              <span className={`font-mono ${averageReactionTime <= 250 ? 'text-green-400' : averageReactionTime <= 350 ? 'text-yellow-400' : 'text-red-400'}`}>
                {averageReactionTime.toFixed(0)}ms
              </span>
            </div>
          </div>
          
          {/* Current Streak */}
          {hits > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Streak:</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, Math.max(0, hits - misses)) }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    ))}
                  </div>
                  <span className="text-orange-400 text-xs font-mono">{Math.max(0, hits - misses)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Indicators */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Performance</div>
          <div className="space-y-2">
            {/* Accuracy Bar */}
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Accuracy</span>
                <span className="text-slate-300">{accuracy.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, accuracy)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Speed Bar (inverse of reaction time) */}
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Speed</span>
                <span className="text-slate-300">{averageReactionTime.toFixed(0)}ms</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    averageReactionTime <= 250 ? 'bg-green-500' : averageReactionTime <= 350 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(10, 100 - (averageReactionTime / 5))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 space-y-3 z-10">
        {/* Target Counter */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700 text-center">
          <div className="text-xs text-slate-400 mb-1">Active Targets</div>
          <div className="text-2xl font-bold text-orange-400">{targets.length}</div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col space-y-2">
          {!isStarted ? (
            <button
              onClick={startTest}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPlay className="text-sm" /> <span className="font-semibold">Start Test</span>
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
              >
                {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={stopTest}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
              >
                <FaStop className="text-sm" /> <span>Stop</span>
              </button>
            </>
          )}
          
          <button
            onClick={onTestExit}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaTimes className="text-sm" /> <span>Exit</span>
          </button>
        </div>

        {/* Test Info */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700 text-xs">
          <div className="space-y-1 text-slate-400">
            <div>Duration: <span className="text-white">{config.duration}s</span></div>
            <div>Target Size: <span className="text-white">{(config.targetSize * 100).toFixed(0)}%</span></div>
            {config.targetSpeed && (
              <div>Speed: <span className="text-white">{config.targetSpeed}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Crosshair */}
      {isStarted && !isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="w-8 h-8 relative">
            {/* Main crosshair */}
            <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-orange-500 transform -translate-y-1/2 opacity-90 shadow-lg"></div>
            <div className="absolute left-1/2 top-1 bottom-1 w-0.5 bg-orange-500 transform -translate-x-1/2 opacity-90 shadow-lg"></div>
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-orange-500 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 shadow-lg"></div>
            
            {/* Outer ring for precision */}
            <div className="absolute top-1/2 left-1/2 w-6 h-6 border border-orange-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Dynamic accuracy indicator */}
            {accuracy > 0 && (
              <div className={`absolute top-1/2 left-1/2 w-4 h-4 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-colors ${
                accuracy >= 80 ? 'border-green-400/50' : accuracy >= 60 ? 'border-yellow-400/50' : 'border-red-400/50'
              }`}></div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isStarted && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="text-sm">
              <div className="font-semibold text-orange-500 mb-2">Instructions:</div>
              <div>🎯 Click to lock cursor and start FPS controls</div>
              <div>🖱️ Move mouse to aim</div>
              <div>🔫 Left click to shoot targets</div>
              <div>⏸️ Press ESC to unlock cursor</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}