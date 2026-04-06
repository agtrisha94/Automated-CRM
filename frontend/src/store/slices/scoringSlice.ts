import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ScoringMode, CompareResult } from '@/types/Scoring.types'
import { compareScores } from '@/api/services/scoring.service'

export interface LatencyRecord {
  leadId: string
  ruleMs: number
  mlMs: number
  rfMs: number
  timestamp: string
}

export interface ScoringState {
  activeMode: ScoringMode
  compareResult: CompareResult | null
  latencyHistory: LatencyRecord[]
  isComparing: boolean
  error: string | null
}

const initialState: ScoringState = {
  activeMode: 'RULE',
  compareResult: null,
  latencyHistory: [],
  isComparing: false,
  error: null,
}

// Async thunks
export const runScoreCompare = createAsyncThunk(
  'scoring/runScoreCompare',
  async (leadId: string) => {
    const response = await compareScores(leadId)
    return response
  }
)

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    setActiveMode: (state, action: PayloadAction<ScoringMode>) => {
      state.activeMode = action.payload
    },
    clearCompareResult: (state) => {
      state.compareResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runScoreCompare.pending, (state) => {
        state.isComparing = true
        state.error = null
      })
      .addCase(runScoreCompare.fulfilled, (state, action) => {
        state.isComparing = false
        state.compareResult = action.payload
        state.latencyHistory.push({
          leadId: action.payload.leadId,
          ruleMs: action.payload.ruleLatencyMs,
          mlMs: action.payload.mlLatencyMs,
          rfMs: action.payload.rfLatencyMs,
          timestamp: new Date().toISOString(),
        })
        // Keep last 50 records
        if (state.latencyHistory.length > 50) {
          state.latencyHistory = state.latencyHistory.slice(-50)
        }
      })
      .addCase(runScoreCompare.rejected, (state, action) => {
        state.isComparing = false
        state.error = action.error.message || 'Failed to compare scores'
      })
  },
})

export const { setActiveMode, clearCompareResult } = scoringSlice.actions
export default scoringSlice.reducer
