import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, BufferGeometry, Line, LineBasicMaterial, CatmullRomCurve3 } from 'three'
import * as THREE from 'three'
import type { AgentState } from '@/types'

interface AgentConnectionProps {
  fromAgent: AgentState
  toAgent: AgentState
  strength: number
  isActive: boolean
  dataFlowDirection?: 'forward' | 'backward' | 'bidirectional'
}

export const AgentConnection: React.FC<AgentConnectionProps> = ({
  fromAgent,
  toAgent,
  strength,
  isActive,
  dataFlowDirection = 'forward'
}) => {
  const lineRef = useRef<Line>(null)
  const materialRef = useRef<LineBasicMaterial>(null)
  
  // Calculate connection points
  const fromPosition = fromAgent.visualConfig.position
  const toPosition = toAgent.visualConfig.position
  
  // Create curved line geometry
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      fromPosition,
      // Add a slight curve by creating a midpoint offset
      new Vector3(
        (fromPosition.x + toPosition.x) / 2,
        (fromPosition.y + toPosition.y) / 2 + 0.5,
        (fromPosition.z + toPosition.z) / 2
      ),
      toPosition
    ])
    
    const points = curve.getPoints(50)
    const geometry = new BufferGeometry().setFromPoints(points)
    
    return geometry
  }, [fromPosition, toPosition])
  
  // Animate the connection based on activity and data flow
  useFrame((state) => {
    if (!materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    if (isActive) {
      // Pulsing effect for active connections
      const pulse = Math.sin(time * 4) * 0.3 + 0.7
      materialRef.current.opacity = pulse * strength
      
      // Color animation based on data flow direction
      switch (dataFlowDirection) {
        case 'forward':
          materialRef.current.color.setHSL(0.6, 1, 0.5 + pulse * 0.3) // Blue to cyan
          break
        case 'backward':
          materialRef.current.color.setHSL(0.3, 1, 0.5 + pulse * 0.3) // Green
          break
        case 'bidirectional':
          materialRef.current.color.setHSL((time * 0.5) % 1, 1, 0.5 + pulse * 0.3) // Rainbow
          break
      }
    } else {
      // Subtle idle animation
      const idle = Math.sin(time * 0.5) * 0.1 + 0.3
      materialRef.current.opacity = idle * strength * 0.5
      materialRef.current.color.setHSL(0.7, 0.5, 0.3) // Dim purple
    }
  })
  
  // Don't render very weak connections
  if (strength < 0.1) return null
  
  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        transparent
        opacity={strength}
        linewidth={Math.max(1, strength * 3)}
      />
    </line>
  )
}

// Particle system for data flow visualization
interface DataFlowParticlesProps {
  fromPosition: Vector3
  toPosition: Vector3
  isActive: boolean
  direction: 'forward' | 'backward' | 'bidirectional'
}

export const DataFlowParticles: React.FC<DataFlowParticlesProps> = ({
  fromPosition,
  toPosition,
  isActive,
  direction
}) => {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const particleCount = 20
    const positions = new Float32Array(particleCount * 3)
    
    // Initialize particles along the connection line
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1)
      positions[i * 3] = fromPosition.x + (toPosition.x - fromPosition.x) * t
      positions[i * 3 + 1] = fromPosition.y + (toPosition.y - fromPosition.y) * t
      positions[i * 3 + 2] = fromPosition.z + (toPosition.z - fromPosition.z) * t
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [fromPosition, toPosition])
  
  useFrame((state) => {
    if (!particlesRef.current || !isActive) return
    
    const time = state.clock.getElapsedTime()
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    
    // Animate particles flowing along the connection
    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3
      let t = (particleIndex / (positions.length / 3 - 1) + time * 0.5) % 1
      
      // Reverse direction if needed
      if (direction === 'backward') {
        t = 1 - t
      } else if (direction === 'bidirectional') {
        t = Math.abs(Math.sin(time + particleIndex * 0.5))
      }
      
      positions[i] = fromPosition.x + (toPosition.x - fromPosition.x) * t
      positions[i + 1] = fromPosition.y + (toPosition.y - fromPosition.y) * t
      positions[i + 2] = fromPosition.z + (toPosition.z - fromPosition.z) * t
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!isActive) return null
  
  return (
    <points ref={particlesRef} geometry={particleGeometry}>
      <pointsMaterial
        size={0.05}
        color="#4A90E2"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}