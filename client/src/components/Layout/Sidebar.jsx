import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getInitials } from '../../utils/pipelineUtils'
import { useLayout } from './LayoutContext'

const roleBadgeStyles = {
  Admin: 'bg-purple-500/20 text-purple-200',
  'HR Manager': 'bg-blue-500/20 text-blue-200',
  Interviewer: 'bg-green-500/20 text-green-200',
}

const canManageHR = (role) => role === 'Admin' || role === 'HR Manager'

function NavItem({ to, icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <span className="text-lg w-6 text-center" aria-hidden>
        {icon}
      </span>
      {label}
    </NavLink>
  )
}

function NavGroup({ title, children }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>
      <nav className="space-y-1">{children}</nav>
    </div>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { sidebarOpen, closeSidebar } = useLayout()

  const handleNav = () => closeSidebar()

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              💼
            </span>
            <span className="text-lg font-bold tracking-tight">HR ATS</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroup title="Main">
            <NavItem to="/dashboard" icon="📊" label="Dashboard" end onClick={handleNav} />
            {canManageHR(user?.role) && (
              <NavItem to="/analytics" icon="📈" label="Analytics" onClick={handleNav} />
            )}
          </NavGroup>

          {canManageHR(user?.role) && (
            <NavGroup title="Recruitment">
              <NavItem to="/jobs" icon="📋" label="Jobs" onClick={handleNav} />
              <NavItem to="/pipeline" icon="🔄" label="Pipeline" onClick={handleNav} />
            </NavGroup>
          )}

          {user?.role === 'Interviewer' && (
            <NavGroup title="Interviews">
              <NavItem
                to="/my-interviews"
                icon="🎤"
                label="My Interviews"
                onClick={handleNav}
              />
            </NavGroup>
          )}

          <NavGroup title="Public">
            <NavItem to="/careers" icon="🌐" label="Job Board" onClick={handleNav} />
          </NavGroup>
        </div>

        <div className="border-t border-gray-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${
                  roleBadgeStyles[user?.role] || 'bg-gray-700 text-gray-300'
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              closeSidebar()
              logout()
            }}
            className="w-full py-2 px-3 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
