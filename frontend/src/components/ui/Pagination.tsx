/**
 * Pagination Component
 * Navigation for paginated lists
 */
import { Button } from './Button'
import { PAGE_SIZE_OPTIONS } from '@/constants'

export interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({ page, limit, total, onPageChange, onLimitChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  const isFirstPage = page === 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
        <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value))
            onPageChange(1) // Reset to page 1
          }}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirstPage}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2 px-3">
            <span className="text-sm">
              Page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages || 1}</span>
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
