import React, { useState, useEffect, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3, Color } from 'three'
import * as THREE from 'three'

interface ReasoningText3DProps {
  text: string
  position: Vector3
  maxWidth?: number
  fontSize?: number
  confidence?: number
  isStreaming?: boolean
  onComplete?: () => void
}

export const ReasoningText3D: React.FC<ReasoningText3DProps> = ({
  text,
  position,
  maxWidth = 4,
  fontSize = 0.15,
  confidence = 1.0,
  isStreaming = false,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const textRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  // Typewriter effect for streaming text
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text)
      setCurrentIndex(text.length)
      return
    }
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex(prev => prev + 1)
      }, 30 + Math.random() * 20) // Variable typing speed for natural feel
      
      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [text, currentIndex, isStreaming, onComplete])
  
  // Reset when text changes
  useEffect(() => {
    setCurrentIndex(0)
    setDisplayedText('')
  }, [text])
  
  // Animate text appearance and confidence
  useFrame((state) => {
    if (!textRef.current || !materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    if (isStreaming && currentIndex < text.length) {
      // Pulsing cursor effect
      const pulse = Math.sin(time * 8) * 0.3 + 0.7
      materialRef.current.emissiveIntensity = pulse * 0.2
    } else {
      // Steady glow based on confidence
      materialRef.current.emissiveIntensity = confidence * 0.15
    }
    
    // Subtle floating animation
    textRef.current.position.y = position.y + Math.sin(time * 0.5) * 0.02
  })
  
  // Color based on confidence level
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return '#50E3C2' // High confidence - cyan
    if (confidence > 0.6) return '#4A90E2' // Medium confidence - blue
    if (confidence > 0.4) return '#F5A623' // Low confidence - orange
    return '#D0021B' // Very low confidence - red
  }
  
  const textColor = getConfidenceColor(confidence)
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={fontSize}
      maxWidth={maxWidth}
      lineHeight={1.2}
      letterSpacing={0.02}
      textAlign="left"
      font="/fonts/Inter-Regular.woff"
      anchorX="left"
      anchorY="top"
    >
      {displayedText}
      {isStreaming && currentIndex < text.length && (
        <meshStandardMaterial
          ref={materialRef}
          color={textColor}
          emissive={textColor}
          emissiveIntensity={0.15}
          transparent
          opacity={0.9}
        />
      )}
      {(!isStreaming || currentIndex >= text.length) && (
        <meshStandardMaterial
          color={textColor}
          emissive={textColor}
          emissiveIntensity={confidence * 0.15}
          transparent
          opacity={0.8 + confidence * 0.2}
        />
      )}
    </Text>
  )
}

// Component for confidence indicators
interface ConfidenceIndicatorProps {
  confidence: number
  position: Vector3
  isActive: boolean
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  position,
  isActive
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    if (isActive) {
      // Pulsing based on confidence
      const pulse = Math.sin(time * 4) * (1 - confidence) * 0.3 + confidence
      meshRef.current.scale.setScalar(pulse * 0.5)
      materialRef.current.emissiveIntensity = pulse * 0.4
    } else {
      meshRef.current.scale.setScalar(confidence * 0.3)
      materialRef.current.emissiveIntensity = 0.1
    }
  })
  
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return '#50E3C2'
    if (confidence > 0.6) return '#4A90E2'
    if (confidence > 0.4) return '#F5A623'
    return '#D0021B'
  }
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={getConfidenceColor(confidence)}
        emissive={getConfidenceColor(confidence)}
        emissiveIntensity={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

// Component for particle density visualization
interface ParticleDensityProps {
  density: number
  position: Vector3
  isActive: boolean
}

export const ParticleDensity: React.FC<ParticleDensityProps> = ({
  density,
  position,
  isActive
}) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particleCount = Math.floor(density * 50) + 10
  
  const geometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere around the center
      const radius = Math.random() * 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = position.x + radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = position.z + radius * Math.cos(phi)
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [particleCount, position])
  
  useFrame((state) => {
    if (!pointsRef.current || !isActive) return
    
    const time = state.clock.getElapsedTime()
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    // Animate particles swirling around the center
    for (let i = 0; i < particleCount; i++) {
      const baseIndex = i * 3
      const angle = time * 0.5 + i * 0.1
      const radius = 0.2 + Math.sin(time + i * 0.5) * 0.1
      
      positions[baseIndex] = position.x + Math.cos(angle) * radius
      positions[baseIndex + 1] = position.y + Math.sin(time * 0.3 + i * 0.2) * 0.1
      positions[baseIndex + 2] = position.z + Math.sin(angle) * radius
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!isActive) return null
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.01}
        color="#4A90E2"
        transparent
        opacity={density}
        sizeAttenuation
      />
    </points>
  )
}