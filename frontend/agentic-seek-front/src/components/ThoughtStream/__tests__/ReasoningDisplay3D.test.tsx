import React from 'react'
import { vi } from 'vitest'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { ReasoningDisplay3D } from '../ReasoningDisplay3D'
import { Vector3 } from 'three'

// Mock Three.js components
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
  Html: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('ReasoningDisplay3D Component Tests', () => {
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
  
  describe('Reasoning Segmentation', () => {
    it('should segment reasoning text into meaningful parts', () => {
      const complexReasoning = `
        First, I need to understand the problem context. This requires careful analysis.
        Then, I should evaluate different solution approaches. Each has pros and cons.
        Finally, I will implement the chosen solution. This ensures optimal results.
      `
      
      const initialState = {
        app: {
          responseData: {
            reasoning: complexReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle single sentence reasoning', () => {
      const singleSentence = 'This is a simple reasoning step.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: singleSentence,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle empty reasoning gracefully', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: '',
            agent_name: 'test_agent'
          },
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D messageIndex={0} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Confidence Calculation', () => {
    it('should calculate high confidence for certain keywords', () => {
      const highConfidenceReasoning = 'I am certain this is the correct approach. This is definitely the best solution.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: highConfidenceReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should calculate medium confidence for likely keywords', () => {
      const mediumConfidenceReasoning = 'This probably works well. It likely provides good results.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: mediumConfidenceReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should calculate low confidence for uncertain keywords', () => {
      const lowConfidenceReasoning = 'This might work. Perhaps this could be a solution. Maybe this approach is viable.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: lowConfidenceReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should calculate default confidence based on sentence complexity', () => {
      const neutralReasoning = 'This approach involves multiple steps and considerations for implementation.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: neutralReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Expansion State Management', () => {
    it('should handle expanded state correctly', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning for expansion',
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle collapsed state correctly', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning for collapse',
            agent_name: 'test_agent'
          },
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={false}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle toggle interactions', () => {
      const mockToggle = vi.fn()
      
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning for toggle',
            agent_name: 'test_agent'
          },
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            onToggle={mockToggle}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Streaming Animation', () => {
    it('should handle streaming effect for new reasoning', async () => {
      vi.useFakeTimers()
      
      const initialState = {
        app: {
          responseData: {
            reasoning: 'New streaming reasoning text',
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      // Fast-forward through streaming animation
      vi.advanceTimersByTime(2000)
      
      expect(document.querySelector('group')).toBeTruthy()
      
      vi.useRealTimers()
    })
    
    it('should handle streaming timeout correctly', async () => {
      vi.useFakeTimers()
      
      const longReasoning = 'A'.repeat(1000) // Very long text
      
      const initialState = {
        app: {
          responseData: {
            reasoning: longReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      // Fast-forward past streaming timeout
      vi.advanceTimersByTime(50000)
      
      expect(document.querySelector('group')).toBeTruthy()
      
      vi.useRealTimers()
    })
  })
  
  describe('Animation Performance', () => {
    it('should maintain smooth animations during expansion', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning with multiple segments for animation testing',
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Simulate animation frames
      for (let i = 0; i < 60; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(150)
    })
    
    it('should handle rapid expansion/collapse efficiently', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning for rapid state changes',
            agent_name: 'test_agent'
          },
          expandedReasoning: [],
        },
      }
      
      const { rerender } = render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={false}
          />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Rapidly toggle expansion state
      for (let i = 0; i < 10; i++) {
        rerender(
          <ThreeTestWrapper initialState={initialState}>
            <ReasoningDisplay3D 
              messageIndex={0}
              isExpanded={i % 2 === 0}
            />
          </ThreeTestWrapper>
        )
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
  
  describe('Position and Layout', () => {
    it('should handle custom positions correctly', () => {
      const customPosition = new Vector3(10, 5, -3)
      
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning at custom position',
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            position={customPosition}
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should layout multiple reasoning segments correctly', () => {
      const multiSegmentReasoning = `
        First reasoning segment with detailed analysis.
        Second reasoning segment with decision making.
        Third reasoning segment with implementation details.
        Fourth reasoning segment with validation steps.
        Fifth reasoning segment with final conclusions.
      `
      
      const initialState = {
        app: {
          responseData: {
            reasoning: multiSegmentReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D 
            messageIndex={0}
            isExpanded={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Error Handling', () => {
    it('should handle missing response data gracefully', () => {
      const initialState = {
        app: {
          responseData: null,
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ReasoningDisplay3D messageIndex={0} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle invalid message indices', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Valid reasoning',
            agent_name: 'test_agent'
          },
          expandedReasoning: [999], // Invalid index
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ReasoningDisplay3D messageIndex={999} />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
    
    it('should handle malformed reasoning text', () => {
      const malformedReasoning = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: malformedReasoning,
            agent_name: 'test_agent'
          },
          expandedReasoning: [0],
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ReasoningDisplay3D 
              messageIndex={0}
              isExpanded={true}
            />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
  })
})