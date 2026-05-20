import { useEffect, useState } from 'react'
import { getMyInterviews } from '../../services/interviewService'
import FeedbackForm from './FeedbackForm'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'

const TYPE_BADGES = {
  Phone: 'bg-blue-100 text-blue-800',
  Video: 'bg-purple-100 text-purple-800',
  'In-Person': 'bg-green-100 text-green-800',
  Technical: 'bg-orange-100 text-orange-800',
}

const formatInterviewDate = (dateStr) => {
  const d = new Date(dateStr)
  const datePart = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${datePart} at ${timePart}`
}

function InterviewCard({ interview, onFeedback }) {
  const candidate = interview.application?.candidate
  const job = interview.application?.job

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{candidate?.name}</h3>
          <p className="text-sm text-gray-500">{job?.title}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
            TYPE_BADGES[interview.type] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {interview.type}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-1">
        {formatInterviewDate(interview.scheduledAt)}
      </p>
      <p className="text-sm text-gray-500 mb-3">{interview.duration} minutes</p>

      {interview.meetingLink && (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block mb-3 text-sm text-indigo-600 hover:underline font-medium"
        >
          Open meeting link →
        </a>
      )}

      {interview.status === 'Scheduled' && (
        <button
          type="button"
          onClick={() => onFeedback(interview)}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Submit Feedback
        </button>
      )}
    </div>
  )
}

export default function InterviewQueue() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState(null)

  const loadInterviews = async () => {
    setLoading(true)
    try {
      const { data: upcomingData } = await getMyInterviews(false)
      setUpcoming(
        upcomingData
          .filter((i) => i.status === 'Scheduled')
          .sort(
            (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
          )
      )

      if (showPast) {
        const { data: allData } = await getMyInterviews(true)
        const pastItems = allData.filter((i) =>
          ['Completed', 'Cancelled', 'No-Show'].includes(i.status)
        )
        setPast(
          pastItems.sort(
            (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)
          )
        )
      }
    } catch {
      setUpcoming([])
      setPast([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInterviews()
  }, [showPast])

  const handleFeedbackSubmitted = () => {
    setFeedbackTarget(null)
    loadInterviews()
  }

  if (loading && upcoming.length === 0 && !showPast) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <SkeletonCard className="h-8 w-48" />
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-32" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Interviews</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No upcoming interviews"
              message="When interviews are scheduled for you, they will appear here."
            />
          ) : (
            <div className="space-y-4">
              {upcoming.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onFeedback={setFeedbackTarget}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-sm font-medium text-indigo-600 hover:underline mb-4"
          >
            {showPast ? 'Hide past interviews' : 'Show past interviews'}
          </button>

          {showPast && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Past</h2>
              {past.length === 0 ? (
                <p className="text-gray-500 text-sm">No past interviews</p>
              ) : (
                <div className="space-y-4">
                  {past.map((interview) => (
                    <InterviewCard
                      key={interview._id}
                      interview={interview}
                      onFeedback={setFeedbackTarget}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

      {feedbackTarget && (
        <FeedbackForm
          interviewId={feedbackTarget._id}
          candidateName={feedbackTarget.application?.candidate?.name}
          jobTitle={feedbackTarget.application?.job?.title}
          onClose={() => setFeedbackTarget(null)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  )
}
