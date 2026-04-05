/**
 * NotFoundPage Component
 * 404 error page
 */
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="text-xl text-slate-600">Page not found</p>
        <p className="text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/leads"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Leads
        </Link>
      </div>
    </div>
  )
}
