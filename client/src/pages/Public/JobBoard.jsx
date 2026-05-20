import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../../services/jobService'

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [departments, setDepartments] = useState([])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getJobs({
        status: 'Open',
        search: search || undefined,
        department: department || undefined,
        limit: 50,
      })
      setJobs(data.jobs)
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
  }, [search, department])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">HR ATS Careers</h1>
          <Link
            to="/login"
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Staff Login
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Join Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore open positions and find your next opportunity with us.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No open positions at the moment. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <article
                key={job._id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {job.department} · {job.location}
                </p>
                <span className="self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
                  {job.type}
                </span>
                <Link
                  to={`/jobs/${job._id}`}
                  className="mt-auto inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  View & Apply
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


