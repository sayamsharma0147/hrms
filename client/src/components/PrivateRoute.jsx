import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { SkeletonCard } from './Skeleton'

export default function PrivateRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-4 max-w-4xl mx-auto">
        <SkeletonCard className="h-10 w-48" />
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-32" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
