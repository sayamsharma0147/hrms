import { useContext, useEffect } from 'react'
import { ToastContext, ToastProvider as ContextProvider } from '../context/ToastContext'
import { setToastHandler } from '../utils/toastBridge'

const borderColors = {
  success: 'border-green-500',
  error: 'border-red-500',
  info: 'border-blue-500',
  warning: 'border-yellow-500',
}

function ToastList() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 bg-white rounded-lg shadow-lg border-l-4 ${
            borderColors[toast.type] || borderColors.info
          } pl-4 pr-3 py-3 toast-slide-in`}
          role="alert"
        >
          <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function ToastBridge() {
  const { showToast } = useContext(ToastContext)
  useEffect(() => {
    setToastHandler(showToast)
    return () => setToastHandler(null)
  }, [showToast])
  return null
}

export function ToastProvider({ children }) {
  return (
    <ContextProvider>
      <ToastBridge />
      <ToastList />
      {children}
    </ContextProvider>
  )
}
