import { useEffect, useState } from 'react'
import { scheduleInterview } from '../../services/interviewService'
import { getUsers } from '../../services/userService'
import useToast from '../../hooks/useToast'

const DURATIONS = [30, 45, 60, 90, 120]
const TYPES = ['Phone', 'Video', 'In-Person', 'Technical']

export default function ScheduleInterview({
  applicationId,
  jobTitle,
  candidateName,
  onClose,
  onScheduled,
}) {
  const [interviewers, setInterviewers] = useState([])
  const [form, setForm] = useState({
    interviewerId: '',
    scheduledAt: '',
    duration: 60,
    type: 'Video',
    meetingLink: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const { showToast } = useToast()

  const fieldClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  useEffect(() => {
    const loadInterviewers = async () => {
      try {
        const { data } = await getUsers('Interviewer')
        setInterviewers(data)
      } catch {
        setError('Failed to load interviewers')
      }
    }
    loadInterviewers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value,
    }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const next = {}
    if (!form.interviewerId) next.interviewerId = 'Interviewer is required'
    if (!form.scheduledAt) next.scheduledAt = 'Date and time are required'
    if (!form.type) next.type = 'Type is required'
    setFieldErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)

    try {
      await scheduleInterview({
        applicationId,
        interviewerId: form.interviewerId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: form.duration,
        type: form.type,
        meetingLink: form.type === 'Video' ? form.meetingLink : undefined,
      })
      setSuccess(true)
      showToast('Interview scheduled successfully', 'success')
      onScheduled?.()
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Interview
            </h2>
            <p className="text-sm text-gray-500">
              {candidateName} · {jobTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {success ? (
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            Interview scheduled. Invite sent to {candidateName}.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interviewer
              </label>
              <select
                name="interviewerId"
                value={form.interviewerId}
                onChange={handleChange}
                required
                className={fieldClass('interviewerId')}
              >
                <option value="">Select interviewer</option>
                {interviewers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {fieldErrors.interviewerId && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.interviewerId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date &amp; Time
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                className={fieldClass('scheduledAt')}
              />
              {fieldErrors.scheduledAt && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.scheduledAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {form.type === 'Video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link (optional)
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={form.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
