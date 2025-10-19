import { describe, it, expect } from 'vitest'
import neuralInterfaceReducer, {
  setInitialized,
  set3DEnabled,
  setTheme,
  setCameraPosition,
  setSceneLoaded,
  setAnimationSpeed,
  setParticleCount,
  setVisualEffectsEnabled,
} from '../slices/neuralInterfaceSlice'
import type { ThemeConfig } from '@/types'

describe('neuralInterfaceSlice', () => {
  const initialState = {
    isInitialized: false,
    is3DEnabled: true,
    currentTheme: {
      name: 'neural-dark',
      colors: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        accent: '#00ff88',
      },
      materials: {
        agent: 'holographic',
        workspace: 'glass',
        ui: 'neon',
      },
    },
    workspaceObjects: {},
    cameraPosition: [0, 0, 10] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    sceneLoaded: false,
    animationSpeed: 1.0,
    particleCount: 1000,
    visualEffectsEnabled: true,
  }

  it('should return the initial state', () => {
    expect(neuralInterfaceReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setInitialized', () => {
    const actual = neuralInterfaceReducer(initialState, setInitialized(true))
    expect(actual.isInitialized).toBe(true)
  })

  it('should handle set3DEnabled', () => {
    const actual = neuralInterfaceReducer(initialState, set3DEnabled(false))
    expect(actual.is3DEnabled).toBe(false)
  })

  it('should handle setTheme', () => {
    const newTheme: ThemeConfig = {
      name: 'neural-light',
      colors: {
        primary: '#0066cc',
        secondary: '#cc0066',
        background: '#f5f5f5',
        surface: '#ffffff',
        text: '#333333',
        accent: '#00cc66',
      },
      materials: {
        agent: 'metallic',
        workspace: 'glass-light',
        ui: 'clean',
      },
    }
    const actual = neuralInterfaceReducer(initialState, setTheme(newTheme))
    expect(actual.currentTheme).toEqual(newTheme)
  })

  it('should handle setCameraPosition', () => {
    const newPosition: [number, number, number] = [5, 5, 15]
    const actual = neuralInterfaceReducer(initialState, setCameraPosition(newPosition))
    expect(actual.cameraPosition).toEqual(newPosition)
  })

  it('should handle setSceneLoaded', () => {
    const actual = neuralInterfaceReducer(initialState, setSceneLoaded(true))
    expect(actual.sceneLoaded).toBe(true)
  })

  it('should handle setAnimationSpeed', () => {
    const actual = neuralInterfaceReducer(initialState, setAnimationSpeed(0.5))
    expect(actual.animationSpeed).toBe(0.5)
  })

  it('should handle setParticleCount', () => {
    const actual = neuralInterfaceReducer(initialState, setParticleCount(2000))
    expect(actual.particleCount).toBe(2000)
  })

  it('should handle setVisualEffectsEnabled', () => {
    const actual = neuralInterfaceReducer(initialState, setVisualEffectsEnabled(false))
    expect(actual.visualEffectsEnabled).toBe(false)
  })

  it('should handle multiple state changes', () => {
    let state = neuralInterfaceReducer(initialState, setInitialized(true))
    state = neuralInterfaceReducer(state, setSceneLoaded(true))
    state = neuralInterfaceReducer(state, setAnimationSpeed(2.0))
    state = neuralInterfaceReducer(state, setCameraPosition([10, 10, 20]))

    expect(state.isInitialized).toBe(true)
    expect(state.sceneLoaded).toBe(true)
    expect(state.animationSpeed).toBe(2.0)
    expect(state.cameraPosition).toEqual([10, 10, 20])
  })
})