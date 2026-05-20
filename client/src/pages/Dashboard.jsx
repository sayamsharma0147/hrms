import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import StatCard from '../components/StatCard'
import FunnelChart from '../components/Charts/FunnelChart'
import SourcePieChart from '../components/Charts/SourcePieChart'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/Skeleton'
import {
  getDashboardStats,
  getSourceBreakdown,
} from '../services/analyticsService'
import { getInterviewsThisWeek } from '../services/interviewService'

const canManageJobs = (role) =>
  role === 'Admin' || role === 'HR Manager'

const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setDate(now.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weeklyInterviewCount, setWeeklyInterviewCount] = useState(null)
  const [sourceData, setSourceData] = useState([])

  const isHR = canManageJobs(user?.role)

  useEffect(() => {
    if (!isHR) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const [statsRes, sourcesRes] = await Promise.all([
          getDashboardStats(),
          getSourceBreakdown(),
        ])
        setStats(statsRes.data)
        setSourceData(sourcesRes.data)
      } catch {
        setStats(null)
        setSourceData([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isHR])

  useEffect(() => {
    if (!isHR) return

    const loadWeekly = async () => {
      const { start, end } = getWeekRange()
      try {
        const { data } = await getInterviewsThisWeek(
          start.toISOString(),
          end.toISOString()
        )
        setWeeklyInterviewCount(data.length)
      } catch {
        setWeeklyInterviewCount(0)
      }
    }

    loadWeekly()
  }, [isHR])

  if (!isHR) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 text-center space-y-4 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Use the sidebar to view your scheduled interviews.
          </p>
          <Link
            to="/my-interviews"
            className="block w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            My Interviews
          </Link>
        </div>
      </div>
    )
  }

  const funnelData = stats?.applicationsByStage || []

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/jobs/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Post a Job
          </Link>
          <Link
            to="/jobs"
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50"
          >
            View Jobs
          </Link>
          <Link
            to="/pipeline"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            View Pipeline
          </Link>
        </div>
      </div>

      {weeklyInterviewCount !== null && (
        <p className="text-sm text-gray-600 bg-indigo-50 border border-indigo-100 rounded-lg py-2 px-4 inline-block">
          <span className="font-semibold text-indigo-700">
            {weeklyInterviewCount}
          </span>{' '}
          interview{weeklyInterviewCount === 1 ? '' : 's'} scheduled this week
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Open Jobs" value={stats?.openJobs} icon="📋" />
            <StatCard
              label="Total Applicants"
              value={stats?.totalApplications}
              icon="👥"
            />
            <StatCard label="New This Week" value={stats?.newThisWeek} icon="🆕" />
            <StatCard
              label="Hired This Month"
              value={stats?.hiredThisMonth}
              icon="✅"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline Overview
          </h2>
          {loading ? (
            <SkeletonCard className="h-[300px]" />
          ) : (
            <FunnelChart data={funnelData} />
          )}
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Application Sources
          </h2>
          {loading ? (
            <SkeletonCard className="h-[300px]" />
          ) : (
            <SourcePieChart data={sourceData} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Applications
        </h2>
        {loading ? (
          <SkeletonCard className="h-48" />
        ) : stats?.recentApplications?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Candidate</th>
                  <th className="pb-3 font-medium">Job</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app) => (
                  <tr
                    key={app._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <Link
                        to={`/applications/${app._id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {app.candidateName}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-700">{app.jobTitle}</td>
                    <td className="py-3">
                      <StatusBadge status={app.stage} />
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="📨"
            title="No applications yet"
            message="Applications will appear here as candidates apply."
          />
        )}
      </div>
    </div>
  )
}
