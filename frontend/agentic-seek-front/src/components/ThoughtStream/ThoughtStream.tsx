import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Vector3 } from 'three'
import type { RootState } from '@/store'
import { NeuralNetwork } from './NeuralNetwork'
import { ReasoningDisplay3D } from './ReasoningDisplay3D'
import { ImmersiveReasoningInterface } from './ImmersiveReasoningInterface'
import './ThoughtStream.css'

interface ThoughtStreamProps {
  position?: Vector3
  mode?: 'neural' | 'reasoning' | 'immersive'
  isActive?: boolean
}

export const ThoughtStream: React.FC<ThoughtStreamProps> = ({
  position = new Vector3(0, 0, 0),
  mode = 'immersive',
  isActive = true
}) => {
  const { responseData, messages, expandedReasoning } = useSelector((state: RootState) => state.app)
  const [currentMode, setCurrentMode] = useState(mode)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Detect when new reasoning is being processed
  useEffect(() => {
    if (responseData?.reasoning && responseData.agent_name) {
      setIsProcessing(true)
      
      const timer = setTimeout(() => {
        setIsProcessing(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [responseData?.reasoning, responseData?.agent_name])
  
  // Auto-switch modes based on content
  useEffect(() => {
    if (!isActive) return
    
    const hasReasoning = messages.some(msg => msg.reasoning)
    const hasExpandedReasoning = expandedReasoning.length > 0
    
    if (hasExpandedReasoning && hasReasoning) {
      setCurrentMode('immersive')
    } else if (hasReasoning) {
      setCurrentMode('reasoning')
    } else {
      setCurrentMode('neural')
    }
  }, [messages, expandedReasoning, isActive])
  
  if (!isActive) return null
  
  return (
    <group position={position} name="thought-stream">
      {/* Neural Network Mode - Shows AI thinking process */}
      {currentMode === 'neural' && (
        <NeuralNetwork
          position={new Vector3(0, 0, 0)}
          scale={1}
          isActive={isProcessing || Boolean(responseData?.reasoning)}
        />
      )}
      
      {/* Reasoning Display Mode - Shows individual reasoning */}
      {currentMode === 'reasoning' && (
        <group>
          <NeuralNetwork
            position={new Vector3(0, 0, -2)}
            scale={0.6}
            isActive={isProcessing}
          />
          <ReasoningDisplay3D
            position={new Vector3(0, 0, 0)}
            messageIndex={messages.length - 1}
          />
        </group>
      )}
      
      {/* Immersive Mode - Full 3D reasoning interface */}
      {currentMode === 'immersive' && (
        <ImmersiveReasoningInterface
          position={new Vector3(0, 0, 0)}
          isActive={isActive}
        />
      )}
      
      {/* Mode indicator */}
      <ModeIndicator
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        position={new Vector3(0, -4, 0)}
      />
    </group>
  )
}

// Mode switching component
interface ModeIndicatorProps {
  currentMode: 'neural' | 'reasoning' | 'immersive'
  onModeChange: (mode: 'neural' | 'reasoning' | 'immersive') => void
  position: Vector3
}

const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  currentMode,
  onModeChange,
  position
}) => {
  const modes = [
    { key: 'neural', label: 'Neural', color: '#4A90E2' },
    { key: 'reasoning', label: 'Reasoning', color: '#F5A623' },
    { key: 'immersive', label: 'Immersive', color: '#50E3C2' }
  ] as const
  
  return (
    <group position={position}>
      {modes.map((mode, index) => {
        const isActive = currentMode === mode.key
        const angle = (index / modes.length) * Math.PI * 2
        const radius = 1
        
        const indicatorPosition = new Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
        
        return (
          <mesh
            key={mode.key}
            position={indicatorPosition}
            onClick={() => onModeChange(mode.key)}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'default'
            }}
          >
            <sphereGeometry args={[isActive ? 0.15 : 0.1, 16, 16]} />
            <meshStandardMaterial
              color={mode.color}
              emissive={mode.color}
              emissiveIntensity={isActive ? 0.4 : 0.2}
              transparent
              opacity={isActive ? 1 : 0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Export all components
export { NeuralNetwork } from './NeuralNetwork'
export { ReasoningDisplay3D } from './ReasoningDisplay3D'
export { ImmersiveReasoningInterface } from './ImmersiveReasoningInterface'
export { ThoughtParticle } from './ThoughtParticle'
export { NeuralPathway } from './NeuralPathway'