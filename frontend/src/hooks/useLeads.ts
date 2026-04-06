/**
 * useLeads Hook
 * Manages lead list state, pagination, filters, and auto-refetch on filter changes
 */
import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchLeads,
  selectAllLeads,
  selectLeadsLoading,
  selectLeadsError,
  selectPagination,
} from '@/store'
import {
  selectFilteredLeads,
  selectPagedLeads,
  selectTotalFilteredCount,
} from '@/store/selectors/leads.selectors'
import type { LeadStatus } from '@/types/Leads.types'

interface UseLeadsOptions {
  autoFetch?: boolean
}

export function useLeads(options: UseLeadsOptions = {}) {
  const { autoFetch = true } = options

  const dispatch = useAppDispatch()

  // Selectors
  const allLeads = useAppSelector(selectAllLeads)
  const loading = useAppSelector(selectLeadsLoading)
  const error = useAppSelector(selectLeadsError)
  const pagination = useAppSelector(selectPagination)

  // Client-side filtering (already filtered by search, category, status, source, date range)
  const filteredLeads = useAppSelector(selectFilteredLeads)
  const pagedLeads = useAppSelector(selectPagedLeads)
  const totalFilteredCount = useAppSelector(selectTotalFilteredCount)

  // Watch filters for changes
  const filters = useAppSelector((state) => state.filters)

  // Refetch leads
  const refetch = useCallback(
    async (params?: { page?: number; limit?: number; status?: LeadStatus; search?: string }) => {
      await dispatch(
        fetchLeads({
          page: params?.page !== undefined ? params.page : 1,
          limit: params?.limit !== undefined ? params.limit : pagination.limit,
          status: params?.status,
          search: params?.search,
        })
      )
    },
    [dispatch, pagination.limit]
  )

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [filters, autoFetch, refetch])

  return {
    // Raw leads
    leads: allLeads,
    // Filtered leads (client-side by search, category, status, etc.)
    filteredLeads,
    // Paged leads (slice of filtered based on pagination)
    pagedLeads,
    // Pagination info
    pagination,
    totalFilteredCount,
    // Loading state
    loading,
    error,
    // Actions
    refetch,
  }
}
