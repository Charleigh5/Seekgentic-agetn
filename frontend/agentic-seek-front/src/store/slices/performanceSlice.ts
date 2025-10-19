import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PerformanceSettings, AccessibilityOptions } from '@/types'

interface PerformanceState {
  settings: PerformanceSettings
  accessibility: AccessibilityOptions
  currentFPS: number
  memoryUsage: number
  renderTime: number
  isOptimizing: boolean
  deviceCapabilities: {
    webgl2: boolean
    maxTextureSize: number
    maxVertexUniforms: number
    supportsFloatTextures: boolean
  }
}

const initialState: PerformanceState = {
  settings: {
    targetFPS: 60,
    enableShadows: true,
    enablePostProcessing: true,
    renderQuality: 'high',
    adaptiveQuality: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    colorBlindFriendly: false,
  },
  currentFPS: 60,
  memoryUsage: 0,
  renderTime: 0,
  isOptimizing: false,
  deviceCapabilities: {
    webgl2: false,
    maxTextureSize: 0,
    maxVertexUniforms: 0,
    supportsFloatTextures: false,
  },
}

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    updatePerformanceSettings: (state, action: PayloadAction<Partial<PerformanceSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    updateAccessibilityOptions: (state, action: PayloadAction<Partial<AccessibilityOptions>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload }
    },
    setCurrentFPS: (state, action: PayloadAction<number>) => {
      state.currentFPS = action.payload
    },
    setMemoryUsage: (state, action: PayloadAction<number>) => {
      state.memoryUsage = action.payload
    },
    setRenderTime: (state, action: PayloadAction<number>) => {
      state.renderTime = action.payload
    },
    setIsOptimizing: (state, action: PayloadAction<boolean>) => {
      state.isOptimizing = action.payload
    },
    setDeviceCapabilities: (state, action: PayloadAction<Partial<PerformanceState['deviceCapabilities']>>) => {
      state.deviceCapabilities = { ...state.deviceCapabilities, ...action.payload }
    },
    optimizeForDevice: (state) => {
      // Auto-adjust settings based on current performance
      if (state.currentFPS < 30) {
        state.settings.renderQuality = 'low'
        state.settings.enableShadows = false
        state.settings.enablePostProcessing = false
      } else if (state.currentFPS < 45) {
        state.settings.renderQuality = 'medium'
        state.settings.enableShadows = false
      }
    },
    resetPerformance: () => initialState,
  },
})

export const {
  updatePerformanceSettings,
  updateAccessibilityOptions,
  setCurrentFPS,
  setMemoryUsage,
  setRenderTime,
  setIsOptimizing,
  setDeviceCapabilities,
  optimizeForDevice,
  resetPerformance,
} = performanceSlice.actions

export default performanceSlice.reducer