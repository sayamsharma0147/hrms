import { createContext, useContext } from 'react'

export const LayoutContext = createContext({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  closeSidebar: () => {},
})

export function useLayout() {
  return useContext(LayoutContext)
}
