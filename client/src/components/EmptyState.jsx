export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-xl border border-gray-200">
      {icon && <span className="text-5xl mb-4" aria-hidden>{icon}</span>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-sm text-gray-500 max-w-md mb-4">{message}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
