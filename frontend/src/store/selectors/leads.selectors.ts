import type { RootState } from '../store'
import type { Lead } from '@/types/Leads.types'

// Simple selectors
export const selectAllLeads = (state: RootState) => state.leads.leads
export const selectSelectedLead = (state: RootState) => state.leads.selectedLead
export const selectLeadsLoading = (state: RootState) => state.leads.status === 'loading'
export const selectLeadsError = (state: RootState) => state.leads.error
export const selectPagination = (state: RootState) => state.leads.pagination

// Filtered leads selector (applies search client-side)
// NOTE: This is used only for display purposes and counts, not for pagination
// Pagination is handled server-side
export const selectFilteredLeads = (state: RootState): Lead[] => {
  // Since pagination is server-side, we just return the leads from the current page
  // Client-side filtering would break server-side pagination
  return state.leads.leads
}

// Pagination helpers
// Note: The API already returns paginated results, so we just return the leads as-is
// Client-side filtering (search, status, etc.) is applied but NOT paginated here
// because pagination is handled server-side
export const selectPagedLeads = (state: RootState) => {
  // Return the leads directly from the API (already paginated)
  return state.leads.leads
}

export const selectTotalFilteredCount = (state: RootState) => {
  return selectFilteredLeads(state).length
}
