import type { RootState } from '../store'
import type { Lead } from '@/types/Leads.types'

// Simple selectors
export const selectAllLeads = (state: RootState) => state.leads.leads
export const selectSelectedLead = (state: RootState) => state.leads.selectedLead
export const selectLeadsLoading = (state: RootState) => state.leads.status === 'loading'
export const selectLeadsError = (state: RootState) => state.leads.error
export const selectPagination = (state: RootState) => state.leads.pagination

// Filtered leads selector (applies search client-side)
export const selectFilteredLeads = (state: RootState): Lead[] => {
  const leads = state.leads.leads
  const { searchQuery } = state.filters
  const { scoreCategories, statuses, sources, dateRange } = state.filters

  return leads.filter((lead: Lead) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !lead.name.toLowerCase().includes(q) &&
        !lead.email.toLowerCase().includes(q) &&
        !(lead.company?.toLowerCase().includes(q))
      ) {
        return false
      }
    }

    // Score category filter
    if (scoreCategories.length > 0 && !scoreCategories.includes(lead.scoreCategory)) {
      return false
    }

    // Status filter
    if (statuses.length > 0 && !statuses.includes(lead.status)) {
      return false
    }

    // Source filter
    if (sources.length > 0 && !sources.includes(lead.source)) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const leadDate = new Date(lead.createdAt)
      if (dateRange.from && leadDate < new Date(dateRange.from)) {
        return false
      }
      if (dateRange.to && leadDate > new Date(dateRange.to)) {
        return false
      }
    }

    return true
  })
}

// Pagination helpers
export const selectPagedLeads = (state: RootState) => {
  const filtered = selectFilteredLeads(state)
  const { page, limit } = state.leads.pagination
  const start = (page - 1) * limit
  return filtered.slice(start, start + limit)
}

export const selectTotalFilteredCount = (state: RootState) => {
  return selectFilteredLeads(state).length
}
