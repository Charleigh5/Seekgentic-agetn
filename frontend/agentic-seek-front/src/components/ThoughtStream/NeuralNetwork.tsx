import React, { useMemo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Vector3 } from 'three'
import type { RootState } from '@/store'
import { ThoughtParticle } from './ThoughtParticle'
import { NeuralPathway, PathwayFlow } from './NeuralPathway'
import type { ReasoningStep, ThoughtProcess } from '@/types'

interface NeuralNetworkProps {
  position?: Vector3
  scale?: number
  isActive?: boolean
}

export const NeuralNetwork: React.FC<NeuralNetworkProps> = ({
  position = new Vector3(0, 2, 0),
  scale = 1,
  isActive = true
}) => {
  const { responseData } = useSelector((state: RootState) => state.app)
  const [thoughtNodes, setThoughtNodes] = useState<ReasoningStep[]>([])
  const [pathways, setPathways] = useState<Array<{
    from: Vector3
    to: Vector3
    strength: number
    type: 'reasoning' | 'data' | 'feedback'
  }>>([])
  
  // Parse reasoning text into thought nodes
  const parseReasoning = (reasoning: string): ReasoningStep[] => {
    if (!reasoning) return []
    
    const sentences = reasoning.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    return sentences.map((sentence, index) => ({
      id: `thought-${index}`,
      content: sentence.trim(),
      confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
      timestamp: new Date(),
      type: determineThoughtType(sentence.trim())
    }))
  }
  
  // Determine thought type based on content
  const determineThoughtType = (content: string): 'analysis' | 'decision' | 'action' | 'reflection' => {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('analy') || lowerContent.includes('examin') || lowerContent.includes('consider')) {
      return 'analysis'
    } else if (lowerContent.includes('decid') || lowerContent.includes('choos') || lowerContent.includes('select')) {
      return 'decision'
    } else if (lowerContent.includes('execut') || lowerContent.includes('implement') || lowerContent.includes('perform')) {
      return 'action'
    } else {
      return 'reflection'
    }
  }
  
  // Generate 3D positions for thought nodes
  const nodePositions = useMemo(() => {
    if (thoughtNodes.length === 0) return []
    
    return thoughtNodes.map((_, index) => {
      const angle = (index / thoughtNodes.length) * Math.PI * 2
      const radius = 2 * scale
      const height = (Math.sin(index * 0.5) * 0.5) * scale
      
      return new Vector3(
        position.x + Math.cos(angle) * radius,
        position.y + height,
        position.z + Math.sin(angle) * radius
      )
    })
  }, [thoughtNodes, position, scale])
  
  // Generate pathways between related thoughts
  const generatePathways = () => {
    const newPathways: typeof pathways = []
    
    for (let i = 0; i < thoughtNodes.length - 1; i++) {
      const currentNode = thoughtNodes[i]
      const nextNode = thoughtNodes[i + 1]
      const currentPos = nodePositions[i]
      const nextPos = nodePositions[i + 1]
      
      if (currentPos && nextPos) {
        // Determine pathway strength based on thought relationship
        const strength = calculateThoughtRelation(currentNode, nextNode)
        
        if (strength > 0.3) {
          newPathways.push({
            from: currentPos,
            to: nextPos,
            strength,
            type: getPathwayType(currentNode.type, nextNode.type)
          })
        }
      }
    }
    
    // Add some cross-connections for complex reasoning
    for (let i = 0; i < thoughtNodes.length; i++) {
      for (let j = i + 2; j < Math.min(i + 4, thoughtNodes.length); j++) {
        const nodeA = thoughtNodes[i]
        const nodeB = thoughtNodes[j]
        const posA = nodePositions[i]
        const posB = nodePositions[j]
        
        if (posA && posB) {
          const strength = calculateThoughtRelation(nodeA, nodeB) * 0.6 // Weaker cross-connections
          
          if (strength > 0.4) {
            newPathways.push({
              from: posA,
              to: posB,
              strength,
              type: 'reasoning'
            })
          }
        }
      }
    }
    
    setPathways(newPathways)
  }
  
  // Calculate relationship strength between thoughts
  const calculateThoughtRelation = (nodeA: ReasoningStep, nodeB: ReasoningStep): number => {
    // Base strength on type compatibility
    const typeCompatibility = getTypeCompatibility(nodeA.type, nodeB.type)
    
    // Add confidence factor
    const confidenceFactor = (nodeA.confidence + nodeB.confidence) / 2
    
    // Add content similarity (simplified)
    const contentSimilarity = calculateContentSimilarity(nodeA.content, nodeB.content)
    
    return (typeCompatibility * 0.5 + confidenceFactor * 0.3 + contentSimilarity * 0.2)
  }
  
  // Get type compatibility score
  const getTypeCompatibility = (typeA: string, typeB: string): number => {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      analysis: { analysis: 0.8, decision: 0.9, action: 0.6, reflection: 0.7 },
      decision: { analysis: 0.9, decision: 0.7, action: 0.95, reflection: 0.5 },
      action: { analysis: 0.6, decision: 0.95, action: 0.8, reflection: 0.8 },
      reflection: { analysis: 0.7, decision: 0.5, action: 0.8, reflection: 0.9 }
    }
    
    return compatibilityMatrix[typeA]?.[typeB] || 0.5
  }
  
  // Simple content similarity calculation
  const calculateContentSimilarity = (contentA: string, contentB: string): number => {
    const wordsA = contentA.toLowerCase().split(/\s+/)
    const wordsB = contentB.toLowerCase().split(/\s+/)
    
    const commonWords = wordsA.filter(word => wordsB.includes(word))
    const totalWords = new Set([...wordsA, ...wordsB]).size
    
    return commonWords.length / totalWords
  }
  
  // Get pathway type based on thought types
  const getPathwayType = (fromType: string, toType: string): 'reasoning' | 'data' | 'feedback' => {
    if (fromType === 'analysis' && toType === 'decision') return 'reasoning'
    if (fromType === 'decision' && toType === 'action') return 'data'
    if (fromType === 'action' && toType === 'reflection') return 'feedback'
    return 'reasoning'
  }
  
  // Update thought nodes when reasoning changes
  useEffect(() => {
    if (responseData?.reasoning) {
      const nodes = parseReasoning(responseData.reasoning)
      setThoughtNodes(nodes)
    }
  }, [responseData?.reasoning])
  
  // Generate pathways when nodes change
  useEffect(() => {
    if (thoughtNodes.length > 0 && nodePositions.length > 0) {
      generatePathways()
    }
  }, [thoughtNodes, nodePositions])
  
  if (!isActive || thoughtNodes.length === 0) {
    return (
      <group position={position}>
        {/* Idle neural network visualization */}
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#4A90E2"
            emissive="#4A90E2"
            emissiveIntensity={0.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    )
  }
  
  return (
    <group position={position} scale={scale}>
      {/* Render thought particles */}
      {thoughtNodes.map((node, index) => {
        const nodePosition = nodePositions[index]
        if (!nodePosition) return null
        
        return (
          <ThoughtParticle
            key={node.id}
            position={nodePosition}
            target={nodePositions[(index + 1) % nodePositions.length] || nodePosition}
            intensity={node.confidence}
            confidence={node.confidence}
            type={node.type}
            isActive={isActive}
          />
        )
      })}
      
      {/* Render neural pathways */}
      {pathways.map((pathway, index) => (
        <NeuralPathway
          key={`pathway-${index}`}
          startPoint={pathway.from}
          endPoint={pathway.to}
          strength={pathway.strength}
          isActive={isActive}
          type={pathway.type}
        />
      ))}
      
      {/* Central processing core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#BD10E0"
          emissive="#BD10E0"
          emissiveIntensity={isActive ? 0.4 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}