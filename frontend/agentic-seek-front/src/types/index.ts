import { Vector3, Euler } from 'three'

// Core application types
export interface Message {
  type: 'user' | 'agent' | 'error'
  content: string
  reasoning?: string
  agentName?: string
  status?: string
  uid?: string
}

export interface Block {
  tool_type: string
  block: string
  feedback: string
  success: boolean
}

export interface ResponseData {
  blocks?: Record<string, Block>
  done?: boolean
  answer?: string
  agent_name?: string
  status?: string
  uid?: string
  screenshot?: string
  screenshotTimestamp?: number
}

// 3D and Neural Interface types
export interface AgentState {
  id: string
  name: string
  type: AgentType
  status: 'idle' | 'processing' | 'error' | 'offline'
  capabilities: Capability[]
  currentTask?: Task
  performance: PerformanceMetrics
  visualConfig: AgentVisualConfig
}

export type AgentType = 'casual' | 'coder' | 'file' | 'browser' | 'planner'

export interface Capability {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface Task {
  id: string
  description: string
  progress: number
  startTime: Date
}

export interface PerformanceMetrics {
  responseTime: number
  successRate: number
  memoryUsage: number
  cpuUsage: number
}

export interface AgentVisualConfig {
  color: string
  geometry: 'sphere' | 'cube' | 'octahedron' | 'tetrahedron'
  position: Vector3
  scale: number
  animation: AnimationConfig
}

export interface AnimationConfig {
  idle: string
  processing: string
  error: string
  transition: string
}

// Thought Stream types
export interface ThoughtProcess {
  id: string
  agentId: string
  reasoning: ReasoningStep[]
  confidence: number
  timestamp: Date
  visualPath: Vector3[]
  connections: Connection[]
}

export interface ReasoningStep {
  id: string
  content: string
  confidence: number
  timestamp: Date
  type: 'analysis' | 'decision' | 'action' | 'reflection'
}

export interface Connection {
  from: string
  to: string
  strength: number
  type: 'data' | 'reasoning' | 'feedback'
}

// Workspace types
export interface WorkspaceObject {
  id: string
  type: 'document' | 'code' | 'browser' | 'tool'
  position: Vector3
  rotation: Euler
  scale: Vector3
  content: any
  interactions: InteractionHandler[]
  visualProperties: ObjectVisualProperties
}

export interface InteractionHandler {
  type: 'click' | 'hover' | 'drag' | 'gesture'
  handler: (event: any) => void
}

export interface ObjectVisualProperties {
  material: string
  opacity: number
  wireframe: boolean
  color: string
  emissive: string
}

// Performance and Settings types
export interface PerformanceSettings {
  targetFPS: number
  enableShadows: boolean
  enablePostProcessing: boolean
  renderQuality: 'low' | 'medium' | 'high' | 'ultra'
  adaptiveQuality: boolean
}

export interface AccessibilityOptions {
  reducedMotion: boolean
  highContrast: boolean
  screenReaderMode: boolean
  keyboardNavigation: boolean
  colorBlindFriendly: boolean
}

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    accent: string
  }
  materials: {
    agent: string
    workspace: string
    ui: string
  }
}

// Event types
export interface InteractionEvent {
  type: string
  target: string
  data: any
  timestamp: Date
}

// API types
export interface QueryRequest {
  query: string
  tts_enabled: boolean
}

export interface QueryResponse {
  answer: string
  reasoning?: string
  agent_name: string
  status: string
  uid: string
  blocks?: Record<string, Block>
  done: boolean
}

export interface HealthResponse {
  status: 'online' | 'offline'
  agents: AgentState[]
  performance: PerformanceMetrics
}