import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { getJobById } from '../../services/jobService'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getJobById(id)
        setJob(data)
      } catch {
        setError('Job not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || 'Job not found'}</p>
        <Link to="/careers" className="text-indigo-600 hover:underline">
          Back to careers
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/careers"
          className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← Back
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-1">
                {job.department} · {job.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {job.type}
              </span>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </section>

          {job.requirements?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Requirements
              </h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {job.requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          <Link
            to={`/careers/${id}/apply`}
            className="inline-flex px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  )
}


