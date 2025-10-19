import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { 
  setCurrentFPS, 
  setMemoryUsage, 
  setRenderTime, 
  setDeviceCapabilities,
  optimizeForDevice 
} from '@/store/slices/performanceSlice'

interface PerformanceContextType {
  startMonitoring: () => void
  stopMonitoring: () => void
  recordFrameTime: (time: number) => void
  checkDeviceCapabilities: () => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const { settings, currentFPS } = useSelector((state: RootState) => state.performance)
  
  const monitoringRef = useRef<boolean>(false)
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startMonitoring = () => {
    if (monitoringRef.current) return
    
    monitoringRef.current = true
    frameTimesRef.current = []
    
    // Start FPS monitoring
    fpsIntervalRef.current = setInterval(() => {
      if (frameTimesRef.current.length > 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        const fps = Math.round(1000 / avgFrameTime)
        
        dispatch(setCurrentFPS(fps))
        dispatch(setRenderTime(avgFrameTime))
        
        // Auto-optimize if performance is poor
        if (settings.adaptiveQuality && fps < settings.targetFPS * 0.8) {
          dispatch(optimizeForDevice())
        }
        
        frameTimesRef.current = []
      }
      
      // Monitor memory usage
      if ('memory' in performance) {
        const memInfo = (performance as any).memory
        dispatch(setMemoryUsage(memInfo.usedJSHeapSize / 1024 / 1024)) // MB
      }
    }, 1000)
    
    console.log('Performance monitoring started')
  }

  const stopMonitoring = () => {
    monitoringRef.current = false
    
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current)
      fpsIntervalRef.current = null
    }
    
    console.log('Performance monitoring stopped')
  }

  const recordFrameTime = (time: number) => {
    if (!monitoringRef.current) return
    
    if (lastFrameTimeRef.current > 0) {
      const frameTime = time - lastFrameTimeRef.current
      frameTimesRef.current.push(frameTime)
      
      // Keep only last 60 frame times
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }
    }
    
    lastFrameTimeRef.current = time
  }

  const checkDeviceCapabilities = () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (gl) {
      const capabilities = {
        webgl2: !!canvas.getContext('webgl2'),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        supportsFloatTextures: !!gl.getExtension('OES_texture_float'),
      }
      
      dispatch(setDeviceCapabilities(capabilities))
      console.log('Device capabilities detected:', capabilities)
    }
  }

  useEffect(() => {
    checkDeviceCapabilities()
    
    return () => {
      stopMonitoring()
    }
  }, [])

  return (
    <PerformanceContext.Provider
      value={{
        startMonitoring,
        stopMonitoring,
        recordFrameTime,
        checkDeviceCapabilities,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider')
  }
  return context
}