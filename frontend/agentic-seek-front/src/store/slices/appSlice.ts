import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Message, ResponseData } from '@/types'

interface AppState {
  messages: Message[]
  query: string
  isLoading: boolean
  error: string | null
  currentView: 'blocks' | 'screenshot'
  responseData: ResponseData | null
  isOnline: boolean
  status: string
  expandedReasoning: number[]
}

const initialState: AppState = {
  messages: [],
  query: '',
  isLoading: false,
  error: null,
  currentView: 'blocks',
  responseData: null,
  isOnline: false,
  status: 'Agents ready',
  expandedReasoning: [],
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setCurrentView: (state, action: PayloadAction<'blocks' | 'screenshot'>) => {
      state.currentView = action.payload
    },
    setResponseData: (state, action: PayloadAction<ResponseData | null>) => {
      state.responseData = action.payload
    },
    updateResponseData: (state, action: PayloadAction<Partial<ResponseData>>) => {
      if (state.responseData) {
        state.responseData = { ...state.responseData, ...action.payload }
      } else {
        state.responseData = action.payload as ResponseData
      }
    },
    setIsOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload
    },
    toggleReasoning: (state, action: PayloadAction<number>) => {
      const messageIndex = action.payload
      if (state.expandedReasoning.includes(messageIndex)) {
        state.expandedReasoning = state.expandedReasoning.filter(idx => idx !== messageIndex)
      } else {
        state.expandedReasoning.push(messageIndex)
      }
    },
    clearMessages: (state) => {
      state.messages = []
    },
    resetApp: () => initialState,
  },
})

export const {
  setQuery,
  addMessage,
  setMessages,
  setIsLoading,
  setError,
  setCurrentView,
  setResponseData,
  updateResponseData,
  setIsOnline,
  setStatus,
  toggleReasoning,
  clearMessages,
  resetApp,
} = appSlice.actions

export default appSlice.reducer