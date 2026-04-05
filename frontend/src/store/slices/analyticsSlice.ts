import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AnalyticsPayload } from '@/types/Analytics.types'
import { getAnalytics } from '@/api/services/analytics.service'
import { runSparsity } from '@/api/services/research.service'

export interface AnalyticsState {
  chartData: AnalyticsPayload | null
  sparsityLoading: boolean
  sparsityProgress: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AnalyticsState = {
  chartData: null,
  sparsityLoading: false,
  sparsityProgress: 0,
  status: 'idle',
  error: null,
}

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async () => {
    const response = await getAnalytics()
    return response
  }
)

export const runSparsityExperiment = createAsyncThunk(
  'analytics/runSparsityExperiment',
  async () => {
    const response = await runSparsity()
    return response
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSparsityProgress: (state, action: PayloadAction<number>) => {
      state.sparsityProgress = action.payload
    },
    clearSparsityResult: (state) => {
      state.sparsityProgress = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.chartData = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch analytics'
      })
      .addCase(runSparsityExperiment.pending, (state) => {
        state.sparsityLoading = true
        state.sparsityProgress = 0
      })
      .addCase(runSparsityExperiment.fulfilled, (state, action) => {
        state.sparsityLoading = false
        state.chartData = action.payload
        state.sparsityProgress = 100
      })
      .addCase(runSparsityExperiment.rejected, (state, action) => {
        state.sparsityLoading = false
        state.error = action.error.message || 'Failed to run sparsity experiment'
      })
  },
})

export const { setSparsityProgress, clearSparsityResult } = analyticsSlice.actions
export default analyticsSlice.reducer
