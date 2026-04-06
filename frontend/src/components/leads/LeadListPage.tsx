/**
 * Lead List Page
 * Main page for lead management with table, filters, pagination
 * Filters are now in the unified DynamicSidebar
 */
import { useState } from 'react'
import { useAppDispatch } from '@/store'
import { useLeads } from '@/hooks'
import { selectLead } from '@/store/slices/leadsSlice'
import { Button, Card } from '@/components/ui'
import { Pagination } from '@/components/ui'
import { LeadTable } from '@/components/leads/LeadTable'
import { LeadForm } from '@/components/leads/LeadForm'
import { LeadDetail } from '@/components/leads/LeadDetail'
import type { Lead } from '@/types/Leads.types'

export function LeadListPage() {
  const dispatch = useAppDispatch()
  const { pagedLeads, filteredLeads, pagination, loading, error, refetch } = useLeads({
    autoFetch: true,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    dispatch(selectLead(lead))
    setIsDetailOpen(true)
  }

  const handlePageChange = (page: number) => {
    refetch({ page })
  }

  const handleLimitChange = (limit: number) => {
    refetch({ page: 1, limit })
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
              <p className="text-gray-600 mt-1">
                Showing {pagedLeads.length} of {filteredLeads.length} leads
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsFormOpen(true)}
              className="h-10"
            >
              + New Lead
            </Button>
          </div>

          {/* Table Section */}
          <Card>
            <div className="p-6">
              <LeadTable
                leads={pagedLeads}
                loading={loading}
                error={error}
                onViewLead={handleViewLead}
              />
            </div>
          </Card>

          {/* Pagination */}
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={filteredLeads.length}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Detail Panel (side by side) */}
      <LeadDetail lead={selectedLead} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />

      {/* Modal for new lead form */}
      <LeadForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  )
}
