import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ThemeConfig, WorkspaceObject } from '@/types'

interface NeuralInterfaceState {
  isInitialized: boolean
  is3DEnabled: boolean
  currentTheme: ThemeConfig
  workspaceObjects: Record<string, WorkspaceObject>
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  sceneLoaded: boolean
  animationSpeed: number
  particleCount: number
  visualEffectsEnabled: boolean
}

const defaultTheme: ThemeConfig = {
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
}

const initialState: NeuralInterfaceState = {
  isInitialized: false,
  is3DEnabled: true,
  currentTheme: defaultTheme,
  workspaceObjects: {},
  cameraPosition: [0, 0, 10],
  cameraTarget: [0, 0, 0],
  sceneLoaded: false,
  animationSpeed: 1.0,
  particleCount: 1000,
  visualEffectsEnabled: true,
}

const neuralInterfaceSlice = createSlice({
  name: 'neuralInterface',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
    },
    set3DEnabled: (state, action: PayloadAction<boolean>) => {
      state.is3DEnabled = action.payload
    },
    setTheme: (state, action: PayloadAction<ThemeConfig>) => {
      state.currentTheme = action.payload
    },
    addWorkspaceObject: (state, action: PayloadAction<WorkspaceObject>) => {
      state.workspaceObjects[action.payload.id] = action.payload
    },
    updateWorkspaceObject: (state, action: PayloadAction<{ id: string; updates: Partial<WorkspaceObject> }>) => {
      const { id, updates } = action.payload
      if (state.workspaceObjects[id]) {
        state.workspaceObjects[id] = { ...state.workspaceObjects[id], ...updates }
      }
    },
    removeWorkspaceObject: (state, action: PayloadAction<string>) => {
      delete state.workspaceObjects[action.payload]
    },
    setCameraPosition: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraPosition = action.payload
    },
    setCameraTarget: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraTarget = action.payload
    },
    setSceneLoaded: (state, action: PayloadAction<boolean>) => {
      state.sceneLoaded = action.payload
    },
    setAnimationSpeed: (state, action: PayloadAction<number>) => {
      state.animationSpeed = action.payload
    },
    setParticleCount: (state, action: PayloadAction<number>) => {
      state.particleCount = action.payload
    },
    setVisualEffectsEnabled: (state, action: PayloadAction<boolean>) => {
      state.visualEffectsEnabled = action.payload
    },
    resetNeuralInterface: () => initialState,
  },
})

export const {
  setInitialized,
  set3DEnabled,
  setTheme,
  addWorkspaceObject,
  updateWorkspaceObject,
  removeWorkspaceObject,
  setCameraPosition,
  setCameraTarget,
  setSceneLoaded,
  setAnimationSpeed,
  setParticleCount,
  setVisualEffectsEnabled,
  resetNeuralInterface,
} = neuralInterfaceSlice.actions

export default neuralInterfaceSlice.reducer