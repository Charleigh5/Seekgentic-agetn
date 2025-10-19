import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { AgentConnection, DataFlowParticles } from './AgentConnection'
import { calculateConnectionStrength } from '@/utils/agentUtils'
import type { AgentState } from '@/types'

interface ConnectionData {
  from: AgentState
  to: AgentState
  strength: number
  isActive: boolean
  direction: 'forward' | 'backward' | 'bidirectional'
}

export const ConnectionManager: React.FC = () => {
  const { agents, activeAgents, connections } = useSelector((state: RootState) => state.agents)
  
  // Calculate all possible connections between agents
  const connectionData = useMemo(() => {
    const agentList = Object.values(agents)
    const connectionList: ConnectionData[] = []
    
    // Create connections between all agents
    for (let i = 0; i < agentList.length; i++) {
      for (let j = i + 1; j < agentList.length; j++) {
        const fromAgent = agentList[i]
        const toAgent = agentList[j]
        
        // Calculate connection strength based on agent types and activity
        let strength = calculateConnectionStrength(fromAgent, toAgent)
        
        // Boost strength for certain agent type combinations
        strength = getAgentAffinityBonus(fromAgent, toAgent, strength)
        
        // Determine if connection is active
        const isActive = activeAgents.includes(fromAgent.id) || activeAgents.includes(toAgent.id)
        
        // Determine data flow direction based on agent states and types
        const direction = getDataFlowDirection(fromAgent, toAgent)
        
        // Only show connections with minimum strength
        if (strength > 0.1) {
          connectionList.push({
            from: fromAgent,
            to: toAgent,
            strength,
            isActive,
            direction
          })
        }
      }
    }
    
    return connectionList
  }, [agents, activeAgents, connections])
  
  return (
    <group name="connection-manager">
      {connectionData.map((connection, index) => (
        <group key={`connection-${connection.from.id}-${connection.to.id}`}>
          {/* Connection line */}
          <AgentConnection
            fromAgent={connection.from}
            toAgent={connection.to}
            strength={connection.strength}
            isActive={connection.isActive}
            dataFlowDirection={connection.direction}
          />
          
          {/* Data flow particles */}
          <DataFlowParticles
            fromPosition={connection.from.visualConfig.position}
            toPosition={connection.to.visualConfig.position}
            isActive={connection.isActive}
            direction={connection.direction}
          />
        </group>
      ))}
    </group>
  )
}

/**
 * Calculate affinity bonus between different agent types
 */
function getAgentAffinityBonus(fromAgent: AgentState, toAgent: AgentState, baseStrength: number): number {
  const affinityMap: Record<string, string[]> = {
    // Coder agent works closely with File agent
    coder: ['file', 'browser'],
    // File agent supports all other agents
    file: ['coder', 'browser', 'planner'],
    // Browser agent works with Coder for web development
    browser: ['coder', 'file'],
    // Planner coordinates with all agents
    planner: ['coder', 'file', 'browser', 'casual'],
    // Casual agent can work with any agent
    casual: ['planner']
  }
  
  const fromType = fromAgent.type
  const toType = toAgent.type
  
  let bonus = 0
  
  // Check if agents have natural affinity
  if (affinityMap[fromType]?.includes(toType) || affinityMap[toType]?.includes(fromType)) {
    bonus += 0.3
  }
  
  // Boost for agents that are both active
  if (fromAgent.status === 'processing' && toAgent.status === 'processing') {
    bonus += 0.4
  }
  
  // Boost for complementary agent types
  if ((fromType === 'coder' && toType === 'file') || 
      (fromType === 'file' && toType === 'coder')) {
    bonus += 0.2
  }
  
  if ((fromType === 'browser' && toType === 'coder') || 
      (fromType === 'coder' && toType === 'browser')) {
    bonus += 0.2
  }
  
  return Math.min(baseStrength + bonus, 1.0)
}

/**
 * Determine data flow direction between agents
 */
function getDataFlowDirection(
  fromAgent: AgentState, 
  toAgent: AgentState
): 'forward' | 'backward' | 'bidirectional' {
  // Planner typically coordinates (sends data to others)
  if (fromAgent.type === 'planner') return 'forward'
  if (toAgent.type === 'planner') return 'backward'
  
  // File agent typically provides data to others
  if (fromAgent.type === 'file' && toAgent.type === 'coder') return 'forward'
  if (fromAgent.type === 'coder' && toAgent.type === 'file') return 'backward'
  
  // Browser provides data to coder
  if (fromAgent.type === 'browser' && toAgent.type === 'coder') return 'forward'
  if (fromAgent.type === 'coder' && toAgent.type === 'browser') return 'backward'
  
  // Processing agents send data to idle agents
  if (fromAgent.status === 'processing' && toAgent.status === 'idle') return 'forward'
  if (fromAgent.status === 'idle' && toAgent.status === 'processing') return 'backward'
  
  // Default to bidirectional for equal status agents
  return 'bidirectional'
}