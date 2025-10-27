import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Vector3 } from 'three'
import type { RootState } from '@/store'
import { toggleReasoning } from '@/store/slices/appSlice'
import { ReasoningText3D, ConfidenceIndicator, ParticleDensity } from './ReasoningText3D'

interface ReasoningDisplay3DProps {
  position?: Vector3
  messageIndex?: number
  isExpanded?: boolean
  onToggle?: () => void
}

export const ReasoningDisplay3D: React.FC<ReasoningDisplay3DProps> = ({
  position = new Vector3(0, 0, 0),
  messageIndex = 0,
  isExpanded = false,
  onToggle
}) => {
  const dispatch = useDispatch()
  const { responseData, expandedReasoning } = useSelector((state: RootState) => state.app)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [confidence, setConfidence] = useState(0.8)
  
  // Check if this reasoning is expanded
  const isReasoningExpanded = expandedReasoning.includes(messageIndex)
  
  // Parse reasoning into segments for better visualization
  const reasoningSegments = useMemo(() => {
    if (!responseData?.reasoning) return []
    
    const sentences = responseData.reasoning
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim())
    
    return sentences.map((sentence, index) => ({
      id: `segment-${index}`,
      text: sentence,
      confidence: calculateSentenceConfidence(sentence),
      position: new Vector3(
        position.x,
        position.y - (index * 0.4),
        position.z
      )
    }))
  }, [responseData?.reasoning, position])
  
  // Calculate confidence based on sentence content
  const calculateSentenceConfidence = (sentence: string): number => {
    const confidenceKeywords = {
      high: ['certain', 'definitely', 'clearly', 'obviously', 'confirmed'],
      medium: ['likely', 'probably', 'appears', 'seems', 'suggests'],
      low: ['might', 'could', 'possibly', 'perhaps', 'maybe', 'uncertain']
    }
    
    const lowerSentence = sentence.toLowerCase()
    
    if (confidenceKeywords.high.some(word => lowerSentence.includes(word))) {
      return 0.9 + Math.random() * 0.1
    } else if (confidenceKeywords.medium.some(word => lowerSentence.includes(word))) {
      return 0.6 + Math.random() * 0.2
    } else if (confidenceKeywords.low.some(word => lowerSentence.includes(word))) {
      return 0.3 + Math.random() * 0.3
    }
    
    // Default confidence based on sentence length and complexity
    const wordCount = sentence.split(' ').length
    return Math.min(0.5 + (wordCount / 20), 0.9)
  }
  
  // Handle reasoning toggle
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      dispatch(toggleReasoning(messageIndex))
    }
  }
  
  // Simulate streaming effect for new reasoning
  useEffect(() => {
    if (responseData?.reasoning && isReasoningExpanded) {
      setIsStreaming(true)
      setStreamingText('')
      
      // Start streaming animation
      const timer = setTimeout(() => {
        setIsStreaming(false)
      }, responseData.reasoning.length * 30 + 1000)
      
      return () => clearTimeout(timer)
    }
  }, [responseData?.reasoning, isReasoningExpanded])
  
  // Update overall confidence based on segments
  useEffect(() => {
    if (reasoningSegments.length > 0) {
      const avgConfidence = reasoningSegments.reduce((sum, seg) => sum + seg.confidence, 0) / reasoningSegments.length
      setConfidence(avgConfidence)
    }
  }, [reasoningSegments])
  
  if (!responseData?.reasoning) {
    return (
      <group position={position}>
        {/* Placeholder for no reasoning */}
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#666666"
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    )
  }
  
  return (
    <group position={position}>
      {/* Toggle indicator */}
      <mesh
        position={[0, 0.5, 0]}
        onClick={handleToggle}
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
          color={isReasoningExpanded ? '#50E3C2' : '#4A90E2'}
          emissive={isReasoningExpanded ? '#50E3C2' : '#4A90E2'}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Confidence indicator */}
      <ConfidenceIndicator
        confidence={confidence}
        position={new Vector3(0.3, 0.5, 0)}
        isActive={isReasoningExpanded}
      />
      
      {/* Particle density visualization */}
      <ParticleDensity
        density={confidence}
        position={new Vector3(0, 0.5, 0)}
        isActive={isReasoningExpanded && isStreaming}
      />
      
      {/* Expanded reasoning text */}
      {isReasoningExpanded && (
        <group>
          {reasoningSegments.map((segment, index) => (
            <group key={segment.id}>
              {/* 3D reasoning text */}
              <ReasoningText3D
                text={segment.text}
                position={segment.position}
                confidence={segment.confidence}
                isStreaming={isStreaming && index === 0} // Only stream the first segment
                fontSize={0.12}
                maxWidth={6}
              />
              
              {/* Individual confidence indicators */}
              <ConfidenceIndicator
                confidence={segment.confidence}
                position={new Vector3(segment.position.x - 0.5, segment.position.y, segment.position.z)}
                isActive={isReasoningExpanded}
              />
            </group>
          ))}
          
          {/* Background panel for better readability */}
          <mesh position={[2, -reasoningSegments.length * 0.2, -0.1]}>
            <planeGeometry args={[7, reasoningSegments.length * 0.4 + 1]} />
            <meshStandardMaterial
              color="#000000"
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      )}
      
      {/* Collapsed state indicator */}
      {!isReasoningExpanded && (
        <ReasoningText3D
          text="Click to expand reasoning..."
          position={new Vector3(0, 0, 0)}
          confidence={0.5}
          fontSize={0.08}
          maxWidth={3}
        />
      )}
    </group>
  )
}

// Component for managing multiple reasoning displays
interface ReasoningManager3DProps {
  messages: Array<{
    id: string
    reasoning?: string
    confidence?: number
  }>
  basePosition?: Vector3
}

export const ReasoningManager3D: React.FC<ReasoningManager3DProps> = ({
  messages,
  basePosition = new Vector3(5, 0, 0)
}) => {
  return (
    <group position={basePosition}>
      {messages.map((message, index) => {
        if (!message.reasoning) return null
        
        return (
          <ReasoningDisplay3D
            key={message.id}
            messageIndex={index}
            position={new Vector3(0, -index * 2, 0)}
          />
        )
      })}
    </group>
  )
}