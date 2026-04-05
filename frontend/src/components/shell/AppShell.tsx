/**
 * AppShell Component
 * Main layout wrapper with DynamicSidebar (navigation + filters), TopBar, and page content
 */
import { Outlet } from 'react-router-dom'
import DynamicSidebar from './DynamicSidebar'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Dynamic Sidebar - Navigation + page-specific filters */}
      <DynamicSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* TopBar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}