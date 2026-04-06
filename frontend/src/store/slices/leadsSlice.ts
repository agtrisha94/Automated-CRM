import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Lead, LeadStatus } from '@/types/Leads.types'
import { getLeads, createLead, updateLeadStatus, type CreateLeadInput } from '@/api/services/leads.service'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export interface PaginationState {
  page: number
  limit: number
  total: number
}

export interface LeadsState {
  leads: Lead[]
  selectedLead: Lead | null
  pagination: PaginationState
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 },
  status: 'idle',
  error: null,
}

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ page = 1, limit = DEFAULT_PAGE_SIZE, status, search }: { page?: number; limit?: number; status?: LeadStatus; search?: string }) => {
    const response = await getLeads(page, limit, { status, search })
    return response
  }
)

export const createNewLead = createAsyncThunk(
  'leads/createNewLead',
  async (data: CreateLeadInput) => {
    const response = await createLead(data)
    return response
  }
)

export const updateLeadStatusThunk = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status }: { id: string; status: LeadStatus }) => {
    const response = await updateLeadStatus(id, status)
    return response
  }
)

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    selectLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? 'loading' : 'idle'
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.leads = action.payload.data
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch leads'
      })
      .addCase(createNewLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(updateLeadStatusThunk.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.leads[index] = action.payload
        }
        if (state.selectedLead?.id === action.payload.id) {
          state.selectedLead = action.payload
        }
      })
  },
})

export const { selectLead, setPagination, setLoading, clearError } = leadsSlice.actions
export default leadsSlice.reducer
