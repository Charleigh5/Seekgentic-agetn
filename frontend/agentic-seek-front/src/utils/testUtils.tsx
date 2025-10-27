import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Canvas } from '@react-three/fiber'
import { vi } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SceneProvider } from '@/contexts/SceneContext'
import { PerformanceProvider } from '@/contexts/PerformanceContext'
import appReducer from '@/store/slices/appSlice'
import agentsReducer from '@/store/slices/agentsSlice'
import neuralInterfaceReducer from '@/store/slices/neuralInterfaceSlice'
import performanceReducer from '@/store/slices/performanceSlice'
import { global } from 'three/webgpu'

// Mock store for testing
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      app: appReducer,
      agents: agentsReducer,
      neuralInterface: neuralInterfaceReducer,
      performance: performanceReducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Test wrapper with all providers
interface AllTheProvidersProps {
  children: React.ReactNode
  initialState?: any
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ 
  children, 
  initialState = {} 
}) => {
  const store = createMockStore(initialState)
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SceneProvider>
          <PerformanceProvider>
            {children}
          </PerformanceProvider>
        </SceneProvider>
      </ThemeProvider>
    </Provider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => {
  const { initialState, ...renderOptions } = options || {}
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders initialState={initialState}>
      {children}
    </AllTheProviders>
  )
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// 3D Test wrapper for React Three Fiber components
interface ThreeTestWrapperProps {
  children: React.ReactNode
  initialState?: any
}

export const ThreeTestWrapper: React.FC<ThreeTestWrapperProps> = ({ 
  children, 
  initialState = {} 
}) => {
  const store = createMockStore(initialState)
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SceneProvider>
          <PerformanceProvider>
            <Canvas>
              {children}
            </Canvas>
          </PerformanceProvider>
        </SceneProvider>
      </ThemeProvider>
    </Provider>
  )
}

// Mock WebGL context for testing
export const mockWebGLContext = () => {
  const canvas = document.createElement('canvas')
  const context = {
    getParameter: vi.fn((param) => {
      switch (param) {
        case 0x0D33: // MAX_TEXTURE_SIZE
          return 4096
        case 0x8DFB: // MAX_VERTEX_UNIFORM_VECTORS
          return 256
        default:
          return 0
      }
    }),
    getExtension: vi.fn((name) => {
      switch (name) {
        case 'OES_texture_float':
          return {}
        case 'ANGLE_instanced_arrays':
          return {}
        case 'EXT_texture_filter_anisotropic':
          return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF }
        default:
          return null
      }
    }),
    // Add other WebGL methods as needed
    createShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
  }
  
  // Mock canvas.getContext
  vi.spyOn(canvas, 'getContext').mockImplementation((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return context
    }
    return null
  })
  
  // Mock document.createElement for canvas
  const originalCreateElement = document.createElement
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return canvas
    }
    return originalCreateElement.call(document, tagName)
  })
  
  return context
}

// Performance mock
export const mockPerformance = () => {
  const originalPerformance = window.performance
  
  window.performance = {
    ...originalPerformance,
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
      jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
    },
  }
  
  return () => {
    global.performance = originalPerformance
  }
}

// Animation frame mock
export const mockAnimationFrame = () => {
  let callbacks: FrameRequestCallback[] = []
  let id = 0
  
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback)
    return ++id
  })
  
  window.cancelAnimationFrame = vi.fn((id: number) => {
    // Simple implementation for testing
  })
  
  const triggerFrame = (timestamp = performance.now()) => {
    const currentCallbacks = [...callbacks]
    callbacks = []
    currentCallbacks.forEach(callback => callback(timestamp))
  }
  
  return { triggerFrame }
}

// Export everything
export * from '@testing-library/react'
export { customRender as render }