import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createJob, getJobById, updateJob } from '../../services/jobService'
import useToast from '../../hooks/useToast'
import { SkeletonCard } from '../../components/Skeleton'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const STATUSES = ['Draft', 'Open', 'Closed']

const emptyForm = {
  title: '',
  department: '',
  location: '',
  type: 'Full-time',
  status: 'Draft',
  description: '',
  requirements: [],
}

export default function JobForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [requirementInput, setRequirementInput] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const { showToast } = useToast()

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  useEffect(() => {
    if (!isEdit) return

    const loadJob = async () => {
      try {
        const { data } = await getJobById(id)
        setForm({
          title: data.title,
          department: data.department,
          location: data.location,
          type: data.type,
          status: data.status,
          description: data.description,
          requirements: data.requirements || [],
        })
      } catch {
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id, isEdit, navigate])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const addRequirement = () => {
    const trimmed = requirementInput.trim()
    if (!trimmed || form.requirements.includes(trimmed)) return
    setForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, trimmed],
    }))
    setRequirementInput('')
  }

  const removeRequirement = (index) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.department.trim()) next.department = 'Department is required'
    if (!form.location.trim()) next.location = 'Location is required'
    if (!form.type) next.type = 'Type is required'
    if (!form.status) next.status = 'Status is required'
    if (!form.description.trim()) next.description = 'Description is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateJob(id, form)
      } else {
        await createJob(form)
      }
      showToast(
        isEdit ? 'Job updated successfully' : 'Job created successfully',
        'success'
      )
      setTimeout(() => navigate('/jobs'), 800)
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Failed to save job',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <SkeletonCard className="h-96" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Job' : 'Create Job'}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
        >
          {errors.submit && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.submit}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass('title')}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                className={inputClass('department')}
              />
              {errors.department && (
                <p className="text-red-600 text-sm mt-1">{errors.department}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                className={inputClass('location')}
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className={`${inputClass('type')} bg-white`}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={inputClass('description')}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addRequirement()
                  }
                }}
                placeholder="Add a requirement and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requirements.map((req, index) => (
                <span
                  key={req}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-indigo-500 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
            </button>
            <Link
              to="/jobs"
              className="py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
          </div>
      </form>
    </div>
  )
}

