import { createContext, useCallback, useMemo, useState } from 'react'

export const ToastContext = createContext(null)

const TOAST_DURATION = 3500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), TOAST_DURATION)
    },
    [removeToast]
  )

  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [toasts, showToast, removeToast]
  )

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}
