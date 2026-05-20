import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutContext } from './LayoutContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <LayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, closeSidebar }}
    >
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="md:ml-[240px] flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}
