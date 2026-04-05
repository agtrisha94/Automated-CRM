/**
 * Lead Table Header
 * Column headers with sorting indicators (future: click to sort)
 */

export function LeadTableHeader() {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Email
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Company
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Score
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Source
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  )
}
