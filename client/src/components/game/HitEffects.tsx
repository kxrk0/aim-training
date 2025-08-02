import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystem {
  id: string
  position: THREE.Vector3
  particles: Particle[]
  startTime: number
  duration: number
  type: 'hit' | 'miss' | 'perfect'
}

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  life: number
  maxLife: number
  size: number
}

interface HitEffectsProps {
  effects: ParticleSystem[]
  onEffectComplete: (id: string) => void
}

export function HitEffects({ effects, onEffectComplete }: HitEffectsProps) {
  return (
    <>
      {effects.map(effect => (
        <ParticleSystemComponent
          key={effect.id}
          effect={effect}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
    </>
  )
}

function ParticleSystemComponent({ 
  effect, 
  onComplete 
}: { 
  effect: ParticleSystem
  onComplete: () => void 
}) {
  const meshRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  const positionsRef = useRef<Float32Array>()
  const colorsRef = useRef<Float32Array>()
  const sizesRef = useRef<Float32Array>()

  useEffect(() => {
    if (meshRef.current) {
      const particleCount = effect.particles.length
      
      // Initialize arrays
      positionsRef.current = new Float32Array(particleCount * 3)
      colorsRef.current = new Float32Array(particleCount * 3)
      sizesRef.current = new Float32Array(particleCount)

      // Set up geometry
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positionsRef.current, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsRef.current, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizesRef.current, 1))

      meshRef.current.geometry = geometry

      // Update initial particle data
      updateParticleBuffers()
    }
  }, [effect])

  const updateParticleBuffers = () => {
    if (!positionsRef.current || !colorsRef.current || !sizesRef.current) return

    effect.particles.forEach((particle, i) => {
      const i3 = i * 3

      // Position
      positionsRef.current![i3] = particle.position.x
      positionsRef.current![i3 + 1] = particle.position.y
      positionsRef.current![i3 + 2] = particle.position.z

      // Color
      colorsRef.current![i3] = particle.color.r
      colorsRef.current![i3 + 1] = particle.color.g
      colorsRef.current![i3 + 2] = particle.color.b

      // Size
      sizesRef.current![i] = particle.size * (particle.life / particle.maxLife)
    })

    if (meshRef.current) {
      meshRef.current.geometry.attributes.position.needsUpdate = true
      meshRef.current.geometry.attributes.color.needsUpdate = true
      meshRef.current.geometry.attributes.size.needsUpdate = true
    }
  }

  useFrame((state, delta) => {
    const elapsed = Date.now() - effect.startTime
    
    if (elapsed >= effect.duration) {
      onComplete()
      return
    }

    // Update particles
    effect.particles.forEach(particle => {
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))
      
      // Update velocity (gravity, drag)
      particle.velocity.y -= 9.8 * delta * 0.1 // Gravity
      particle.velocity.multiplyScalar(0.98) // Drag
      
      // Update life
      particle.life -= delta
      
      // Fade out
      const lifeRatio = particle.life / particle.maxLife
      particle.color.multiplyScalar(lifeRatio > 0 ? 1 : 0)
    })

    // Filter out dead particles
    effect.particles = effect.particles.filter(p => p.life > 0)
    
    updateParticleBuffers()

    // Update material opacity
    if (materialRef.current) {
      const progress = elapsed / effect.duration
      materialRef.current.opacity = 1 - progress
    }
  })

  return (
    <points ref={meshRef} position={[effect.position.x, effect.position.y, effect.position.z]}>
      <pointsMaterial
        ref={materialRef}
        size={0.1}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Utility functions to create particle systems
export function createHitEffect(position: THREE.Vector3, accuracy: number): ParticleSystem {
  const particleCount = Math.floor(20 + accuracy * 0.3)
  const particles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      Math.random() * 6 + 2,
      (Math.random() - 0.5) * 8
    )

    const color = accuracy >= 95 
      ? new THREE.Color(1, 1, 0.2) // Gold for perfect hits
      : accuracy >= 85 
      ? new THREE.Color(0.2, 1, 0.2) // Green for good hits
      : new THREE.Color(0.2, 0.8, 1) // Blue for normal hits

    particles.push({
      position: position.clone(),
      velocity,
      color,
      life: 1 + Math.random() * 0.5,
      maxLife: 1 + Math.random() * 0.5,
      size: 0.05 + Math.random() * 0.05
    })
  }

  return {
    id: Date.now().toString() + Math.random(),
    position: position.clone(),
    particles,
    startTime: Date.now(),
    duration: 1500,
    type: accuracy >= 95 ? 'perfect' : 'hit'
  }
}

export function createMissEffect(position: THREE.Vector3): ParticleSystem {
  const particleCount = 8
  const particles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 4
    )

    particles.push({
      position: position.clone(),
      velocity,
      color: new THREE.Color(1, 0.2, 0.2), // Red for misses
      life: 0.8,
      maxLife: 0.8,
      size: 0.02
    })
  }

  return {
    id: Date.now().toString() + Math.random(),
    position: position.clone(),
    particles,
    startTime: Date.now(),
    duration: 800,
    type: 'miss'
  }
}

// Screen shake hook
export function useScreenShake() {
  const shakeRef = useRef({ intensity: 0, duration: 0, startTime: 0 })

  const triggerShake = (intensity: number, duration: number) => {
    shakeRef.current = {
      intensity,
      duration,
      startTime: Date.now()
    }
  }

  const getShakeOffset = (): { x: number; y: number } => {
    const { intensity, duration, startTime } = shakeRef.current
    const elapsed = Date.now() - startTime

    if (elapsed >= duration || intensity === 0) {
      return { x: 0, y: 0 }
    }

    const progress = elapsed / duration
    const currentIntensity = intensity * (1 - progress)

    return {
      x: (Math.random() - 0.5) * currentIntensity,
      y: (Math.random() - 0.5) * currentIntensity
    }
  }

  return { triggerShake, getShakeOffset }
}