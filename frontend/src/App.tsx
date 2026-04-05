import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LeadListPage from '@/pages/LeadListPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ModelComparisonPage from '@/pages/ModelComparisionPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AppShell from '@/components/shell/AppShell'
import { ErrorBoundary, ToastContainer } from '@/components/ui'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/leads" replace />,
      },
      {
        path: 'leads',
        element: <LeadListPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'models',
        element: <ModelComparisonPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
    </ErrorBoundary>
  )
}