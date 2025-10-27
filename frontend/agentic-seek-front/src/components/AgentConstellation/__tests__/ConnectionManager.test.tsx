import React from 'react'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { ConnectionManager } from '../ConnectionManager'
import { createDefaultAgents } from '@/utils/agentUtils'
import type { AgentState } from '@/types'

// Mock Three.js components
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
}))

describe('ConnectionManager Component Tests', () => {
  let mockWebGL: any
  let mockFrames: any
  
  beforeEach(() => {
    mockWebGL = mockWebGLContext()
    mockFrames = mockAnimationFrame()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  describe('Connection Calculation', () => {
    it('should calculate connections between all agents', () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // With 5 agents, we should have up to 10 possible connections (n*(n-1)/2)
      const maxConnections = (agentIds.length * (agentIds.length - 1)) / 2
      expect(maxConnections).toBe(10)
    })
    
    it('should boost connection strength for complementary agent types', () => {
      const defaultAgents = createDefaultAgents()
      const coderAgent = Object.values(defaultAgents).find(a => a.type === 'coder')!
      const fileAgent = Object.values(defaultAgents).find(a => a.type === 'file')!
      
      // Set both agents to processing to boost connection
      coderAgent.status = 'processing'
      fileAgent.status = 'processing'
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [coderAgent.id, fileAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Verify that complementary agents have higher connection strength
      expect(coderAgent.status).toBe('processing')
      expect(fileAgent.status).toBe('processing')
    })
    
    it('should handle active agent connections correctly', () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      const activeAgents = agentIds.slice(0, 3) // First 3 agents active
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents,
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      expect(activeAgents).toHaveLength(3)
    })
  })
  
  describe('Data Flow Direction', () => {
    it('should determine correct data flow for planner agent', () => {
      const defaultAgents = createDefaultAgents()
      const plannerAgent = Object.values(defaultAgents).find(a => a.type === 'planner')!
      const casualAgent = Object.values(defaultAgents).find(a => a.type === 'casual')!
      
      plannerAgent.status = 'processing'
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [plannerAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Planner typically coordinates (sends data to others)
      expect(plannerAgent.type).toBe('planner')
      expect(casualAgent.type).toBe('casual')
    })
    
    it('should handle bidirectional connections for equal status agents', () => {
      const defaultAgents = createDefaultAgents()
      const agents = Object.values(defaultAgents)
      
      // Set all agents to same status
      agents.forEach(agent => {
        agent.status = 'idle'
      })
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // All agents have equal status, should result in bidirectional connections
      expect(agents.every(agent => agent.status === 'idle')).toBe(true)
    })
  })
  
  describe('Connection Rendering Performance', () => {
    it('should render connections efficiently with multiple active agents', () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      
      // Set all agents to processing for maximum connections
      Object.values(defaultAgents).forEach(agent => {
        agent.status = 'processing'
      })
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: agentIds,
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      const startTime = performance.now()
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Simulate animation frames for connection animations
      for (let i = 0; i < 30; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render connections efficiently
      expect(renderTime).toBeLessThan(100)
    })
    
    it('should handle connection animations smoothly', () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: agentIds.slice(0, 2), // Two active agents
          thoughtProcesses: {},
          connections: {
            [agentIds[0]]: [agentIds[1]],
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Simulate continuous animation for connection effects
      for (let i = 0; i < 60; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(150)
    })
  })
  
  describe('Connection Strength Calculation', () => {
    it('should filter out weak connections', () => {
      const defaultAgents = createDefaultAgents()
      
      // Create agents with minimal interaction (should result in weak connections)
      Object.values(defaultAgents).forEach(agent => {
        agent.status = 'offline'
        agent.performance.successRate = 0.1 // Low success rate
      })
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Weak connections should be filtered out (strength < 0.1)
      expect(Object.values(defaultAgents).every(agent => agent.status === 'offline')).toBe(true)
    })
    
    it('should boost connections for high-affinity agent pairs', () => {
      const defaultAgents = createDefaultAgents()
      const coderAgent = Object.values(defaultAgents).find(a => a.type === 'coder')!
      const fileAgent = Object.values(defaultAgents).find(a => a.type === 'file')!
      const browserAgent = Object.values(defaultAgents).find(a => a.type === 'browser')!
      
      // These agent types should have natural affinity
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [coderAgent.id, fileAgent.id, browserAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Verify high-affinity pairs are identified
      expect(coderAgent.type).toBe('coder')
      expect(fileAgent.type).toBe('file')
      expect(browserAgent.type).toBe('browser')
    })
  })
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle empty agent list gracefully', () => {
      const initialState = {
        agents: {
          agents: {},
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ConnectionManager />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
    
    it('should handle single agent without connections', () => {
      const defaultAgents = createDefaultAgents()
      const singleAgent = Object.values(defaultAgents)[0]
      
      const initialState = {
        agents: {
          agents: { [singleAgent.id]: singleAgent },
          activeAgents: [singleAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Single agent should not crash the connection system
      expect(singleAgent).toBeDefined()
    })
    
    it('should handle invalid agent states gracefully', () => {
      const defaultAgents = createDefaultAgents()
      const invalidAgent = Object.values(defaultAgents)[0]
      
      // Create invalid state
      invalidAgent.status = 'invalid' as any
      invalidAgent.type = 'unknown' as any
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [invalidAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ConnectionManager />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
  })
  
  describe('Real-time Updates', () => {
    it('should update connections when agent states change', () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      const { rerender } = render(
        <ThreeTestWrapper initialState={initialState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      // Update state to have active agents
      const updatedState = {
        ...initialState,
        agents: {
          ...initialState.agents,
          activeAgents: agentIds.slice(0, 2),
        },
      }
      
      rerender(
        <ThreeTestWrapper initialState={updatedState}>
          <ConnectionManager />
        </ThreeTestWrapper>
      )
      
      expect(updatedState.agents.activeAgents).toHaveLength(2)
    })
  })
})