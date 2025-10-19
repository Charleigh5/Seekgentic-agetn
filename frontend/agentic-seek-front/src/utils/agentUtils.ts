import { Vector3 } from 'three'
import type { AgentState, AgentType, ResponseData } from '@/types'

// Default agent configurations
const DEFAULT_AGENT_CONFIGS = {
  casual: {
    name: 'Casual Agent',
    capabilities: [
      { id: 'chat', name: 'Conversation', description: 'General conversation and assistance', enabled: true },
      { id: 'help', name: 'Help & Support', description: 'Provide help and guidance', enabled: true },
    ],
    visualConfig: {
      color: '#4A90E2',
      geometry: 'sphere' as const,
      position: new Vector3(-2, 0, 0),
      scale: 1,
      animation: {
        idle: 'float',
        processing: 'pulse',
        error: 'shake',
        transition: 'smooth'
      }
    }
  },
  coder: {
    name: 'Coder Agent',
    capabilities: [
      { id: 'code', name: 'Code Generation', description: 'Generate and modify code', enabled: true },
      { id: 'debug', name: 'Debugging', description: 'Debug and fix code issues', enabled: true },
      { id: 'review', name: 'Code Review', description: 'Review and analyze code', enabled: true },
    ],
    visualConfig: {
      color: '#50E3C2',
      geometry: 'cube' as const,
      position: new Vector3(-1, 1, 0),
      scale: 1,
      animation: {
        idle: 'rotate',
        processing: 'spin',
        error: 'shake',
        transition: 'smooth'
      }
    }
  },
  file: {
    name: 'File Agent',
    capabilities: [
      { id: 'read', name: 'File Reading', description: 'Read and analyze files', enabled: true },
      { id: 'write', name: 'File Writing', description: 'Create and modify files', enabled: true },
      { id: 'search', name: 'File Search', description: 'Search through files and directories', enabled: true },
    ],
    visualConfig: {
      color: '#F5A623',
      geometry: 'octahedron' as const,
      position: new Vector3(1, 1, 0),
      scale: 1,
      animation: {
        idle: 'float',
        processing: 'pulse',
        error: 'shake',
        transition: 'smooth'
      }
    }
  },
  browser: {
    name: 'Browser Agent',
    capabilities: [
      { id: 'navigate', name: 'Web Navigation', description: 'Navigate and interact with web pages', enabled: true },
      { id: 'scrape', name: 'Data Extraction', description: 'Extract data from web pages', enabled: true },
      { id: 'screenshot', name: 'Screenshots', description: 'Capture web page screenshots', enabled: true },
    ],
    visualConfig: {
      color: '#BD10E0',
      geometry: 'tetrahedron' as const,
      position: new Vector3(2, 0, 0),
      scale: 1,
      animation: {
        idle: 'float',
        processing: 'pulse',
        error: 'shake',
        transition: 'smooth'
      }
    }
  },
  planner: {
    name: 'Planner Agent',
    capabilities: [
      { id: 'plan', name: 'Task Planning', description: 'Plan and organize complex tasks', enabled: true },
      { id: 'coordinate', name: 'Agent Coordination', description: 'Coordinate between different agents', enabled: true },
      { id: 'optimize', name: 'Optimization', description: 'Optimize workflows and processes', enabled: true },
    ],
    visualConfig: {
      color: '#D0021B',
      geometry: 'dodecahedron' as const,
      position: new Vector3(0, -1, 0),
      scale: 1,
      animation: {
        idle: 'float',
        processing: 'pulse',
        error: 'shake',
        transition: 'smooth'
      }
    }
  }
}

/**
 * Create default agent states for all agent types
 */
