import { useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/Skeleton'
import FunnelChart from '../components/Charts/FunnelChart'
import SourcePieChart from '../components/Charts/SourcePieChart'
import TimeToHireChart from '../components/Charts/TimeToHireChart'
import {
  getPipelineFunnel,
  getTimeToHire,
  getSourceBreakdown,
  downloadApplicationsCSV,
  getDashboardStats,
} from '../services/analyticsService'
import { getJobs } from '../services/jobService'
import useToast from '../hooks/useToast'

export default function Analytics() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [funnel, setFunnel] = useState([])
  const [funnelLoading, setFunnelLoading] = useState(true)
  const [timeToHire, setTimeToHire] = useState(null)
  const [timeLoading, setTimeLoading] = useState(true)
  const [sources, setSources] = useState([])
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [topJobs, setTopJobs] = useState([])
  const [topJobsLoading, setTopJobsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await getJobs({ limit: 500, page: 1 })
        setJobs(data.jobs || [])
      } catch {
        setJobs([])
      }
    }
    loadJobs()
  }, [])

  useEffect(() => {
    const loadFunnel = async () => {
      setFunnelLoading(true)
      try {
        const { data } = await getPipelineFunnel(selectedJobId || undefined)
        setFunnel(data)
      } catch {
        setFunnel([])
      } finally {
        setFunnelLoading(false)
      }
    }
    loadFunnel()
  }, [selectedJobId])

  useEffect(() => {
    const loadAll = async () => {
      setTimeLoading(true)
      setSourcesLoading(true)
      setTopJobsLoading(true)

      try {
        const [timeRes, sourcesRes, statsRes] = await Promise.all([
          getTimeToHire(),
          getSourceBreakdown(),
          getDashboardStats(),
        ])
        setTimeToHire(timeRes.data)
        setSources(sourcesRes.data)
        setTopJobs(statsRes.data.topJobs || [])
      } catch {
        setTimeToHire(null)
        setSources([])
        setTopJobs([])
      } finally {
        setTimeLoading(false)
        setSourcesLoading(false)
        setTopJobsLoading(false)
      }
    }

    loadAll()
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      await downloadApplicationsCSV()
      showToast('Applications exported to CSV', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline Funnel
          </h2>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="mb-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.department}
              </option>
            ))}
          </select>
          {funnelLoading ? (
            <SkeletonCard className="h-[300px]" />
          ) : (
            <FunnelChart data={funnel} />
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Time to Hire
          </h2>
          {timeLoading ? (
            <>
              <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mb-4" />
              <SkeletonCard className="h-[280px]" />
            </>
          ) : timeToHire?.totalHired === 0 ? (
            <EmptyState
              icon="⏱️"
              title="No hires recorded yet"
              message="Time-to-hire metrics will appear once candidates are hired."
            />
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-4">
                Average time to hire:{' '}
                <span className="font-semibold text-gray-900">
                  {timeToHire?.averageDays ?? 0} days
                </span>{' '}
                across{' '}
                <span className="font-semibold text-gray-900">
                  {timeToHire?.totalHired ?? 0}
                </span>{' '}
                hire{timeToHire?.totalHired === 1 ? '' : 's'}
              </p>
              <TimeToHireChart data={timeToHire?.byJob || []} />
            </>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Application Sources
          </h2>
          {sourcesLoading ? (
            <SkeletonCard className="h-[300px]" />
          ) : (
            <SourcePieChart data={sources} />
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Jobs by Applications
          </h2>
          {topJobsLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          ) : topJobs.length === 0 ? (
            <p className="text-sm text-gray-500">No job data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-3 font-medium">Job Title</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium text-right">
                      Application Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topJobs.map((job, index) => (
                    <tr
                      key={`${job.jobTitle}-${index}`}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        {job.jobTitle}
                      </td>
                      <td className="py-3 text-gray-600">{job.department}</td>
                      <td className="py-3 text-right text-gray-900 font-semibold">
                        {job.applicationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </div>
  )
}
