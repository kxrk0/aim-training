import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
// import { motion } from 'framer-motion-3d' // Not available, use regular motion
import * as THREE from 'three'

interface EnhancedTargetProps {
  position: [number, number, number]
  onHit: (id: string, accuracy: number, distance: number) => void
  targetId: string
  gameMode: string
}

export function EnhancedTarget({ position, onHit, targetId, gameMode }: EnhancedTargetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [isSpawning, setIsSpawning] = useState(true)
  const [isHit, setIsHit] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const spawnTime = useRef(Date.now())
  const pulseSpeed = useRef(2 + Math.random() * 1.5)

  // Spawn animation
  useEffect(() => {
    if (meshRef.current) {
      // Start from scale 0
      meshRef.current.scale.setScalar(0)
      
      // Smooth spawn animation
      const startTime = Date.now()
      const animateDuration = 300 // ms
      
      const animate = () => {
        if (!meshRef.current) return
        
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animateDuration, 1)
        
        // Smooth easing function (ease-out-back)
        const easeOutBack = (t: number) => {
          const c1 = 1.70158
          const c3 = c1 + 1
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
        }
        
        const scale = easeOutBack(progress)
        meshRef.current.scale.setScalar(scale)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsSpawning(false)
          setIsPulsing(true)
        }
      }
      
      animate()
    }
  }, [])

  // Pulsing animation
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return
    
    if (isPulsing && !isHit) {
      const time = state.clock.getElapsedTime()
      const pulse = 1 + Math.sin(time * pulseSpeed.current) * 0.1
      
      // Target pulsing
      meshRef.current.scale.setScalar(pulse)
      
      // Glow pulsing
      const glowPulse = 1 + Math.sin(time * pulseSpeed.current * 1.2) * 0.3
      glowRef.current.scale.setScalar(glowPulse * 1.2)
      
      // Color shifting based on age
      const age = Date.now() - spawnTime.current
      const ageRatio = Math.min(age / 4000, 1) // 4 seconds max age
      
      // Change color from green to yellow to red over time
      let color = new THREE.Color()
      if (ageRatio < 0.5) {
        color.setHSL(0.33 - ageRatio * 0.1, 1, 0.5) // Green to yellow-green
      } else {
        color.setHSL(0.23 - (ageRatio - 0.5) * 0.46, 1, 0.5) // Yellow-green to red
      }
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.color = color
      material.emissive = color.clone().multiplyScalar(0.3)
    }
  })

  // Hit animation
  const animateHit = () => {
    setIsHit(true)
    setIsPulsing(false)
    
    if (!meshRef.current || !glowRef.current) return
    
    // Hit flash effect
    const originalColor = (meshRef.current.material as THREE.MeshStandardMaterial).color.clone()
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    
    // Flash white
    material.color.setHex(0xffffff)
    material.emissive.setHex(0xffffff)
    material.emissiveIntensity = 1
    
    // Explosion scale animation
    const startTime = Date.now()
    const animateDuration = 200
    
    const animate = () => {
      if (!meshRef.current || !glowRef.current) return
      
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animateDuration, 1)
      
      // Scale up and fade out
      const scale = 1 + progress * 2
      const opacity = 1 - progress
      
      meshRef.current.scale.setScalar(scale)
      glowRef.current.scale.setScalar(scale * 1.5)
      
      material.opacity = opacity
      material.transparent = true
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    setTimeout(() => {
      material.color = originalColor
      material.emissive.setHex(0x000000)
      material.emissiveIntensity = 0.2
      animate()
    }, 50)
  }

  // Calculate hit accuracy based on target center distance
  const calculateAccuracy = (intersectPoint: THREE.Vector3): number => {
    const targetCenter = new THREE.Vector3(...position)
    const distance = intersectPoint.distanceTo(targetCenter)
    const maxDistance = 0.5 // Target radius
    
    // Perfect hit: 100%, edge hit: 60%
    const accuracy = Math.max(60, 100 - (distance / maxDistance) * 40)
    return accuracy
  }

  const handleClick = (event: any) => {
    if (isHit || isSpawning) return
    
    // Calculate accuracy and distance
    const intersectPoint = event.point as THREE.Vector3
    const accuracy = calculateAccuracy(intersectPoint)
    const distance = intersectPoint.distanceTo(new THREE.Vector3(...position))
    
    animateHit()
    
    // Delay onHit to allow hit animation to play
    setTimeout(() => {
      onHit(targetId, accuracy, distance)
    }, 100)
  }

  // Different target styles based on game mode
  const getTargetStyle = () => {
    switch (gameMode) {
      case 'speed':
        return {
          color: '#ff6b6b',
          emissive: '#ff6b6b',
          size: 0.4,
          glowColor: '#ff9999'
        }
      case 'precision':
        return {
          color: '#4ecdc4',
          emissive: '#4ecdc4',
          size: 0.3,
          glowColor: '#7ee8e1'
        }
      case 'tracking':
        return {
          color: '#45b7d1',
          emissive: '#45b7d1',
          size: 0.5,
          glowColor: '#78c9e4'
        }
      case 'flick':
        return {
          color: '#f9ca24',
          emissive: '#f9ca24',
          size: 0.35,
          glowColor: '#fdd835'
        }
      default:
        return {
          color: '#00ff88',
          emissive: '#00ff88',
          size: 0.5,
          glowColor: '#4dff9f'
        }
    }
  }

  const targetStyle = getTargetStyle()

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh
        ref={glowRef}
        userData={{ targetId, onHit: handleClick }}
      >
        <sphereGeometry args={[targetStyle.size * 1.3, 16, 16]} />
        <meshBasicMaterial 
          color={targetStyle.glowColor}
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Main target */}
      <mesh
        ref={meshRef}
        userData={{ targetId, onHit: handleClick }}
        onClick={handleClick}
      >
        <sphereGeometry args={[targetStyle.size, 32, 32]} />
        <meshStandardMaterial 
          color={targetStyle.color}
          emissive={targetStyle.emissive}
          emissiveIntensity={0.3}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
      
      {/* Inner core for better hit detection */}
      <mesh userData={{ targetId, onHit: handleClick }}>
        <sphereGeometry args={[targetStyle.size * 0.7, 16, 16]} />
        <meshStandardMaterial 
          color={targetStyle.color}
          emissive={targetStyle.emissive}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Hit particles (will be enhanced later) */}
      {isHit && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  )
}