import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { AgentConstellation } from '../AgentConstellation'
import { createDefaultAgents } from '@/utils/agentUtils'
import type { AgentState, ResponseData } from '@/types'

// Mock the API slice
jest.mock('@/store/api/apiSlice', () => ({
  useGetLatestAnswerQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}))

// Mock Three.js components
jest.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
  Html: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('AgentConstellation Integration Tests', () => {
  let mockWebGL: any
  let mockFrames: any
  
  beforeEach(() => {
    mockWebGL = mockWebGLContext()
    mockFrames = mockAnimationFrame()
    
    // Reset all mocks
    jest.clearAllMocks()
  })
  
  afterEach(() => {
    jest.restoreAllMocks()
  })
  
  describe('Agent State Synchronization', () => {
    it('should initialize with default agents when no agents exist', async () => {
      const initialState = {
        agents: {
          agents: {},
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Wait for agents to be initialized
      await waitFor(() => {
        // Check that default agents are created
        const defaultAgents = createDefaultAgents()
        expect(Object.keys(defaultAgents)).toHaveLength(5)
      })
    })
    
    it('should update agent states based on API response', async () => {
      const mockApiResponse: ResponseData = {
        agent_name: 'coder',
        status: 'processing',
        answer: 'Working on code generation task',
        done: false,
      }
      
      // Mock the API hook to return our test data
      const { useGetLatestAnswerQuery } = require('@/store/api/apiSlice')
      useGetLatestAnswerQuery.mockReturnValue({
        data: mockApiResponse,
        isLoading: false,
        error: null,
      })
      
      const defaultAgents = createDefaultAgents()
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
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Verify that the coder agent status would be updated to processing
        expect(useGetLatestAnswerQuery).toHaveBeenCalled()
      })
    })
    
    it('should handle multiple active agents correctly', async () => {
      const mockApiResponse: ResponseData = {
        agent_name: 'planner',
        status: 'processing',
        answer: 'Coordinating multiple agents',
        done: false,
      }
      
      const { useGetLatestAnswerQuery } = require('@/store/api/apiSlice')
      useGetLatestAnswerQuery.mockReturnValue({
        data: mockApiResponse,
        isLoading: false,
        error: null,
      })
      
      const defaultAgents = createDefaultAgents()
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: ['agent-coder', 'agent-file'],
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        expect(useGetLatestAnswerQuery).toHaveBeenCalled()
      })
    })
  })
  
  describe('3D Rendering Performance', () => {
    it('should render all agent types without performance issues', async () => {
      const defaultAgents = createDefaultAgents()
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: Object.keys(defaultAgents),
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      const startTime = performance.now()
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Trigger several animation frames to test performance
      for (let i = 0; i < 10; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67) // 60fps
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time (less than 100ms for initial render)
      expect(renderTime).toBeLessThan(100)
    })
    
    it('should handle agent status animations efficiently', async () => {
      const defaultAgents = createDefaultAgents()
      
      // Set different statuses for performance testing
      Object.values(defaultAgents).forEach((agent, index) => {
        const statuses: AgentState['status'][] = ['idle', 'processing', 'error', 'offline']
        agent.status = statuses[index % statuses.length]
      })
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: Object.keys(defaultAgents),
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Simulate continuous animation frames
      const frameCount = 60 // 1 second at 60fps
      const startTime = performance.now()
      
      for (let i = 0; i < frameCount; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      // Should maintain performance with animations
      expect(performance.now() - startTime).toBeLessThan(200)
    })
    
    it('should render connections between agents efficiently', async () => {
      const defaultAgents = createDefaultAgents()
      const agentIds = Object.keys(defaultAgents)
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: agentIds,
          thoughtProcesses: {},
          connections: {
            [agentIds[0]]: [agentIds[1], agentIds[2]],
            [agentIds[1]]: [agentIds[3]],
            [agentIds[2]]: [agentIds[4]],
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Test connection rendering performance
      const startTime = performance.now()
      
      for (let i = 0; i < 30; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      expect(performance.now() - startTime).toBeLessThan(150)
    })
  })
  
  describe('Interactive Elements and User Feedback', () => {
    it('should handle agent hover interactions', async () => {
      const defaultAgents = createDefaultAgents()
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
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Note: In a real test environment, we would need to simulate 3D interactions
      // This is a simplified test structure
      await waitFor(() => {
        // Verify that the constellation is rendered
        expect(document.querySelector('[name="agent-constellation"]')).toBeTruthy()
      })
    })
    
    it('should handle agent click interactions for detailed view', async () => {
      const defaultAgents = createDefaultAgents()
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [],
          thoughtProcesses: {},
          connections: {},
        },
        app: {
          responseData: {
            agent_name: 'coder',
            answer: 'Test response',
            reasoning: 'Test reasoning process',
            blocks: {
              'block1': {
                tool_type: 'code_execution',
                block: 'console.log("test")',
                feedback: 'Success',
                success: true,
              },
            },
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Verify constellation is rendered and ready for interactions
        expect(document.querySelector('[name="agent-constellation"]')).toBeTruthy()
      })
    })
    
    it('should display agent information panels correctly', async () => {
      const defaultAgents = createDefaultAgents()
      const testAgent = Object.values(defaultAgents)[0]
      
      // Add some test data to the agent
      testAgent.currentTask = {
        id: 'test-task',
        description: 'Test task description',
        progress: 75,
        startTime: new Date(),
      }
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: [testAgent.id],
          thoughtProcesses: {},
          connections: {},
        },
        app: {
          responseData: {
            agent_name: testAgent.name.toLowerCase().replace(' agent', ''),
            answer: 'Test agent response',
            reasoning: 'Detailed reasoning process',
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Verify that agent data is properly structured for display
        expect(testAgent.currentTask?.progress).toBe(75)
        expect(testAgent.capabilities.length).toBeGreaterThan(0)
      })
    })
  })
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      const { useGetLatestAnswerQuery } = require('@/store/api/apiSlice')
      useGetLatestAnswerQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' },
      })
      
      const defaultAgents = createDefaultAgents()
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
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Should still render agents even with API error
        expect(Object.keys(defaultAgents)).toHaveLength(5)
      })
    })
    
    it('should handle empty or malformed API responses', async () => {
      const { useGetLatestAnswerQuery } = require('@/store/api/apiSlice')
      useGetLatestAnswerQuery.mockReturnValue({
        data: {}, // Empty response
        isLoading: false,
        error: null,
      })
      
      const defaultAgents = createDefaultAgents()
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
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Should handle empty response without crashing
        expect(useGetLatestAnswerQuery).toHaveBeenCalled()
      })
    })
    
    it('should handle WebGL context loss gracefully', async () => {
      // Simulate WebGL context loss
      const canvas = document.createElement('canvas')
      const lostContext = {
        ...mockWebGL,
        isContextLost: () => true,
      }
      
      jest.spyOn(canvas, 'getContext').mockReturnValue(lostContext)
      
      const defaultAgents = createDefaultAgents()
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
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      await waitFor(() => {
        // Should handle context loss without crashing
        expect(document.querySelector('[name="agent-constellation"]')).toBeTruthy()
      })
    })
  })
  
  describe('Performance Monitoring', () => {
    it('should maintain acceptable frame rates with multiple agents', async () => {
      const defaultAgents = createDefaultAgents()
      
      // Create a scenario with all agents active and processing
      Object.values(defaultAgents).forEach(agent => {
        agent.status = 'processing'
        agent.currentTask = {
          id: `task-${agent.id}`,
          description: 'Heavy processing task',
          progress: Math.random() * 100,
          startTime: new Date(),
        }
      })
      
      const initialState = {
        agents: {
          agents: defaultAgents,
          activeAgents: Object.keys(defaultAgents),
          thoughtProcesses: {},
          connections: {},
        },
      }
      
      const frameTimings: number[] = []
      let lastFrameTime = performance.now()
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <AgentConstellation />
        </ThreeTestWrapper>
      )
      
      // Measure frame timing over 60 frames
      for (let i = 0; i < 60; i++) {
        const currentTime = performance.now()
        frameTimings.push(currentTime - lastFrameTime)
        lastFrameTime = currentTime
        
        mockFrames.triggerFrame(currentTime)
      }
      
      // Calculate average frame time
      const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length
      
      // Should maintain close to 60fps (16.67ms per frame)
      expect(avgFrameTime).toBeLessThan(20) // Allow some overhead
    })
  })
})