import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { Text } from '@react-three/drei'
import type { AgentState, AgentType } from '@/types'

interface Agent3DProps {
  agent: AgentState
  position: Vector3
  onHover?: (agent: AgentState | null) => void
  onClick?: (agent: AgentState) => void
}

const AGENT_GEOMETRIES: Record<AgentType, string> = {
  casual: 'sphere',
  coder: 'cube',
  file: 'octahedron',
  browser: 'tetrahedron',
  planner: 'dodecahedron'
}

const AGENT_COLORS = {
  idle: '#4A90E2',
  processing: '#F5A623',
  error: '#D0021B',
  offline: '#7F8C8D'
}

export const Agent3D: React.FC<Agent3DProps> = ({ 
  agent, 
  position, 
  onHover, 
  onClick 
}) => {
  const meshRef = useRef<Mesh>(null)
  const textRef = useRef<any>(null)
  
  const geometry = AGENT_GEOMETRIES[agent.type]
  const color = AGENT_COLORS[agent.status]
  
  // Animation based on agent status
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    switch (agent.status) {
      case 'processing':
        // Pulsing animation for processing
        const scale = 1 + Math.sin(time * 4) * 0.2
        meshRef.current.scale.setScalar(scale)
        meshRef.current.rotation.y = time * 2
        break
      case 'idle':
        // Gentle floating animation for idle
        meshRef.current.position.y = position.y + Math.sin(time * 2) * 0.1
        meshRef.current.rotation.y = time * 0.5
        break
      case 'error':
        // Shaking animation for error
        meshRef.current.position.x = position.x + Math.sin(time * 10) * 0.05
        meshRef.current.rotation.z = Math.sin(time * 8) * 0.1
        break
      case 'offline':
        // Static with slight dim pulsing
        const opacity = 0.3 + Math.sin(time) * 0.1
        if (meshRef.current.material && 'opacity' in meshRef.current.material) {
          meshRef.current.material.opacity = opacity
        }
        break
    }
  })
  
  const handlePointerOver = () => {
    onHover?.(agent)
  }
  
  const handlePointerOut = () => {
    onHover?.(null)
  }
  
  const handleClick = () => {
    onClick?.(agent)
  }
  
  // Render appropriate geometry based on agent type
  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position: [position.x, position.y, position.z] as [number, number, number],
      onPointerOver: handlePointerOver,
      onPointerOut: handlePointerOut,
      onClick: handleClick,
    }
    
    switch (geometry) {
      case 'sphere':
        return (
          <mesh {...commonProps}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={agent.status === 'processing' ? 0.3 : 0.1}
              transparent={agent.status === 'offline'}
              opacity={agent.status === 'offline' ? 0.4 : 1}
            />
          </mesh>
        )
      case 'cube':
        return (
          <mesh {...commonProps}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={agent.status === 'processing' ? 0.3 : 0.1}
              transparent={agent.status === 'offline'}
              opacity={agent.status === 'offline' ? 0.4 : 1}
            />
          </mesh>
        )
      case 'octahedron':
        return (
          <mesh {...commonProps}>
            <octahedronGeometry args={[0.6]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={agent.status === 'processing' ? 0.3 : 0.1}
              transparent={agent.status === 'offline'}
              opacity={agent.status === 'offline' ? 0.4 : 1}
            />
          </mesh>
        )
      case 'tetrahedron':
        return (
          <mesh {...commonProps}>
            <tetrahedronGeometry args={[0.7]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={agent.status === 'processing' ? 0.3 : 0.1}
              transparent={agent.status === 'offline'}
              opacity={agent.status === 'offline' ? 0.4 : 1}
            />
          </mesh>
        )
      case 'dodecahedron':
        return (
          <mesh {...commonProps}>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={agent.status === 'processing' ? 0.3 : 0.1}
              transparent={agent.status === 'offline'}
              opacity={agent.status === 'offline' ? 0.4 : 1}
            />
          </mesh>
        )
      default:
        return null
    }
  }
  
  return (
    <group>
      {renderGeometry()}
      <Text
        ref={textRef}
        position={[position.x, position.y - 1, position.z]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {agent.name}
      </Text>
    </group>
  )
}