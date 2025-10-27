import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Color } from 'three'
import * as THREE from 'three'

interface ThoughtParticleProps {
  position: Vector3
  target: Vector3
  intensity: number
  confidence: number
  type: 'analysis' | 'decision' | 'action' | 'reflection'
  isActive: boolean
}

const PARTICLE_COLORS = {
  analysis: '#4A90E2',    // Blue
  decision: '#F5A623',    // Orange
  action: '#50E3C2',      // Cyan
  reflection: '#BD10E0'   // Purple
}

export const ThoughtParticle: React.FC<ThoughtParticleProps> = ({
  position,
  target,
  intensity,
  confidence,
  type,
  isActive
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  const color = useMemo(() => new Color(PARTICLE_COLORS[type]), [type])
  const size = useMemo(() => 0.02 + (confidence * 0.08), [confidence])
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    if (isActive) {
      // Pulsing animation based on intensity
      const pulse = Math.sin(time * 4 + intensity * 10) * 0.3 + 0.7
      meshRef.current.scale.setScalar(size * pulse)
      
      // Emissive intensity based on confidence
      materialRef.current.emissiveIntensity = confidence * 0.5 * pulse
      
      // Move towards target
      const direction = target.clone().sub(position).normalize()
      const speed = 0.01 * intensity
      meshRef.current.position.add(direction.multiplyScalar(speed))
      
      // Add slight random movement for organic feel
      meshRef.current.position.x += Math.sin(time * 2 + intensity) * 0.001
      meshRef.current.position.y += Math.cos(time * 1.5 + intensity) * 0.001
    } else {
      // Gentle idle animation
      const idle = Math.sin(time + intensity) * 0.1 + 0.9
      meshRef.current.scale.setScalar(size * idle * 0.5)
      materialRef.current.emissiveIntensity = 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}