import { describe, it, expect } from 'vitest'
import appReducer, {
  setQuery,
  addMessage,
  setIsLoading,
  setError,
  setCurrentView,
  toggleReasoning,
  clearMessages,
} from '../slices/appSlice'
import type { Message } from '@/types'

describe('appSlice', () => {
  const initialState = {
    messages: [],
    query: '',
    isLoading: false,
    error: null,
    currentView: 'blocks' as const,
    responseData: null,
    isOnline: false,
    status: 'Agents ready',
    expandedReasoning: [],
  }

  it('should return the initial state', () => {
    expect(appReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setQuery', () => {
    const actual = appReducer(initialState, setQuery('test query'))
    expect(actual.query).toEqual('test query')
  })

  it('should handle addMessage', () => {
    const message: Message = {
      type: 'user',
      content: 'Hello world',
    }
    const actual = appReducer(initialState, addMessage(message))
    expect(actual.messages).toHaveLength(1)
    expect(actual.messages[0]).toEqual(message)
  })

  it('should handle setIsLoading', () => {
    const actual = appReducer(initialState, setIsLoading(true))
    expect(actual.isLoading).toBe(true)
  })

  it('should handle setError', () => {
    const errorMessage = 'Something went wrong'
    const actual = appReducer(initialState, setError(errorMessage))
    expect(actual.error).toEqual(errorMessage)
  })

  it('should handle setCurrentView', () => {
    const actual = appReducer(initialState, setCurrentView('screenshot'))
    expect(actual.currentView).toEqual('screenshot')
  })

  it('should handle toggleReasoning', () => {
    // Add reasoning for message index 0
    let state = appReducer(initialState, toggleReasoning(0))
    expect(state.expandedReasoning.includes(0)).toBe(true)

    // Toggle it off
    state = appReducer(state, toggleReasoning(0))
    expect(state.expandedReasoning.includes(0)).toBe(false)
  })

  it('should handle clearMessages', () => {
    const stateWithMessages = {
      ...initialState,
      messages: [
        { type: 'user' as const, content: 'Hello' },
        { type: 'agent' as const, content: 'Hi there' },
      ],
    }
    const actual = appReducer(stateWithMessages, clearMessages())
    expect(actual.messages).toHaveLength(0)
  })

  it('should handle multiple actions in sequence', () => {
    let state = appReducer(initialState, setQuery('test'))
    state = appReducer(state, setIsLoading(true))
    state = appReducer(state, addMessage({ type: 'user', content: 'test' }))
    state = appReducer(state, setIsLoading(false))

    expect(state.query).toBe('test')
    expect(state.isLoading).toBe(false)
    expect(state.messages).toHaveLength(1)
  })
})