import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiSlice } from './api/apiSlice'
import appReducer from './slices/appSlice'
import agentsReducer from './slices/agentsSlice'
import neuralInterfaceReducer from './slices/neuralInterfaceSlice'
import performanceReducer from './slices/performanceSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    agents: agentsReducer,
    neuralInterface: neuralInterfaceReducer,
    performance: performanceReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['neuralInterface.scene', 'performance.metrics'],
      },
    }).concat(apiSlice.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch