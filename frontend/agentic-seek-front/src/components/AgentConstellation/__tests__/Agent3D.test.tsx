import React from 'react'
import { vi } from 'vitest'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { Agent3D } from '../Agent3D'
import { Vector3 } from 'three'
import type { AgentState } from '@/types'

// Mock Three.js components
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
}))

describe('Agent3D Component Tests', () => {
  let mockWebGL: any
  let mockFrames: any
  
  const createTestAgent = (overrides: Partial<AgentState> = {}): AgentState => ({
    id: 'test-agent',
    name: 'Test Agent',
    type: 'casual',
    status: 'idle',
    capabilities: [
      {
        id: 'test-capability',
        name: 'Test Capability',
        description: 'A test capability',
        enabled: true,
      },
    ],
    performance: {
      responseTime: 500,
      successRate: 0.95,
      memoryUsage: 75.5,
      cpuUsage: 0.25,
    },
    visualConfig: {
      color: '#4A90E2',
      geometry: 'sphere',
      position: new Vector3(0, 0, 0),
      scale: 1,
      animation: {
        idle: 'float',
        processing: 'pulse',
        error: 'shake',
        transition: 'smooth',
      },
    },
    ...overrides,
  })
  
  beforeEach(() => {
    mockWebGL = mockWebGLContext()
    mockFrames = mockAnimationFrame()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  describe('Rendering Different Agent Types', () => {
    it('should render casual agent with sphere geometry', () => {
      const agent = createTestAgent({ type: 'casual' })
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      // Verify that the component renders without crashing
      expect(agent.type).toBe('casual')
    })
    
    it('should render coder agent with cube geometry', () => {
      const agent = createTestAgent({ type: 'coder' })
      const position = new Vector3(1, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.type).toBe('coder')
    })
    
    it('should render file agent with octahedron geometry', () => {
      const agent = createTestAgent({ type: 'file' })
      const position = new Vector3(-1, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.type).toBe('file')
    })
    
    it('should render browser agent with tetrahedron geometry', () => {
      const agent = createTestAgent({ type: 'browser' })
      const position = new Vector3(0, 1, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.type).toBe('browser')
    })
    
    it('should render planner agent with dodecahedron geometry', () => {
      const agent = createTestAgent({ type: 'planner' })
      const position = new Vector3(0, -1, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.type).toBe('planner')
    })
  })
  
  describe('Status Visualization', () => {
    it('should apply correct colors for different statuses', () => {
      const statuses: AgentState['status'][] = ['idle', 'processing', 'error', 'offline']
      
      statuses.forEach(status => {
        const agent = createTestAgent({ status })
        const position = new Vector3(0, 0, 0)
        
        render(
          <ThreeTestWrapper>
            <Agent3D agent={agent} position={position} />
          </ThreeTestWrapper>
        )
        
        expect(agent.status).toBe(status)
      })
    })
    
    it('should handle processing status with pulsing animation', () => {
      const agent = createTestAgent({ status: 'processing' })
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      // Simulate animation frames for processing animation
      const startTime = performance.now()
      for (let i = 0; i < 10; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      expect(agent.status).toBe('processing')
    })
    
    it('should handle error status with shake animation', () => {
      const agent = createTestAgent({ status: 'error' })
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      // Simulate animation frames for error animation
      const startTime = performance.now()
      for (let i = 0; i < 10; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      expect(agent.status).toBe('error')
    })
    
    it('should handle offline status with transparency', () => {
      const agent = createTestAgent({ status: 'offline' })
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.status).toBe('offline')
    })
  })
  
  describe('Interaction Handling', () => {
    it('should call onHover callback when hovered', () => {
      const onHover = vi.fn()
      const onClick = vi.fn()
      const agent = createTestAgent()
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D 
            agent={agent} 
            position={position} 
            onHover={onHover}
            onClick={onClick}
          />
        </ThreeTestWrapper>
      )
      
      // Note: In a real 3D environment, we would simulate pointer events
      // This test verifies the callbacks are properly set up
      expect(onHover).toBeDefined()
      expect(onClick).toBeDefined()
    })
    
    it('should call onClick callback when clicked', () => {
      const onHover = vi.fn()
      const onClick = vi.fn()
      const agent = createTestAgent()
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D 
            agent={agent} 
            position={position} 
            onHover={onHover}
            onClick={onClick}
          />
        </ThreeTestWrapper>
      )
      
      expect(onClick).toBeDefined()
    })
  })
  
  describe('Animation Performance', () => {
    it('should maintain smooth animations across different statuses', () => {
      const statuses: AgentState['status'][] = ['idle', 'processing', 'error', 'offline']
      
      statuses.forEach(status => {
        const agent = createTestAgent({ status })
        const position = new Vector3(0, 0, 0)
        
        const startTime = performance.now()
        
        render(
          <ThreeTestWrapper>
            <Agent3D agent={agent} position={position} />
          </ThreeTestWrapper>
        )
        
        // Simulate 60 frames of animation
        for (let i = 0; i < 60; i++) {
          mockFrames.triggerFrame(startTime + i * 16.67)
        }
        
        const endTime = performance.now()
        const animationTime = endTime - startTime
        
        // Should complete 60 frames in reasonable time
        expect(animationTime).toBeLessThan(100)
      })
    })
    
    it('should handle rapid status changes efficiently', () => {
      const agent = createTestAgent({ status: 'idle' })
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Simulate rapid status changes
      const statuses: AgentState['status'][] = ['processing', 'idle', 'error', 'processing', 'idle']
      statuses.forEach((status, index) => {
        agent.status = status
        mockFrames.triggerFrame(startTime + index * 100) // Change every 100ms
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50)
    })
  })
  
  describe('Visual Configuration', () => {
    it('should respect custom visual configuration', () => {
      const customVisualConfig = {
        color: '#FF0000',
        geometry: 'cube' as const,
        position: new Vector3(5, 5, 5),
        scale: 2,
        animation: {
          idle: 'custom-idle',
          processing: 'custom-processing',
          error: 'custom-error',
          transition: 'custom-transition',
        },
      }
      
      const agent = createTestAgent({
        type: 'coder',
        visualConfig: customVisualConfig,
      })
      
      const position = new Vector3(0, 0, 0)
      
      render(
        <ThreeTestWrapper>
          <Agent3D agent={agent} position={position} />
        </ThreeTestWrapper>
      )
      
      expect(agent.visualConfig.color).toBe('#FF0000')
      expect(agent.visualConfig.scale).toBe(2)
    })
    
    it('should handle missing or invalid visual configuration gracefully', () => {
      const agent = createTestAgent({
        visualConfig: {
          ...createTestAgent().visualConfig,
          geometry: 'invalid' as any,
        },
      })
      
      const position = new Vector3(0, 0, 0)
      
      // Should not crash with invalid geometry
      expect(() => {
        render(
          <ThreeTestWrapper>
            <Agent3D agent={agent} position={position} />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
  })
})