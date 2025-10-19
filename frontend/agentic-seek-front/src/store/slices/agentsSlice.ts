import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AgentState, ThoughtProcess } from '@/types'

interface AgentsState {
  agents: Record<string, AgentState>
  activeAgents: string[]
  thoughtProcesses: Record<string, ThoughtProcess>
  connections: Record<string, string[]>
}

const initialState: AgentsState = {
  agents: {},
  activeAgents: [],
  thoughtProcesses: {},
  connections: {},
}

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    addAgent: (state, action: PayloadAction<AgentState>) => {
      state.agents[action.payload.id] = action.payload
    },
    updateAgent: (state, action: PayloadAction<{ id: string; updates: Partial<AgentState> }>) => {
      const { id, updates } = action.payload
      if (state.agents[id]) {
        state.agents[id] = { ...state.agents[id], ...updates }
      }
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      delete state.agents[action.payload]
      state.activeAgents = state.activeAgents.filter(id => id !== action.payload)
    },
    setActiveAgents: (state, action: PayloadAction<string[]>) => {
      state.activeAgents = action.payload
    },
    addActiveAgent: (state, action: PayloadAction<string>) => {
      if (!state.activeAgents.includes(action.payload)) {
        state.activeAgents.push(action.payload)
      }
    },
    removeActiveAgent: (state, action: PayloadAction<string>) => {
      state.activeAgents = state.activeAgents.filter(id => id !== action.payload)
    },
    addThoughtProcess: (state, action: PayloadAction<ThoughtProcess>) => {
      state.thoughtProcesses[action.payload.id] = action.payload
    },
    updateThoughtProcess: (state, action: PayloadAction<{ id: string; updates: Partial<ThoughtProcess> }>) => {
      const { id, updates } = action.payload
      if (state.thoughtProcesses[id]) {
        state.thoughtProcesses[id] = { ...state.thoughtProcesses[id], ...updates }
      }
    },
    removeThoughtProcess: (state, action: PayloadAction<string>) => {
      delete state.thoughtProcesses[action.payload]
    },
    setConnections: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.connections = action.payload
    },
    addConnection: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from, to } = action.payload
      if (!state.connections[from]) {
        state.connections[from] = []
      }
      if (!state.connections[from].includes(to)) {
        state.connections[from].push(to)
      }
    },
    removeConnection: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from, to } = action.payload
      if (state.connections[from]) {
        state.connections[from] = state.connections[from].filter(id => id !== to)
      }
    },
    resetAgents: () => initialState,
  },
})

export const {
  addAgent,
  updateAgent,
  removeAgent,
  setActiveAgents,
  addActiveAgent,
  removeActiveAgent,
  addThoughtProcess,
  updateThoughtProcess,
  removeThoughtProcess,
  setConnections,
  addConnection,
  removeConnection,
  resetAgents,
} = agentsSlice.actions

export default agentsSlice.reducer