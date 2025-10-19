import { Vector3 } from 'three'
import {
  createDefaultAgents,
  updateAgentFromResponse,
  isAgentActive,
  getConstellationPositions,
  calculateConnectionStrength,
  getAgentTypeFromName,
} from '../agentUtils'
import type { AgentState, ResponseData, AgentType } from '@/types'

describe('Agent Utilities Tests', () => {
  describe('createDefaultAgents', () => {
    it('should create all 5 default agent types', () => {
      const agents = createDefaultAgents()
      const agentTypes = Object.values(agents).map(agent => agent.type)
      
      expect(Object.keys(agents)).toHaveLength(5)
      expect(agentTypes).toContain('casual')
      expect(agentTypes).toContain('coder')
      expect(agentTypes).toContain('file')
      expect(agentTypes).toContain('browser')
      expect(agentTypes).toContain('planner')
    })
    
    it('should create agents with proper default configurations', () => {
      const agents = createDefaultAgents()
      const casualAgent = Object.values(agents).find(a => a.type === 'casual')!
      
      expect(casualAgent.name).toBe('Casual Agent')
      expect(casualAgent.status).toBe('idle')
      expect(casualAgent.capabilities).toHaveLength(2)
      expect(casualAgent.visualConfig.geometry).toBe('sphere')
      expect(casualAgent.performance.responseTime).toBe(0)
      expect(casualAgent.performance.successRate).toBe(1.0)
    })
    
    it('should create agents with unique positions', () => {
      const agents = createDefaultAgents()
      const positions = Object.values(agents).map(agent => agent.visualConfig.position)
      
      // Check that no two agents have the same position
      const uniquePositions = new Set(positions.map(pos => `${pos.x},${pos.y},${pos.z}`))
      expect(uniquePositions.size).toBe(positions.length)
    })
    
    it('should create agents with enabled capabilities', () => {
      const agents = createDefaultAgents()
      
      Object.values(agents).forEach(agent => {
        expect(agent.capabilities.length).toBeGreaterThan(0)
        expect(agent.capabilities.every(cap => cap.enabled)).toBe(true)
      })
    })
  })
  
  describe('updateAgentFromResponse', () => {
    let testAgent: AgentState
    
    beforeEach(() => {
      const agents = createDefaultAgents()
      testAgent = Object.values(agents).find(a => a.type === 'coder')!
    })
    
    it('should update agent status based on API response', () => {
      const responseData: ResponseData = {
        agent_name: 'coder',
        status: 'processing',
        answer: 'Working on code generation',
        done: false,
      }
      
      const updatedAgent = updateAgentFromResponse(testAgent, responseData)
      
      expect(updatedAgent.status).toBe('processing')
    })
    
    it('should create current task from API response', () => {
      const responseData: ResponseData = {
        agent_name: 'coder',
        status: 'processing',
        answer: 'This is a long task description that should be truncated because it exceeds the maximum length limit for display purposes',
        done: false,
      }
      
      const updatedAgent = updateAgentFromResponse(testAgent, responseData)
      
      expect(updatedAgent.currentTask).toBeDefined()
      expect(updatedAgent.currentTask!.description).toHaveLength(103) // 100 chars + "..."
      expect(updatedAgent.currentTask!.progress).toBe(50) // Not done, so 50%
    })
    
    it('should set task progress to 100% when done', () => {
      const responseData: ResponseData = {
        agent_name: 'coder',
        status: 'idle',
        answer: 'Task completed successfully',
        done: true,
      }
      
      const updatedAgent = updateAgentFromResponse(testAgent, responseData)
      
      expect(updatedAgent.currentTask!.progress).toBe(100)
    })
    
    it('should update performance metrics', () => {
      const responseData: ResponseData = {
        agent_name: 'coder',
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      const originalPerformance = testAgent.performance
      const updatedAgent = updateAgentFromResponse(testAgent, responseData)
      
      // Performance should be updated (simulated values)
      expect(updatedAgent.performance.responseTime).not.toBe(originalPerformance.responseTime)
      expect(updatedAgent.performance.successRate).toBeGreaterThanOrEqual(0.8)
      expect(updatedAgent.performance.successRate).toBeLessThanOrEqual(1.0)
      expect(updatedAgent.performance.memoryUsage).toBeGreaterThanOrEqual(50)
      expect(updatedAgent.performance.memoryUsage).toBeLessThanOrEqual(150)
    })
    
    it('should not update agent if name does not match', () => {
      const responseData: ResponseData = {
        agent_name: 'different_agent',
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      const updatedAgent = updateAgentFromResponse(testAgent, responseData)
      
      // Agent should remain unchanged except for performance (which is always updated)
      expect(updatedAgent.status).toBe(testAgent.status)
      expect(updatedAgent.currentTask).toBe(testAgent.currentTask)
    })
    
    it('should handle various status mappings', () => {
      const statusMappings = [
        { api: 'processing', expected: 'processing' },
        { api: 'working', expected: 'processing' },
        { api: 'active', expected: 'processing' },
        { api: 'idle', expected: 'idle' },
        { api: 'ready', expected: 'idle' },
        { api: 'waiting', expected: 'idle' },
        { api: 'error', expected: 'error' },
        { api: 'failed', expected: 'error' },
        { api: 'offline', expected: 'offline' },
        { api: 'disconnected', expected: 'offline' },
        { api: 'unknown_status', expected: 'idle' },
      ]
      
      statusMappings.forEach(({ api, expected }) => {
        const responseData: ResponseData = {
          agent_name: 'coder',
          status: api,
          answer: 'Test',
          done: false,
        }
        
        const updatedAgent = updateAgentFromResponse(testAgent, responseData)
        expect(updatedAgent.status).toBe(expected)
      })
    })
  })
  
  describe('isAgentActive', () => {
    it('should return true when agent name matches response', () => {
      const responseData: ResponseData = {
        agent_name: 'coder',
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      expect(isAgentActive('coder', responseData)).toBe(true)
    })
    
    it('should return true for partial name matches', () => {
      const responseData: ResponseData = {
        agent_name: 'coder_agent',
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      expect(isAgentActive('coder', responseData)).toBe(true)
    })
    
    it('should return false when agent name does not match', () => {
      const responseData: ResponseData = {
        agent_name: 'different_agent',
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      expect(isAgentActive('coder', responseData)).toBe(false)
    })
    
    it('should return false when no agent name in response', () => {
      const responseData: ResponseData = {
        status: 'processing',
        answer: 'Working',
        done: false,
      }
      
      expect(isAgentActive('coder', responseData)).toBe(false)
    })
  })
  
  describe('getConstellationPositions', () => {
    it('should generate correct number of positions', () => {
      const positions = getConstellationPositions(5, 3)
      expect(positions).toHaveLength(5)
    })
    
    it('should place agents in circular arrangement', () => {
      const positions = getConstellationPositions(4, 2)
      
      // Check that positions are roughly circular
      positions.forEach(pos => {
        const distance = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
        expect(distance).toBeCloseTo(2, 1) // Within 0.1 of radius
      })
    })
    
    it('should add vertical variation', () => {
      const positions = getConstellationPositions(5, 3)
      
      // Check that not all Y positions are the same
      const yPositions = positions.map(pos => pos.y)
      const uniqueY = new Set(yPositions.map(y => Math.round(y * 10) / 10))
      expect(uniqueY.size).toBeGreaterThan(1)
    })
    
    it('should handle single agent', () => {
      const positions = getConstellationPositions(1, 3)
      expect(positions).toHaveLength(1)
      expect(positions[0].x).toBeCloseTo(3, 1)
      expect(positions[0].z).toBeCloseTo(0, 1)
    })
    
    it('should handle zero agents', () => {
      const positions = getConstellationPositions(0, 3)
      expect(positions).toHaveLength(0)
    })
  })
  
  describe('calculateConnectionStrength', () => {
    let agentA: AgentState
    let agentB: AgentState
    
    beforeEach(() => {
      const agents = createDefaultAgents()
      agentA = Object.values(agents)[0]
      agentB = Object.values(agents)[1]
    })
    
    it('should return base connection strength with no history', () => {
      const strength = calculateConnectionStrength(agentA, agentB)
      expect(strength).toBe(0.1) // Base strength
    })
    
    it('should increase strength based on interaction history', () => {
      const interactionHistory = {
        [`${agentA.id}-${agentB.id}`]: 5,
      }
      
      const strength = calculateConnectionStrength(agentA, agentB, interactionHistory)
      expect(strength).toBe(0.6) // 0.1 + (5 * 0.1)
    })
    
    it('should consider bidirectional interactions', () => {
      const interactionHistory = {
        [`${agentA.id}-${agentB.id}`]: 3,
        [`${agentB.id}-${agentA.id}`]: 2,
      }
      
      const strength = calculateConnectionStrength(agentA, agentB, interactionHistory)
      expect(strength).toBe(0.6) // 0.1 + ((3 + 2) * 0.1)
    })
    
    it('should cap strength at 1.0', () => {
      const interactionHistory = {
        [`${agentA.id}-${agentB.id}`]: 20,
      }
      
      const strength = calculateConnectionStrength(agentA, agentB, interactionHistory)
      expect(strength).toBe(1.0) // Capped at maximum
    })
  })
  
  describe('getAgentTypeFromName', () => {
    it('should identify casual agent', () => {
      expect(getAgentTypeFromName('casual')).toBe('casual')
      expect(getAgentTypeFromName('Casual Agent')).toBe('casual')
      expect(getAgentTypeFromName('CASUAL_AGENT')).toBe('casual')
    })
    
    it('should identify coder agent', () => {
      expect(getAgentTypeFromName('coder')).toBe('coder')
      expect(getAgentTypeFromName('code_agent')).toBe('coder')
      expect(getAgentTypeFromName('Coder Agent')).toBe('coder')
    })
    
    it('should identify file agent', () => {
      expect(getAgentTypeFromName('file')).toBe('file')
      expect(getAgentTypeFromName('File Agent')).toBe('file')
      expect(getAgentTypeFromName('FILE_HANDLER')).toBe('file')
    })
    
    it('should identify browser agent', () => {
      expect(getAgentTypeFromName('browser')).toBe('browser')
      expect(getAgentTypeFromName('web_agent')).toBe('browser')
      expect(getAgentTypeFromName('Browser Agent')).toBe('browser')
    })
    
    it('should identify planner agent', () => {
      expect(getAgentTypeFromName('planner')).toBe('planner')
      expect(getAgentTypeFromName('plan_agent')).toBe('planner')
      expect(getAgentTypeFromName('Planning Agent')).toBe('planner')
    })
    
    it('should return null for unknown agent names', () => {
      expect(getAgentTypeFromName('unknown')).toBeNull()
      expect(getAgentTypeFromName('random_agent')).toBeNull()
      expect(getAgentTypeFromName('')).toBeNull()
    })
    
    it('should handle case insensitive matching', () => {
      expect(getAgentTypeFromName('CODER')).toBe('coder')
      expect(getAgentTypeFromName('File')).toBe('file')
      expect(getAgentTypeFromName('BROWSER')).toBe('browser')
    })
  })
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => getAgentTypeFromName(null as any)).not.toThrow()
      expect(() => getAgentTypeFromName(undefined as any)).not.toThrow()
    })
    
    it('should handle empty response data', () => {
      const agents = createDefaultAgents()
      const testAgent = Object.values(agents)[0]
      const emptyResponse: ResponseData = {}
      
      expect(() => updateAgentFromResponse(testAgent, emptyResponse)).not.toThrow()
      expect(() => isAgentActive('coder', emptyResponse)).not.toThrow()
    })
    
    it('should handle invalid constellation parameters', () => {
      expect(() => getConstellationPositions(-1, 3)).not.toThrow()
      expect(() => getConstellationPositions(5, -1)).not.toThrow()
      expect(() => getConstellationPositions(5, 0)).not.toThrow()
    })
    
    it('should handle invalid connection strength parameters', () => {
      const agents = createDefaultAgents()
      const testAgent = Object.values(agents)[0]
      
      expect(() => calculateConnectionStrength(testAgent, testAgent)).not.toThrow()
      expect(() => calculateConnectionStrength(testAgent, testAgent, null as any)).not.toThrow()
    })
  })
})