import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { EnhancedTarget } from './EnhancedTarget'
import { useAudioSystem } from './SoundSystem'
import { useLevelStore } from '@/stores/levelStore'
import { useGameStore } from '@/stores/gameStore'
import { ModernGameHUD } from './ModernGameHUD'
import { ESCMenu } from './ESCMenu'
import { HitEffects } from './HitEffects'

interface GameCanvasProps {
  gameMode: string
  isActive: boolean
  onGameStart: () => void
  onGameEnd: () => void
}

interface Target {
  id: string
  position: [number, number, number]
  spawnTime: number
}

// FPS Camera Controller
function FPSCameraController({ isActive }: { isActive: boolean }) {
  const { camera, gl } = useThree()
  const [isLocked, setIsLocked] = useState(false)
  const mouseSensitivity = useRef(0.002)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const yaw = useRef(0)
  const pitch = useRef(0)

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseMove = (event: MouseEvent) => {
      if (!isLocked || !isActive) return

      const movementX = event.movementX || 0
      const movementY = event.movementY || 0

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
      
      // Manage cursor visibility
      if (isCurrentlyLocked) {
        document.body.style.cursor = 'none'
      } else {
        document.body.style.cursor = 'default'
      }
    }

    const onPointerLockError = () => {
      console.error('Pointer lock failed')
      document.body.style.cursor = 'default'
    }

    // Event listeners
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.addEventListener('pointerlockerror', onPointerLockError)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      document.removeEventListener('pointerlockerror', onPointerLockError)
      // Restore cursor when component unmounts
      document.body.style.cursor = 'default'
    }
  }, [camera, gl, isActive, isLocked])

  // Handle click to request pointer lock
  useEffect(() => {
    const canvas = gl.domElement
    
    const handleClick = () => {
      if (isActive && !isLocked) {
        canvas.requestPointerLock()
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [gl, isActive, isLocked])

  // Handle ESC key to exit pointer lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLocked) {
        document.exitPointerLock()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLocked])

  return null
}

