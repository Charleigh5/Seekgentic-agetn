import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { QueryRequest, QueryResponse, HealthResponse, ResponseData } from '@/types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
  }),
  tagTypes: ['Health', 'Answer', 'Screenshot'],
  endpoints: (builder) => ({
    sendQuery: builder.mutation<QueryResponse, QueryRequest>({
      query: (queryData) => ({
        url: '/query',
        method: 'POST',
        body: queryData,
      }),
      invalidatesTags: ['Answer'],
    }),
    getLatestAnswer: builder.query<ResponseData, void>({
      query: () => '/latest_answer',
      providesTags: ['Answer'],
    }),
    getHealth: builder.query<HealthResponse, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),
    stopProcessing: builder.mutation<void, void>({
      query: () => ({
        url: '/stop',
        method: 'GET',
      }),
    }),
    getScreenshot: builder.query<Blob, { timestamp?: number }>({
      query: ({ timestamp }) => ({
        url: `/screenshots/updated_screen.png${timestamp ? `?timestamp=${timestamp}` : ''}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: ['Screenshot'],
    }),
  }),
})

export const {
  useSendQueryMutation,
  useGetLatestAnswerQuery,
  useGetHealthQuery,
  useStopProcessingMutation,
  useGetScreenshotQuery,
} = apiSlice