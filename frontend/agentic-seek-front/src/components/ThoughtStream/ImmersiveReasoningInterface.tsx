import React, { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useSelector, useDispatch } from 'react-redux'
import { Vector3, Euler } from 'three'
import * as THREE from 'three'
import type { RootState } from '@/store'
import { toggleReasoning } from '@/store/slices/appSlice'
import { ReasoningDisplay3D } from './ReasoningDisplay3D'
import { NeuralNetwork } from './NeuralNetwork'

interface ImmersiveReasoningInterfaceProps {
  position?: Vector3
  isActive?: boolean
}

export const ImmersiveReasoningInterface: React.FC<ImmersiveReasoningInterfaceProps> = ({
  position = new Vector3(0, 0, 0),
  isActive = true
}) => {
  const dispatch = useDispatch()
  const { responseData, expandedReasoning, messages } = useSelector((state: RootState) => state.app)
  
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null)
  const [cameraTarget, setCameraTarget] = useState<Vector3>(new Vector3(0, 0, 0))
  const groupRef = useRef<THREE.Group>(null)
  
  // Create reasoning panels for messages with reasoning
  const reasoningPanels = useMemo(() => {
    return messages
      .map((message, index) => ({
        id: message.uid || `message-${index}`,
        index,
        reasoning: message.reasoning,
        content: message.content,
        agentName: message.agentName,
        isExpanded: expandedReasoning.includes(index)
      }))
      .filter(panel => panel.reasoning)
  }, [messages, expandedReasoning])
  
  // Calculate panel positions in 3D space
  const panelPositions = useMemo(() => {
    return reasoningPanels.map((_, index) => {
      const angle = (index / reasoningPanels.length) * Math.PI * 2
      const radius = 4
      const height = Math.sin(index * 0.3) * 1
      
      return new Vector3(
        position.x + Math.cos(angle) * radius,
        position.y + height,
        position.z + Math.sin(angle) * radius
      )
    })
  }, [reasoningPanels, position])
  
  // Animate the interface
  useFrame((state) => {
    if (!groupRef.current || !isActive) return
    
    const time = state.clock.getElapsedTime()
    
    // Gentle rotation of the entire interface
    groupRef.current.rotation.y = time * 0.1
    
    // Focus on selected panel
    if (selectedPanel !== null && panelPositions[selectedPanel]) {
      const targetPos = panelPositions[selectedPanel]
      setCameraTarget(targetPos)
    }
  })
  
  const handlePanelSelect = (panelIndex: number) => {
    setSelectedPanel(selectedPanel === panelIndex ? null : panelIndex)
    
    // Toggle reasoning expansion
    const messageIndex = reasoningPanels[panelIndex]?.index
    if (messageIndex !== undefined) {
      dispatch(toggleReasoning(messageIndex))
    }
  }
  
  const handlePanelHover = (panelIndex: number | null) => {
    // Visual feedback for hover state
    document.body.style.cursor = panelIndex !== null ? 'pointer' : 'default'
  }
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={position}>
      {/* Central neural network */}
      <NeuralNetwork
        position={new Vector3(0, 0, 0)}
        scale={0.8}
        isActive={isActive && reasoningPanels.length > 0}
      />
      
      {/* Reasoning panels */}
      {reasoningPanels.map((panel, index) => {
        const panelPosition = panelPositions[index]
        const isSelected = selectedPanel === index
        const isExpanded = panel.isExpanded
        
        return (
          <group key={panel.id} position={panelPosition}>
            {/* 3D Panel Background */}
            <ReasoningPanel3D
              isSelected={isSelected}
              isExpanded={isExpanded}
              onSelect={() => handlePanelSelect(index)}
              onHover={() => handlePanelHover(index)}
              onHoverOut={() => handlePanelHover(null)}
            />
            
            {/* Reasoning Display */}
            <ReasoningDisplay3D
              position={new Vector3(0, 0, 0.1)}
              messageIndex={panel.index}
              isExpanded={isExpanded}
              onToggle={() => handlePanelSelect(index)}
            />
            
            {/* Panel Info */}
            <PanelInfo3D
              agentName={panel.agentName}
              position={new Vector3(0, 1.5, 0)}
              isVisible={isSelected || isExpanded}
            />
          </group>
        )
      })}
      
      {/* Navigation helpers */}
      <NavigationHelpers
        panelCount={reasoningPanels.length}
        selectedPanel={selectedPanel}
        onPanelSelect={setSelectedPanel}
      />
    </group>
  )
}

// 3D Panel component
interface ReasoningPanel3DProps {
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onHover: () => void
  onHoverOut: () => void
}

const ReasoningPanel3D: React.FC<ReasoningPanel3DProps> = ({
  isSelected,
  isExpanded,
  onSelect,
  onHover,
  onHoverOut
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // Scale animation based on state
    const targetScale = isExpanded ? 1.2 : isSelected ? 1.1 : 1.0
    const currentScale = meshRef.current.scale.x
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, 0.1))
    
    // Glow effect
    if (isSelected || isExpanded) {
      const pulse = Math.sin(time * 4) * 0.2 + 0.8
      materialRef.current.emissiveIntensity = pulse * 0.3
    } else {
      materialRef.current.emissiveIntensity = 0.1
    }
    
    // Rotation for selected panels
    if (isSelected) {
      meshRef.current.rotation.z = Math.sin(time * 2) * 0.05
    }
  })
  
  const getPanelColor = () => {
    if (isExpanded) return '#50E3C2'
    if (isSelected) return '#4A90E2'
    return '#BD10E0'
  }
  
  return (
    <mesh
      ref={meshRef}
      onClick={onSelect}
      onPointerOver={onHover}
      onPointerOut={onHoverOut}
    >
      <planeGeometry args={[3, 2]} />
      <meshStandardMaterial
        ref={materialRef}
        color={getPanelColor()}
        emissive={getPanelColor()}
        emissiveIntensity={0.1}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Panel info component
interface PanelInfo3DProps {
  agentName?: string
  position: Vector3
  isVisible: boolean
}

const PanelInfo3D: React.FC<PanelInfo3DProps> = ({
  agentName,
  position,
  isVisible
}) => {
  if (!isVisible || !agentName) return null
  
  return (
    <Html
      position={position}
      distanceFactor={10}
      occlude
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div className="panel-info-3d">
        <div className="agent-badge">
          {agentName}
        </div>
      </div>
    </Html>
  )
}

// Navigation helpers
interface NavigationHelpersProps {
  panelCount: number
  selectedPanel: number | null
  onPanelSelect: (index: number | null) => void
}

const NavigationHelpers: React.FC<NavigationHelpersProps> = ({
  panelCount,
  selectedPanel,
  onPanelSelect
}) => {
  const indicatorRefs = useRef<(THREE.Mesh | null)[]>([])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    indicatorRefs.current.forEach((indicator, index) => {
      if (!indicator) return
      
      const isSelected = selectedPanel === index
      const pulse = Math.sin(time * 3 + index) * 0.1 + 0.9
      
      indicator.scale.setScalar(isSelected ? pulse * 0.15 : 0.1)
    })
  })
  
  return (
    <group position={[0, -3, 0]}>
      {Array.from({ length: panelCount }, (_, index) => (
        <mesh
          key={index}
          ref={(el) => (indicatorRefs.current[index] = el)}
          position={[(index - panelCount / 2) * 0.3, 0, 0]}
          onClick={() => onPanelSelect(index)}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'default'
          }}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={selectedPanel === index ? '#50E3C2' : '#4A90E2'}
            emissive={selectedPanel === index ? '#50E3C2' : '#4A90E2'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}