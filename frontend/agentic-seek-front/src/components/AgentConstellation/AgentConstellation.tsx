import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Vector3 } from 'three'
import type { RootState } from '@/store'
import { Agent3D } from './Agent3D'
import { AgentInfoPanel } from './AgentInfoPanel'
import { AgentDetailPanel } from './AgentDetailPanel'
import { ConnectionManager } from './ConnectionManager'
import { useGetLatestAnswerQuery } from '@/store/api/apiSlice'
import { 
  addAgent, 
  updateAgent, 
  setActiveAgents 
} from '@/store/slices/agentsSlice'
import { 
  createDefaultAgents, 
  updateAgentFromResponse, 
  isAgentActive,
  getConstellationPositions 
} from '@/utils/agentUtils'
import type { AgentState } from '@/types'
import './AgentInfoPanel.css'
import './AgentDetailPanel.css'

export const AgentConstellation: React.FC = () => {
  const dispatch = useDispatch()
  const { agents, activeAgents } = useSelector((state: RootState) => state.agents)
  const [hoveredAgent, setHoveredAgent] = useState<AgentState | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null)
  
  // Poll for latest answer to update agent states
  const { data: responseData, isLoading } = useGetLatestAnswerQuery(undefined, {
    pollingInterval: 3000, // Poll every 3 seconds
    skipPollingIfUnfocused: true,
  })
  
  // Initialize default agents if none exist
  useEffect(() => {
    if (Object.keys(agents).length === 0) {
      const defaultAgents = createDefaultAgents()
      Object.values(defaultAgents).forEach(agent => {
        dispatch(addAgent(agent))
      })
    }
  }, [agents, dispatch])
  
  // Update agent states based on API response
  useEffect(() => {
    if (responseData && Object.keys(agents).length > 0) {
      const updatedActiveAgents: string[] = []
      
      Object.values(agents).forEach(agent => {
        // Check if this agent is mentioned in the response
        if (isAgentActive(agent.type, responseData)) {
          updatedActiveAgents.push(agent.id)
          
          // Update agent state
          const updatedAgent = updateAgentFromResponse(agent, responseData)
          dispatch(updateAgent({ id: agent.id, updates: updatedAgent }))
        } else {
          // Set agent to idle if not active
          if (agent.status === 'processing') {
            dispatch(updateAgent({ 
              id: agent.id, 
              updates: { status: 'idle', currentTask: undefined } 
            }))
          }
        }
      })
      
      // Update active agents list
      dispatch(setActiveAgents(updatedActiveAgents))
    }
  }, [responseData, agents, dispatch])
  
  // Calculate positions for agents in constellation
  const agentPositions = useMemo(() => {
    const agentList = Object.values(agents)
    if (agentList.length === 0) return []
    
    return getConstellationPositions(agentList.length, 4)
  }, [agents])
  
  const handleAgentHover = (agent: AgentState | null) => {
    setHoveredAgent(agent)
  }
  
  const handleAgentClick = (agent: AgentState) => {
    setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)
  }
  
  const agentList = Object.values(agents)
  
  if (isLoading && agentList.length === 0) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#4A90E2" emissive="#4A90E2" emissiveIntensity={0.5} />
        </mesh>
      </group>
    )
  }
  
  return (
    <group name="agent-constellation">
      {/* Render agent connections */}
      <ConnectionManager />
      
      {/* Render individual agents */}
      {agentList.map((agent, index) => {
        const position = agentPositions[index] || new Vector3(0, 0, 0)
        
        return (
          <Agent3D
            key={agent.id}
            agent={agent}
            position={position}
            onHover={handleAgentHover}
            onClick={handleAgentClick}
          />
        )
      })}
      
      {/* Render info panel for hovered agent */}
      {hoveredAgent && (
        <AgentInfoPanel
          agent={hoveredAgent}
          position={[
            hoveredAgent.visualConfig.position.x + 1.5,
            hoveredAgent.visualConfig.position.y + 1,
            hoveredAgent.visualConfig.position.z
          ]}
          visible={true}
        />
      )}
      
      {/* Render detailed panel for selected agent */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          position={[
            selectedAgent.visualConfig.position.x + 2,
            selectedAgent.visualConfig.position.y,
            selectedAgent.visualConfig.position.z
          ]}
          visible={true}
          onClose={() => setSelectedAgent(null)}
        />
      )}
      
      {/* Central constellation indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}