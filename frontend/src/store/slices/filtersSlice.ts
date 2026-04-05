import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { LeadStatus, LeadSource } from '@/types/Leads.types'
import type { ScoreCategory } from '@/types/Scoring.types'

export interface FiltersState {
  scoreCategories: ScoreCategory[]
  statuses: LeadStatus[]
  sources: LeadSource[]
  dateRange: { from: string | null; to: string | null }
  searchQuery: string
}

const initialState: FiltersState = {
  scoreCategories: [],
  statuses: [],
  sources: [],
  dateRange: { from: null, to: null },
  searchQuery: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    toggleScoreCategory: (state, action: PayloadAction<ScoreCategory>) => {
      const idx = state.scoreCategories.indexOf(action.payload)
      if (idx > -1) {
        state.scoreCategories.splice(idx, 1)
      } else {
        state.scoreCategories.push(action.payload)
      }
    },
    toggleStatus: (state, action: PayloadAction<LeadStatus>) => {
      const idx = state.statuses.indexOf(action.payload)
      if (idx > -1) {
        state.statuses.splice(idx, 1)
      } else {
        state.statuses.push(action.payload)
      }
    },
    toggleSource: (state, action: PayloadAction<LeadSource>) => {
      const idx = state.sources.indexOf(action.payload)
      if (idx > -1) {
        state.sources.splice(idx, 1)
      } else {
        state.sources.push(action.payload)
      }
    },
    setDateRange: (state, action: PayloadAction<{ from: string | null; to: string | null }>) => {
      state.dateRange = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    clearAllFilters: (state) => {
      state.scoreCategories = []
      state.statuses = []
      state.sources = []
      state.dateRange = { from: null, to: null }
      state.searchQuery = ''
    },
  },
})

export const {
  toggleScoreCategory,
  toggleStatus,
  toggleSource,
  setDateRange,
  setSearchQuery,
  clearAllFilters,
} = filtersSlice.actions
export default filtersSlice.reducer
