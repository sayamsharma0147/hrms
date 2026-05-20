import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJobById } from '../../services/jobService'
import { submitApplication } from '../../services/applicationService'
import ResumeUpload from '../../components/ResumeUpload'
import { SkeletonCard } from '../../components/Skeleton'
import { isValidEmail, isValidPhone } from '../../utils/validation'

const SOURCES = ['LinkedIn', 'Referral', 'Website', 'Job Board', 'Other']

export default function ApplyForm() {
  const { id: jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentTitle: '',
    linkedIn: '',
    source: 'Website',
    coverNote: '',
  })

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getJobById(jobId)
        setJob(data)
      } catch {
        setJob(null)
      } finally {
        setLoadingJob(false)
      }
    }
    load()
  }, [jobId])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim() && !resumeFile) {
      next.email = 'Email is required'
    } else if (form.email.trim() && !isValidEmail(form.email)) {
      next.email = 'Enter a valid email address'
    }
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      next.phone = 'Enter a valid phone number'
    }
    setFieldErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setError('')
    setUploadProgress(0)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('name', form.name.trim())
    if (form.email.trim()) formData.append('email', form.email.trim())
    if (form.phone.trim()) formData.append('phone', form.phone.trim())
    if (form.currentTitle.trim()) formData.append('currentTitle', form.currentTitle.trim())
    if (form.linkedIn.trim()) formData.append('linkedIn', form.linkedIn.trim())
    formData.append('source', form.source)
    if (form.coverNote.trim()) formData.append('coverNote', form.coverNote.trim())
    if (resumeFile) formData.append('resume', resumeFile)

    try {
      await submitApplication(formData, setUploadProgress)
      setUploadSuccess(true)
      setSuccess(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit application. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SkeletonCard className="h-64 w-full max-w-xl" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Job not found</p>
        <Link to="/careers" className="text-indigo-600 hover:underline">
          Back to careers
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ll be in touch soon. Thank you for applying.
          </p>
          <Link
            to="/careers"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Browse more jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          to={`/jobs/${jobId}`}
          className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← Back to job
        </Link>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <div className="mb-8 text-center border-b border-gray-100 pb-6">
            <p className="text-sm text-indigo-600 font-medium mb-1">HR ATS</p>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              {job.department} · {job.location}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputClass('name')}
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={inputClass('email')}
                placeholder={resumeFile ? 'Optional if resume contains email' : ''}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={inputClass('phone')}
              />
              {fieldErrors.phone && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Job Title
              </label>
              <input
                value={form.currentTitle}
                onChange={(e) => setField('currentTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedIn}
                onChange={(e) => setField('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?
              </label>
              <select
                value={form.source}
                onChange={(e) => setField('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume (PDF, DOC, DOCX — max 5MB) — Optional
              </label>
              <ResumeUpload
                file={resumeFile}
                onFileChange={setResumeFile}
                uploading={submitting}
                uploadProgress={uploadProgress}
                uploadSuccess={uploadSuccess}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Note
              </label>
              <textarea
                rows={4}
                value={form.coverNote}
                onChange={(e) => setField('coverNote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us why you're a great fit..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting
                ? resumeFile
                  ? 'Parsing resume & submitting...'
                  : 'Submitting...'
                : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
