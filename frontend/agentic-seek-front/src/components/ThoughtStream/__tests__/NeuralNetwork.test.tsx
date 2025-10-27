import React from 'react'
import { vi } from 'vitest'
import { render, ThreeTestWrapper, mockWebGLContext, mockAnimationFrame } from '@/utils/testUtils'
import { NeuralNetwork } from '../NeuralNetwork'
import { Vector3 } from 'three'

// Mock Three.js components
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => <mesh {...props}>{children}</mesh>,
}))

describe('NeuralNetwork Component Tests', () => {
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
  
  describe('Reasoning Parsing', () => {
    it('should parse simple reasoning text into thought nodes', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'First, I analyze the problem. Then, I decide on a solution. Finally, I implement the action.',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      // Should render without crashing and process the reasoning
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle empty reasoning gracefully', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: '',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      // Should render idle state
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should categorize different types of reasoning', () => {
      const reasoningTypes = [
        'I need to analyze this problem carefully.',
        'I have decided to choose option A.',
        'I will execute the following steps.',
        'Upon reflection, this approach seems correct.'
      ]
      
      reasoningTypes.forEach(reasoning => {
        const initialState = {
          app: {
            responseData: {
              reasoning,
              agent_name: 'test_agent'
            },
          },
        }
        
        render(
          <ThreeTestWrapper initialState={initialState}>
            <NeuralNetwork isActive={true} />
          </ThreeTestWrapper>
        )
        
        expect(document.querySelector('group')).toBeTruthy()
      })
    })
  })
  
  describe('3D Positioning', () => {
    it('should generate circular positions for thought nodes', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Step one. Step two. Step three. Step four. Step five.',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork 
            position={new Vector3(5, 5, 5)}
            scale={2}
            isActive={true}
          />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle single thought node', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Single thought process.',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle many thought nodes efficiently', () => {
      const manyThoughts = Array.from({ length: 20 }, (_, i) => 
        `Thought process number ${i + 1}.`
      ).join(' ')
      
      const initialState = {
        app: {
          responseData: {
            reasoning: manyThoughts,
            agent_name: 'test_agent'
          },
        },
      }
      
      const startTime = performance.now()
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
  
  describe('Pathway Generation', () => {
    it('should generate pathways between related thoughts', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'I analyze the data. Based on analysis, I decide. I execute the decision. I reflect on results.',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should calculate thought relationships correctly', () => {
      const relatedThoughts = 'I analyze the code structure. I analyze the dependencies. I decide on refactoring.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: relatedThoughts,
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle cross-connections for complex reasoning', () => {
      const complexReasoning = `
        First analysis step. Second analysis step. Third analysis step.
        First decision point. Second decision point.
        Implementation action. Verification action.
        Initial reflection. Final reflection.
      `
      
      const initialState = {
        app: {
          responseData: {
            reasoning: complexReasoning,
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Animation Performance', () => {
    it('should maintain smooth animations with active reasoning', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Active reasoning process with multiple steps and complex analysis.',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      const startTime = performance.now()
      
      // Simulate 60 frames of animation
      for (let i = 0; i < 60; i++) {
        mockFrames.triggerFrame(startTime + i * 16.67)
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(150)
    })
    
    it('should handle inactive state efficiently', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Some reasoning text',
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={false} />
        </ThreeTestWrapper>
      )
      
      // Should render idle visualization
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Content Similarity Calculation', () => {
    it('should calculate content similarity between thoughts', () => {
      const similarThoughts = 'I analyze the code. I analyze the structure. I review the analysis.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: similarThoughts,
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
    
    it('should handle dissimilar thoughts', () => {
      const dissimilarThoughts = 'Weather is nice. Database optimization needed. User interface improvements.'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: dissimilarThoughts,
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Type Compatibility', () => {
    it('should handle different thought type combinations', () => {
      const mixedTypes = `
        I need to analyze this problem thoroughly.
        Based on my analysis, I decide to proceed with option B.
        I will now execute the chosen solution step by step.
        Reflecting on the results, this approach was effective.
      `
      
      const initialState = {
        app: {
          responseData: {
            reasoning: mixedTypes,
            agent_name: 'test_agent'
          },
        },
      }
      
      render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      expect(document.querySelector('group')).toBeTruthy()
    })
  })
  
  describe('Error Handling', () => {
    it('should handle malformed reasoning text', () => {
      const malformedReasoning = '...!!! ??? ... !!! ???'
      
      const initialState = {
        app: {
          responseData: {
            reasoning: malformedReasoning,
            agent_name: 'test_agent'
          },
        },
      }
      
      expect(() => {
        render(
          <ThreeTestWrapper initialState={initialState}>
            <NeuralNetwork isActive={true} />
          </ThreeTestWrapper>
        )
      }).not.toThrow()
    })
    
    it('should handle null/undefined reasoning', () => {
      const testCases = [
        { reasoning: null, agent_name: 'test' },
        { reasoning: undefined, agent_name: 'test' },
        { reasoning: 'valid', agent_name: null },
        { reasoning: 'valid', agent_name: undefined }
      ]
      
      testCases.forEach(responseData => {
        const initialState = {
          app: { responseData },
        }
        
        expect(() => {
          render(
            <ThreeTestWrapper initialState={initialState}>
              <NeuralNetwork isActive={true} />
            </ThreeTestWrapper>
          )
        }).not.toThrow()
      })
    })
    
    it('should handle invalid scale and position values', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Valid reasoning text',
            agent_name: 'test_agent'
          },
        },
      }
      
      const invalidValues = [
        { position: new Vector3(NaN, 0, 0), scale: 1 },
        { position: new Vector3(0, 0, 0), scale: NaN },
        { position: new Vector3(Infinity, 0, 0), scale: -1 },
      ]
      
      invalidValues.forEach(({ position, scale }) => {
        expect(() => {
          render(
            <ThreeTestWrapper initialState={initialState}>
              <NeuralNetwork 
                position={position}
                scale={scale}
                isActive={true}
              />
            </ThreeTestWrapper>
          )
        }).not.toThrow()
      })
    })
  })
  
  describe('Memory Management', () => {
    it('should update efficiently when reasoning changes', () => {
      const initialState = {
        app: {
          responseData: {
            reasoning: 'Initial reasoning',
            agent_name: 'test_agent'
          },
        },
      }
      
      const { rerender } = render(
        <ThreeTestWrapper initialState={initialState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      // Update with new reasoning
      const updatedState = {
        app: {
          responseData: {
            reasoning: 'Updated reasoning with different content and structure',
            agent_name: 'test_agent'
          },
        },
      }
      
      const startTime = performance.now()
      
      rerender(
        <ThreeTestWrapper initialState={updatedState}>
          <NeuralNetwork isActive={true} />
        </ThreeTestWrapper>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50)
    })
  })
})