import { Link, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const canManageHR = (role) => role === 'Admin' || role === 'HR Manager'

export default function AppNav() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          {canManageHR(user?.role) && (
            <>
              <Link to="/analytics" className={linkClass('/analytics')}>
                Analytics
              </Link>
              <Link to="/jobs" className={linkClass('/jobs')}>
                Jobs
              </Link>
              <Link to="/pipeline" className={linkClass('/pipeline')}>
                Pipeline
              </Link>
            </>
          )}
          {user?.role === 'Interviewer' && (
            <Link to="/my-interviews" className={linkClass('/my-interviews')}>
              My Interviews
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
