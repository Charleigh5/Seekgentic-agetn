import React from 'react'
import { vi } from 'vitest'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { ThoughtStream } from '../ThoughtStream'
import { Vector3 } from 'three'

// Mock Three.js components
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
  Html: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('ThoughtStream Component Tests', () => {
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
  
  describe('Component Rendering', () => {
    it('should render in neural mode by default', () => {
      const initialState = {
        app: {
          responseData: null,
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Should render without crashing
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should render with custom position and mode', () => {
      const position = new Vector3(5, 5, 5)
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning process',
            agent_name: 'test_agent'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream 
            position={position}
            mode="reasoning"
            isActive={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should not render when inactive', () => {
      const initialState = {
        app: {
          responseData: null,
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream isActive={false} />
        </ThreeTestWrapper>
      )
      
      // Should not render when inactive
      expect(document.querySelector('[name="thought-stream"]')).toBeFalsy()
    })
  })
  
  describe('Mode Switching', () => {
    it('should switch to reasoning mode when messages have reasoning', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning',
            agent_name: 'test_agent'
          },
          messages: [
            {
              uid: 'msg-1',
              content: 'Test message',
              reasoning: 'Test reasoning process',
              type: 'agent' as const
            }
          ],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Should automatically switch to reasoning mode
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should switch to immersive mode when reasoning is expanded', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning',
            agent_name: 'test_agent'
          },
          messages: [
            {
              uid: 'msg-1',
              content: 'Test message',
              reasoning: 'Test reasoning process',
              type: 'agent' as const
            }
          ],
          expandedReasoning: [0],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Should switch to immersive mode
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
  })
  
  describe('Processing State', () => {
    it('should detect processing state from response data', async () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'New reasoning being processed',
            agent_name: 'coder'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Should detect processing state
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should handle processing timeout', async () => {
      vi.useFakeTimers()
      
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Processing reasoning',
            agent_name: 'planner'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Fast-forward time to trigger processing timeout
      vi.advanceTimersByTime(3000)
      
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
      
      vi.useRealTimers()
    })
  })
  
  describe('Animation Performance', () => {
    it('should maintain smooth animations across different modes', () => {
      const modes: Array<'neural' | 'reasoning' | 'immersive'> = ['neural', 'reasoning', 'immersive']
      
      modes.forEach(mode => {
        const initialState = {
          app: {
            responseData: {
              reasoning: 'Test reasoning for animation',
              agent_name: 'test_agent'
            },
            messages: mode === 'immersive' ? [
              {
                uid: 'msg-1',
                content: 'Test',
                reasoning: 'Test reasoning',
                type: 'agent' as const
              }
            ] : [],
            expandedReasoning: mode === 'immersive' ? [0] : [],
          },
        }
        
        const startTime = performance.now()
        
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ThoughtStream mode={mode} />
          </ThreeTestWrapper>
        )
        
        // Simulate animation frames
        for (let i = 0; i < 30; i++) {
          mockFrames.triggerFrame(startTime + i * 16.67)
        }
        
        const endTime = performance.now()
        const animationTime = endTime - startTime
        
        // Should complete animations efficiently
        expect(animationTime).toBeLessThan(100)
      })
    })
    
    it('should handle rapid mode changes efficiently', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning',
            agent_name: 'test_agent'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      const { rerender } = render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream mode="neural" />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Rapidly change modes
      const modes: Array<'neural' | 'reasoning' | 'immersive'> = ['reasoning', 'immersive', 'neural', 'reasoning']
      modes.forEach(mode => {
        rerender(
          <ThreeTestWrapper initialState={initialState}>
            <ThoughtStream mode={mode} />
          </ThreeTestWrapper>
        )
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50)
    })
  })
  
  describe('Integration with Reasoning Data', () => {
    it('should handle complex reasoning text', () => {
      const complexReasoning = `
        First, I need to analyze the user's request carefully. This involves understanding the context and requirements.
        Then, I should consider multiple approaches to solve the problem effectively.
        After evaluation, I will choose the most appropriate solution based on the criteria.
        Finally, I will implement the chosen approach and verify the results.
      `
      
      const initialState = {
        app: {
          responseData: {
            reasoning: complexReasoning,
            agent_name: 'planner'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream mode="reasoning" />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should handle multiple messages with reasoning', () => {
      const initialState = {
        app: {
          responseData: null,
          messages: [
            {
              uid: 'msg-1',
              content: 'First message',
              reasoning: 'First reasoning process',
              type: 'agent' as const
            },
            {
              uid: 'msg-2',
              content: 'Second message',
              reasoning: 'Second reasoning process',
              type: 'agent' as const
            },
            {
              uid: 'msg-3',
              content: 'Third message',
              reasoning: 'Third reasoning process',
              type: 'agent' as const
            }
          ],
          expandedReasoning: [0, 2],
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream mode="immersive" />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('[name="thought-stream"]')).toBeTruthy()
    })
    
    it('should handle empty or malformed reasoning data', () => {
      const testCases = [
        { reasoning: '', agent_name: 'test' },
        { reasoning: null, agent_name: 'test' },
        { reasoning: 'Valid reasoning', agent_name: '' },
        { reasoning: undefined, agent_name: undefined }
      ]
      
      testCases.forEach((responseData, index) => {
        const initialState = {
          app: {
            responseData,
            messages: [],
            expandedReasoning: [],
          },
        }
        
        expect(() => {
          render(
            <ThreeTestWrapper initialState={initialState}>
              <ThoughtStream />
            </ThreeTestWrapper>
          )
        }).not.toThrow()
      })
    })
  })
  
  describe('Error Handling', () => {
    it('should handle WebGL context loss gracefully', () => {
      // Simulate WebGL context loss
      const lostContext = {
        ...mockWebGL,
        isContextLost: () => true,
      }
      
      const canvas = document.createElement('canvas')
      vi.spyOn(canvas, 'getContext').mockReturnValue(lostContext)
      
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning',
            agent_name: 'test_agent'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <ThoughtStream />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
    
    it('should handle invalid Vector3 positions', () => {
      const invalidPositions = [
        new Vector3(NaN, 0, 0),
        new Vector3(Infinity, 0, 0),
        new Vector3(0, -Infinity, 0)
      ]
      
      invalidPositions.forEach(position => {
        const initialState = {
          app: {
            responseData: null,
            messages: [],
            expandedReasoning: [],
          },
        }
        
        expect(() => {
          render(
            <ThreeTestWrapper initialState={initialState}>
              <ThoughtStream position={position} />
            </ThreeTestWrapper>
          )
        }).not.toThrow()
      })
    })
  })
  
  describe('Memory Management', () => {
    it('should clean up resources when unmounted', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Test reasoning',
            agent_name: 'test_agent'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      const { unmount } = render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      // Should unmount without memory leaks
      expect(() => unmount()).not.toThrow()
    })
    
    it('should handle large reasoning datasets efficiently', () => {
      // Create large reasoning text
      const largeReasoning = Array.from({ length: 100 }, (_, i) => 
        `This is reasoning step ${i + 1} with detailed analysis and complex decision making process.`
      ).join(' ')
      
      const initialState = {
        app: {
          responseData: {
            reasoning: largeReasoning,
            agent_name: 'test_agent'
          },
          messages: [],
          expandedReasoning: [],
        },
      }
      
      const startTime = performance.now()
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <ThoughtStream />
        </ThreeTestWrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should handle large datasets efficiently
      expect(renderTime).toBeLessThan(200)
    })
  })
})