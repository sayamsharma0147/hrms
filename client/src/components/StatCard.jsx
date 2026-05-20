export default function StatCard({ label, value, icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {trend && (
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
            {trend.text}
          </p>
        )}
      </div>
      <span className="text-3xl opacity-80" aria-hidden>
        {icon}
      </span>
    </div>
  )
}
