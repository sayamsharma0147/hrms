import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getApplicationById,
  updateStage,
  addNote,
  deleteApplication,
} from '../../services/applicationService'
import {
  getInterviewsByApplication,
  updateInterview,
} from '../../services/interviewService'
import useToast from '../../hooks/useToast'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SkeletonCard } from '../../components/Skeleton'
import ResumeViewer from '../../components/ResumeViewer'
import ScheduleInterview from '../Interviews/ScheduleInterview'
import useAuth from '../../hooks/useAuth'
import {
  PIPELINE_STAGES,
  formatRelativeTime,
  getInitials,
} from '../../utils/pipelineUtils'

const SKILL_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800',
  'bg-cyan-100 text-cyan-800',
]

const STATUS_STYLES = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  'No-Show': 'bg-red-100 text-red-800',
}

const RECOMMENDATION_STYLES = {
  'Strong Yes': 'bg-green-100 text-green-800',
  Yes: 'bg-blue-100 text-blue-800',
  Maybe: 'bg-yellow-100 text-yellow-800',
  No: 'bg-red-100 text-red-800',
}

const canScheduleInterview = (role) =>
  role === 'Admin' || role === 'HR Manager'

export default function ApplicationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [application, setApplication] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [rejectConfirm, setRejectConfirm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [cancelInterview, setCancelInterview] = useState(null)
  const { showToast } = useToast()
  const isAdmin = user?.role === 'Admin'

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id)
      setApplication(data)
    } catch {
      setApplication(null)
    } finally {
      setLoading(false)
    }
  }

  const loadInterviews = async () => {
    try {
      const { data } = await getInterviewsByApplication(id)
      setInterviews(data)
    } catch {
      setInterviews([])
    }
  }

  useEffect(() => {
    loadApplication()
    loadInterviews()
  }, [id])

  const candidate = application?.candidate
  const job = application?.job

  const applyStageChange = async (newStage) => {
    setUpdatingStage(true)
    try {
      const { data } = await updateStage(id, newStage, `Stage changed to ${newStage}`)
      setApplication(data)
      showToast(`Stage updated to ${newStage}`, 'success')
    } catch {
      /* handled by interceptor */
    } finally {
      setUpdatingStage(false)
    }
  }

  const handleStageChange = async (e) => {
    const newStage = e.target.value
    if (!newStage || newStage === application.stage) return

    if (newStage === 'Rejected') {
      setRejectConfirm(newStage)
      return
    }

    await applyStageChange(newStage)
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setAddingNote(true)
    try {
      await addNote(id, noteText.trim())
      setNoteText('')
      showToast('Note added', 'success')
      await loadApplication()
    } catch {
      /* handled by interceptor */
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <SkeletonCard className="h-8 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <SkeletonCard className="lg:col-span-2 h-80" />
          <SkeletonCard className="lg:col-span-3 h-80" />
        </div>
      </div>
    )
  }

  if (!application || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-gray-600">Application not found</p>
        <Link to="/pipeline" className="text-indigo-600 hover:underline">
          Back to pipeline
        </Link>
      </div>
    )
  }

  const history = [...(application.stageHistory || [])].reverse()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/pipeline"
          className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← Back to pipeline
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-3">
                {getInitials(candidate.name)}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-sm text-gray-500">{job?.title}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-indigo-600 hover:underline"
                >
                  {candidate.email}
                </a>
              </p>
              {candidate.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span> {candidate.phone}
                </p>
              )}
              {candidate.currentTitle && (
                <p>
                  <span className="text-gray-500">Title:</span>{' '}
                  {candidate.currentTitle}
                </p>
              )}
              {candidate.linkedIn && (
                <p>
                  <span className="text-gray-500">LinkedIn:</span>{' '}
                  <a
                    href={candidate.linkedIn}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    Profile
                  </a>
                </p>
              )}
            </div>

            {candidate.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        SKILL_COLORS[index % SKILL_COLORS.length]
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {candidate.parsedFromResume && (
                  <p className="text-xs text-indigo-600 mt-2 font-medium">
                    ✦ Info auto-filled from resume
                  </p>
                )}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resume</h3>
              <ResumeViewer
                resumeUrl={candidate.resumeUrl}
                fileName={`${candidate.name} - Resume`}
              />
            </div>

            {application.coverNote && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Cover note
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {application.coverNote}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current stage
                </label>
                <select
                  value={application.stage}
                  onChange={handleStageChange}
                  disabled={updatingStage}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {canScheduleInterview(user?.role) && (
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Schedule Interview
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stage history
              </h2>
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {history.map((entry, index) => (
                  <div key={`${entry.stage}-${entry.changedAt}-${index}`} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                    <p className="font-medium text-gray-900">{entry.stage}</p>
                    <p className="text-xs text-gray-500">
                      {entry.changedBy?.name || 'System'} ·{' '}
                      {formatRelativeTime(entry.changedAt)}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Interviews
              </h2>
              {interviews.length === 0 ? (
                <p className="text-sm text-gray-500">No interviews scheduled</p>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div
                      key={interview._id}
                      className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-medium text-gray-900 w-24">
                        {interview.type}
                      </span>
                      <span className="text-sm text-gray-600 flex-1 min-w-[120px]">
                        {interview.interviewer?.name || '—'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          STATUS_STYLES[interview.status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {interview.status}
                      </span>
                      {interview.status === 'Completed' &&
                        interview.feedback?.submittedAt && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-amber-400 text-sm">
                              {'★'.repeat(interview.feedback.rating)}
                              {'☆'.repeat(5 - interview.feedback.rating)}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                RECOMMENDATION_STYLES[
                                  interview.feedback.recommendation
                                ] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {interview.feedback.recommendation}
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="space-y-3 mb-4">
                {candidate.notes?.length > 0 ? (
                  candidate.notes
                    .slice()
                    .reverse()
                    .map((note, index) => (
                      <div
                        key={`${note.addedAt}-${index}`}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <p className="text-sm text-gray-800">{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {note.addedBy?.name || 'Unknown'} ·{' '}
                          {formatRelativeTime(note.addedAt)}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">No notes yet</p>
                )}
              </div>
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this candidate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleInterview
          applicationId={id}
          jobTitle={job?.title}
          candidateName={candidate.name}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => {
            loadApplication()
            loadInterviews()
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(rejectConfirm)}
        title="Reject candidate"
        message="Move this candidate to Rejected?"
        confirmLabel="Reject"
        destructive
        onConfirm={async () => {
          const stage = rejectConfirm
          setRejectConfirm(null)
          await applyStageChange(stage)
        }}
        onCancel={() => setRejectConfirm(null)}
      />

      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete application"
        message="Permanently delete this application? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          try {
            await deleteApplication(id)
            showToast('Application deleted', 'success')
            window.location.href = '/pipeline'
          } catch {
            setDeleteConfirm(false)
          }
        }}
        onCancel={() => setDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelInterview)}
        title="Cancel interview"
        message="Cancel this scheduled interview?"
        confirmLabel="Cancel interview"
        destructive
        onConfirm={async () => {
          try {
            await updateInterview(cancelInterview, { status: 'Cancelled' })
            showToast('Interview cancelled', 'success')
            setCancelInterview(null)
            loadInterviews()
          } catch {
            setCancelInterview(null)
          }
        }}
        onCancel={() => setCancelInterview(null)}
      />
    </div>
  )
}