export const createDefaultAgents = (): Record<string, AgentState> => {
  const agents: Record<string, AgentState> = {}
  
  Object.entries(DEFAULT_AGENT_CONFIGS).forEach(([type, config]) => {
    const agentId = `agent-${type}`
    agents[agentId] = {
      id: agentId,
      name: config.name,
      type: type as AgentType,
      status: 'idle',
      capabilities: config.capabilities,
      performance: {
        responseTime: 0,
        successRate: 1.0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      visualConfig: config.visualConfig
    }
  })
  
  return agents
}

/**
 * Update agent state based on API response data
 */
export const updateAgentFromResponse = (
  currentAgent: AgentState,
  responseData: ResponseData
): AgentState => {
  const updates: Partial<AgentState> = {}
  
  // Update status based on API data
  if (responseData.agent_name === currentAgent.name.toLowerCase().replace(' agent', '')) {
    if (responseData.status) {
      // Map API status to our status types
      switch (responseData.status.toLowerCase()) {
        case 'processing':
        case 'working':
        case 'active':
          updates.status = 'processing'
          break
        case 'idle':
        case 'ready':
        case 'waiting':
          updates.status = 'idle'
          break
        case 'error':
        case 'failed':
          updates.status = 'error'
          break
        case 'offline':
        case 'disconnected':
          updates.status = 'offline'
          break
        default:
          updates.status = 'idle'
      }
    }
    
    // Update current task if available
    if (responseData.answer) {
      updates.currentTask = {
        id: `task-${Date.now()}`,
        description: responseData.answer.substring(0, 100) + (responseData.answer.length > 100 ? '...' : ''),
        progress: responseData.done ? 100 : 50,
        startTime: new Date()
      }
    }
    
    // Update performance metrics (simulated for now)
    updates.performance = {
      ...currentAgent.performance,
      responseTime: Math.random() * 1000 + 200, // Simulated response time
      successRate: Math.random() * 0.2 + 0.8, // 80-100% success rate
      memoryUsage: Math.random() * 100 + 50, // 50-150MB
      cpuUsage: Math.random() * 0.3 + 0.1 // 10-40% CPU
    }
  }
  
  return { ...currentAgent, ...updates }
}

/**
 * Determine if an agent is active based on response data
 */
export const isAgentActive = (agentType: AgentType, responseData: ResponseData): boolean => {
  if (!responseData.agent_name) return false
  
  const agentName = agentType.toLowerCase()
  const responseAgentName = responseData.agent_name.toLowerCase()
  
  return responseAgentName.includes(agentName) || agentName.includes(responseAgentName)
}

/**
 * Get agent constellation positions in a circular arrangement
 */
export const getConstellationPositions = (agentCount: number, radius: number = 3): Vector3[] => {
  const positions: Vector3[] = []
  const angleStep = (Math.PI * 2) / agentCount
  
  for (let i = 0; i < agentCount; i++) {
    const angle = i * angleStep
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = Math.sin(i * 0.5) * 0.5 // Add some vertical variation
    
    positions.push(new Vector3(x, y, z))
  }
  
  return positions
}

/**
 * Calculate connection strength between agents based on interaction frequency
 */
export const calculateConnectionStrength = (
  fromAgent: AgentState,
  toAgent: AgentState,
  interactionHistory: Record<string, number> = {}
): number => {
  if (!fromAgent || !toAgent || !fromAgent.id || !toAgent.id) return 0
  if (!interactionHistory || typeof interactionHistory !== 'object') {
    interactionHistory = {}
  }
  
  const connectionKey = `${fromAgent.id}-${toAgent.id}`
  const reverseKey = `${toAgent.id}-${fromAgent.id}`
  
  const directConnections = interactionHistory[connectionKey] || 0
  const reverseConnections = interactionHistory[reverseKey] || 0
  
  const totalConnections = directConnections + reverseConnections
  
  // Normalize to 0-1 range, with some base connection strength
  return Math.min(0.1 + (totalConnections * 0.1), 1.0)
}

/**
 * Get agent type from agent name in API response
 */
export const getAgentTypeFromName = (agentName: string): AgentType | null => {
  if (!agentName || typeof agentName !== 'string') return null
  
  const name = agentName.toLowerCase()
  
  if (name.includes('casual')) return 'casual'
  if (name.includes('coder') || name.includes('code')) return 'coder'
  if (name.includes('file')) return 'file'
  if (name.includes('browser') || name.includes('web')) return 'browser'
  if (name.includes('planner') || name.includes('plan')) return 'planner'
  
  return null
}