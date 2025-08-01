import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface GameCanvasProps {
  gameMode: string
  isActive: boolean
  onGameStart: () => void
  onGameEnd: () => void
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
  const [targets, setTargets] = useState<Array<{ id: string, position: [number, number, number] }>>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const spawnIntervalRef = useRef<NodeJS.Timeout>()

  // Monitor pointer lock state
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange)
  }, [])

  // Game timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
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
  }, [isActive, timeLeft, onGameEnd])

  // Target spawning
  useEffect(() => {
    if (isActive) {
      const spawnInterval = gameMode === 'speed' ? 1000 : 2000
      
      spawnIntervalRef.current = setInterval(() => {
        const newTarget = {
          id: Date.now().toString(),
          position: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.3) * 4,
            (Math.random() - 0.5) * 20 + 10
          ] as [number, number, number]
        }
        
        setTargets(prev => [...prev, newTarget])
        
        setTimeout(() => {
          setTargets(prev => prev.filter(t => t.id !== newTarget.id))
        }, 4000)
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
  }, [isActive, gameMode])

  const handleTargetHit = (targetId: string) => {
    setTargets(prev => prev.filter(t => t.id !== targetId))
    setScore(prev => prev + 100)
  }

  // Reset game state when mode changes
  useEffect(() => {
    setTargets([])
    setScore(0)
    setTimeLeft(60)
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
        <ShootingSystem isActive={isActive} onTargetHit={handleTargetHit} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Targets */}
        {targets.map(target => (
          <Target
            key={target.id}
            position={target.position}
            onHit={handleTargetHit}
            targetId={target.id}
          />
        ))}
        
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