export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
      aria-hidden
    />
  )
}

export function SkeletonCard({ className = 'h-24', children }) {
  return (
    <div
      className={`bg-gray-200 rounded-xl animate-pulse ${className}`}
      aria-hidden
    >
      {children}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
}