// Target with raycasting detection
function Target({ position, onHit, targetId }: { 
  position: [number, number, number], 
  onHit: (id: string) => void,
  targetId: string 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useEffect(() => {
    if (meshRef.current) {
      // Animate target spawn
      meshRef.current.scale.setScalar(0)
      const animate = () => {
        if (meshRef.current && meshRef.current.scale.x < 1) {
          meshRef.current.scale.addScalar(0.1)
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [])

  return (
    <mesh
      ref={meshRef}
      position={position}
      userData={{ targetId, onHit }}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial 
        color="#00ff88" 
        emissive="#00ff88" 
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

// Shooting system with raycasting
function ShootingSystem({ isActive, onTargetHit }: { 
  isActive: boolean, 
  onTargetHit: (targetId: string) => void 
}) {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isActive || document.pointerLockElement === null) return

      // Only shoot on left click
      if (event.button !== 0) return

      // Cast ray from camera center
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
      
      // Find intersections with targets
      const intersects = raycaster.current.intersectObjects(scene.children, true)
      
      for (const intersect of intersects) {
        const targetData = intersect.object.userData
        if (targetData.targetId && targetData.onHit) {
          targetData.onHit(targetData.targetId)
          break
        }
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [camera, scene, isActive, onTargetHit])

  return null
}

export function GameCanvas({ gameMode, isActive, onGameStart, onGameEnd }: GameCanvasProps) {
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [hitEffects, setHitEffects] = useState<any[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [showESCMenu, setShowESCMenu] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const spawnIntervalRef = useRef<NodeJS.Timeout>()
  const gameStartTime = useRef<number>(Date.now())

  // Get game store functions
  const {
    startGame,
    endGame,
    hitTarget,
    missTarget,
    pauseGame,
    resumeGame,
    isPaused: gamePaused
  } = useGameStore()

  // Get level store functions
  const { gainXP, calculateXPFromPerformance } = useLevelStore()

  // Get audio system
  const {
    playHitSound,
    playMissSound,
    playLevelUpSound,
    playXPGainSound,
    setMasterVolume
  } = useAudioSystem()

  // Use game store isPaused state
  const actualIsPaused = isPaused || gamePaused

  // Utility functions for effects
  const createHitEffect = (position: THREE.Vector3, accuracy: number) => {
    return {
      id: `hit-${Date.now()}`,
      position: [position.x, position.y, position.z] as [number, number, number],
      type: 'hit' as const,
      accuracy,
      timestamp: Date.now()
    }
  }

  const createMissEffect = (position: THREE.Vector3) => {
    return {
      id: `miss-${Date.now()}`,
      position: [position.x, position.y, position.z] as [number, number, number],
      type: 'miss' as const,
      timestamp: Date.now()
    }
  }

  const triggerShake = (intensity: number, duration: number) => {
    // Simple screen shake implementation
    if (document.body) {
      document.body.style.transform = `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`
      setTimeout(() => {
        if (document.body) {
          document.body.style.transform = 'translate(0, 0)'
        }
      }, duration)
    }
  }

  // Monitor pointer lock state
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange)
  }, [])

  // Game timer (pause when paused)
  useEffect(() => {
    if (isActive && timeLeft > 0 && !actualIsPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onGameEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, actualIsPaused, onGameEnd])

  // Target spawning (pause when paused)
  useEffect(() => {
    if (isActive && !actualIsPaused) {
      const spawnInterval = gameMode === 'speed' ? 800 : gameMode === 'precision' ? 2500 : 1500
      const targetLifetime = gameMode === 'speed' ? 2500 : gameMode === 'precision' ? 5000 : 3500
      
      spawnIntervalRef.current = setInterval(() => {
        const newTarget: Target = {
          id: Date.now().toString(),
          position: [
            (Math.random() - 0.5) * (gameMode === 'precision' ? 8 : 12),
            (Math.random() - 0.2) * (gameMode === 'tracking' ? 6 : 4),
            (Math.random() - 0.5) * 18 + (gameMode === 'flick' ? 15 : 12)
          ] as [number, number, number],
          spawnTime: Date.now()
        }
        
        setTargets(prev => [...prev, newTarget])
        
        // Auto-remove targets that aren't hit
        setTimeout(() => {
          setTargets(prev => {
            const stillExists = prev.find(t => t.id === newTarget.id)
            if (stillExists) {
              handleMiss(new THREE.Vector3(...newTarget.position)) // Count as miss if not hit
            }
            return prev.filter(t => t.id !== newTarget.id)
          })
        }, targetLifetime)
      }, spawnInterval)
    } else {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }
  }, [isActive, actualIsPaused, gameMode])

  const handleTargetHit = (targetId: string, accuracy: number, distance: number) => {
    const target = targets.find(t => t.id === targetId)
    if (!target) return

    // Calculate reaction time
    const reactionTime = Date.now() - target.spawnTime
    setReactionTimes(prev => [...prev, reactionTime])

    // Update stats
    setTargets(prev => prev.filter(t => t.id !== targetId))
    setHits(prev => prev + 1)
    
    // Calculate score based on accuracy and reaction time
    const baseScore = 100
    const accuracyMultiplier = accuracy / 100
    const speedBonus = Math.max(0, (2000 - reactionTime) / 2000) * 50
    const finalScore = Math.round(baseScore * accuracyMultiplier + speedBonus)
    
    setScore(prev => prev + finalScore)

    // Update accuracy
    const totalShots = hits + misses + 1
    setAccuracy(((hits + 1) / totalShots) * 100)

    // Play hit sound based on accuracy
    if (accuracy >= 95) {
      playHitSound(accuracy, distance) // Perfect hit sound
      triggerShake(2, 100) // Light screen shake for perfect hits
    } else if (accuracy >= 85) {
      playHitSound(accuracy, distance) // Good hit sound
    } else {
      playHitSound(accuracy, distance) // Normal hit sound
    }

    // Create hit effect
    const targetPos = new THREE.Vector3(...target.position)
    const hitEffect = createHitEffect(targetPos, accuracy)
    setHitEffects(prev => [...prev, hitEffect])

    // Update game store for XP calculation
    hitTarget(targetId, { 
      targetId, 
      position: target.position,
      accuracy: accuracy / 100, 
      reactionTime,
      timestamp: Date.now()
    })

    // Show XP gain notification
    const xpGained = Math.round(finalScore / 10)
    if (xpGained > 0) {
      playXPGainSound(xpGained)
    }
  }

  const handleMiss = (position?: THREE.Vector3) => {
    setMisses(prev => prev + 1)
    const totalShots = hits + misses + 1
    setAccuracy((hits / totalShots) * 100)
    
    playMissSound()
    missTarget()

    // Create miss effect if position provided
    if (position) {
      const missEffect = createMissEffect(position)
      setHitEffects(prev => [...prev, missEffect])
    }
  }

  // Handle effect completion
  const handleEffectComplete = (effectId: string) => {
    setHitEffects(prev => prev.filter(effect => effect.id !== effectId))
  }

  // Pause/Resume functions
  const handlePause = () => {
    setIsPaused(true)
    setShowESCMenu(true)
  }

  const handleResume = () => {
    setIsPaused(false)
    setShowESCMenu(false)
  }

  const handleRestart = () => {
    setTargets([])
    setScore(0)
    setTimeLeft(60)
    setHits(0)
    setMisses(0)
    setReactionTimes([])
    setAccuracy(100)
    setHitEffects([])
    setIsPaused(false)
    setShowESCMenu(false)
    gameStartTime.current = Date.now()
  }

  const handleExit = () => {
    onGameEnd()
  }

  // Game start/end management
  useEffect(() => {
    if (isActive && timeLeft === 60) {
      gameStartTime.current = Date.now()
      startGame(gameMode as any, 'medium')
    }
  }, [isActive, startGame, gameMode])

  // Game end - award XP
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      const sessionDuration = (Date.now() - gameStartTime.current) / 1000
      const avgReactionTime = reactionTimes.length > 0 
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
        : 1000

      // Calculate XP based on performance
      const performance = {
        score,
        accuracy,
        reactionTime: avgReactionTime,
        hits,
        misses,
        streak: 0, // We'll need to track this properly later
        gameMode: gameMode as any,
        difficulty: 'medium' as any,
        duration: sessionDuration,
        perfectShots: 0, // We'll need to track this properly later
        consistency: Math.max(60, 100 - (Math.abs(accuracy - 85) * 2)) // Simple consistency calculation
      }

      const xpGained = calculateXPFromPerformance(performance)
      if (xpGained > 0) {
        const levelBefore = useLevelStore.getState().currentLevel
        gainXP(xpGained, `${gameMode}_training`)
        const levelAfter = useLevelStore.getState().currentLevel
        
        if (levelAfter > levelBefore) {
          playLevelUpSound()
        }
      }

      endGame()
    }
  }, [timeLeft, isActive, score, accuracy, reactionTimes, gameMode, gainXP, calculateXPFromPerformance, endGame, playLevelUpSound])

  // Reset game state when mode changes
  useEffect(() => {
    setTargets([])
    setScore(0)
    setTimeLeft(60)
    setHits(0)
    setMisses(0)
    setReactionTimes([])
    setAccuracy(100)
  }, [gameMode])

  return (
    <div className="w-full h-screen relative game-area">
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
        
        <FPSCameraController isActive={isActive} />
        <ShootingSystem isActive={isActive} onTargetHit={(targetId) => handleTargetHit(targetId, 85, 1)} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Enhanced Targets */}
        {targets.map(target => (
          <EnhancedTarget
            key={target.id}
            position={target.position}
            onHit={handleTargetHit}
            targetId={target.id}
            gameMode={gameMode}
          />
        ))}

        {/* Hit Effects */}
        <HitEffects effects={hitEffects} onEffectComplete={handleEffectComplete} />
        
        {/* Environment */}
        <gridHelper args={[50, 50, '#333333', '#333333']} position={[0, 0, 0]} />
        
        {/* Walls */}
        <mesh position={[0, 5, -25]}>
          <planeGeometry args={[50, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[50, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[25, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[50, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </Canvas>

      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 text-white space-y-2 ui-element">
        <div className="hud-element">
          <div className="text-2xl font-bold text-gaming-primary">
            Score: {score}
          </div>
        </div>
        
        <div className="hud-element">
          <div className="text-xl">
            Time: {timeLeft}s
          </div>
        </div>
        
        <div className="hud-element">
          <div className="text-sm text-gray-400">
            Mode: {gameMode.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Crosshair - Only show when pointer is locked */}
      {isActive && isPointerLocked && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="w-6 h-6 relative">
            <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-gaming-primary transform -translate-y-1/2 opacity-90"></div>
            <div className="absolute left-1/2 top-1 bottom-1 w-0.5 bg-gaming-primary transform -translate-x-1/2 opacity-90"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gaming-primary transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"></div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white ui-element">
        <div className="hud-element">
          <p className="text-sm text-gray-400">
            🖱️ Mouse Look • 🖱️ Left Click to Shoot • Space - Pause • ESC - Menu
          </p>
          {!isPointerLocked && isActive && (
            <p className="text-xs text-gaming-primary mt-2 animate-pulse">
              Click to lock cursor and start FPS controls
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 