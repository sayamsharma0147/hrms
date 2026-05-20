import useAuth from '../../hooks/useAuth'
import { getInitials } from '../../utils/pipelineUtils'
import { useLayout } from './LayoutContext'

export default function Topbar() {
  const { user } = useAuth()
  const { setSidebarOpen } = useLayout()

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        aria-label="Open menu"
      >
        <span className="text-xl">☰</span>
      </button>
      <span className="text-lg font-bold text-gray-900">HR ATS</span>
      <div
        className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold"
        aria-hidden
      >
        {getInitials(user?.name)}
      </div>
    </header>
  )
}
