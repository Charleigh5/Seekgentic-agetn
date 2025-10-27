import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, CatmullRomCurve3, BufferGeometry, LineBasicMaterial } from 'three'
import * as THREE from 'three'

interface NeuralPathwayProps {
  startPoint: Vector3
  endPoint: Vector3
  controlPoints?: Vector3[]
  strength: number
  isActive: boolean
  type: 'reasoning' | 'data' | 'feedback'
}

const PATHWAY_COLORS = {
  reasoning: '#4A90E2',
  data: '#50E3C2', 
  feedback: '#F5A623'
}

export const NeuralPathway: React.FC<NeuralPathwayProps> = ({
  startPoint,
  endPoint,
  controlPoints = [],
  strength,
  isActive,
  type
}) => {
  const lineRef = useRef<THREE.Line>(null)
  const materialRef = useRef<LineBasicMaterial>(null)
  
  // Create curved path
  const curve = useMemo(() => {
    const points = [startPoint]
    
    // Add control points for organic curves
    if (controlPoints.length > 0) {
      points.push(...controlPoints)
    } else {
      // Generate automatic control points for natural curves
      const midPoint = startPoint.clone().lerp(endPoint, 0.5)
      const offset = new Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )
      points.push(midPoint.add(offset))
    }
    
    points.push(endPoint)
    
    return new CatmullRomCurve3(points)
  }, [startPoint, endPoint, controlPoints])
  
  const geometry = useMemo(() => {
    const points = curve.getPoints(50)
    return new BufferGeometry().setFromPoints(points)
  }, [curve])
  
  useFrame((state) => {
    if (!materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    if (isActive) {
      // Pulsing effect for active pathways
      const pulse = Math.sin(time * 6) * 0.4 + 0.6
      materialRef.current.opacity = pulse * strength
      
      // Color intensity based on activity
      const baseColor = PATHWAY_COLORS[type]
      materialRef.current.color.setStyle(baseColor)
    } else {
      // Dim idle pathways
      const idle = Math.sin(time * 0.5) * 0.1 + 0.2
      materialRef.current.opacity = idle * strength * 0.5
      materialRef.current.color.setStyle('#666666')
    }
  })
  
  // Don't render very weak pathways
  if (strength < 0.1) return null
  
  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={PATHWAY_COLORS[type]}
        transparent
        opacity={strength}
        linewidth={Math.max(1, strength * 3)}
      />
    </line>
  )
}

// Component for flowing particles along pathways
interface PathwayFlowProps {
  curve: CatmullRomCurve3
  isActive: boolean
  speed: number
  particleCount: number
}

export const PathwayFlow: React.FC<PathwayFlowProps> = ({
  curve,
  isActive,
  speed,
  particleCount = 10
}) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    
    // Initialize particles along the curve
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1)
      const point = curve.getPoint(t)
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [curve, particleCount])
  
  useFrame((state) => {
    if (!pointsRef.current || !isActive) return
    
    const time = state.clock.getElapsedTime()
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    // Animate particles flowing along the curve
    for (let i = 0; i < particleCount; i++) {
      const baseT = i / (particleCount - 1)
      let t = (baseT + time * speed) % 1
      
      const point = curve.getPoint(t)
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!isActive) return null
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color="#4A90E2"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}