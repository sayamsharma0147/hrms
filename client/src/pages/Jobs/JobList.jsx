import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SkeletonTable } from '../../components/Skeleton'
import {
  getJobs,
  deleteJob,
  changeJobStatus,
} from '../../services/jobService'

const STATUS_OPTIONS = ['', 'Draft', 'Open', 'Closed']
const NEXT_STATUS = {
  Draft: 'Open',
  Open: 'Closed',
}

export default function JobList() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'Admin'

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [departments, setDepartments] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getJobs({
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
        page,
        limit: 10,
      })
      setJobs(data.jobs)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)

      const depts = [...new Set(data.jobs.map((j) => j.department))].sort()
      setDepartments((prev) => {
        const merged = new Set([...prev, ...depts])
        return [...merged].sort()
      })
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, department, status, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteJob(deleteTarget)
      showToast('Job deleted successfully', 'success')
      setDeleteTarget(null)
      fetchJobs()
    } catch {
      setDeleteTarget(null)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return
    try {
      await changeJobStatus(id, newStatus)
      showToast(`Job status updated to ${newStatus}`, 'success')
      fetchJobs()
    } catch {
      /* error toast via interceptor */
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
        <Link
          to="/jobs/new"
          className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || 'all'} value={s}>
                {s || 'All Statuses'}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No jobs found"
            message="Post your first job!"
            action={{
              label: 'Post a Job',
              onClick: () => navigate('/jobs/new'),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                      {job.department}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                      {job.location}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-600">
                      {job.type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/jobs/${job._id}/edit`}
                          className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(job._id)}
                            className="text-sm px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                        {NEXT_STATUS[job.status] && (
                          <select
                            value=""
                            onChange={(e) =>
                              handleStatusChange(job._id, e.target.value)
                            }
                            className="hidden sm:inline text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                          >
                            <option value="">Change status</option>
                            <option value={NEXT_STATUS[job.status]}>
                              → {NEXT_STATUS[job.status]}
                            </option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {jobs.length} of {total} jobs
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
