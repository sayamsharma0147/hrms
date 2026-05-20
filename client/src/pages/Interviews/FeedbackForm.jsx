import { useState } from 'react'
import { submitFeedback } from '../../services/interviewService'
import useToast from '../../hooks/useToast'

const RECOMMENDATIONS = [
  { value: 'Strong Yes', label: 'Strong Yes', color: 'border-green-500 bg-green-50 text-green-800' },
  { value: 'Yes', label: 'Yes', color: 'border-blue-500 bg-blue-50 text-blue-800' },
  { value: 'Maybe', label: 'Maybe', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
  { value: 'No', label: 'No', color: 'border-red-500 bg-red-50 text-red-800' },
]

export default function FeedbackForm({
  interviewId,
  candidateName,
  jobTitle,
  onClose,
  onSubmitted,
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { showToast } = useToast()

  const displayRating = hoverRating || rating

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!rating) {
      setError('Please select a rating')
      return
    }
    if (!recommendation) {
      setError('Please select a recommendation')
      return
    }

    setLoading(true)
    try {
      await submitFeedback(interviewId, {
        rating,
        strengths,
        improvements,
        recommendation,
      })
      setSubmitted(true)
      showToast('Feedback submitted successfully', 'success')
      onSubmitted?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Submit Feedback</h2>
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

        {submitted && (
          <p className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm font-medium">
            Feedback submitted
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitted}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => !submitted && setHoverRating(star)}
                  onMouseLeave={() => !submitted && setHoverRating(0)}
                  className="text-3xl focus:outline-none disabled:cursor-not-allowed"
                  aria-label={`${star} star`}
                >
                  <span
                    className={
                      star <= displayRating ? 'text-amber-400' : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strengths
            </label>
            <textarea
              rows={3}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              disabled={submitted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas for Improvement
            </label>
            <textarea
              rows={3}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              disabled={submitted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDATIONS.map((rec) => (
                <label
                  key={rec.value}
                  className={`cursor-pointer border-2 rounded-lg p-3 text-center text-sm font-medium transition-colors ${
                    recommendation === rec.value
                      ? rec.color
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  } ${submitted ? 'pointer-events-none opacity-70' : ''}`}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={rec.value}
                    checked={recommendation === rec.value}
                    onChange={() => setRecommendation(rec.value)}
                    disabled={submitted}
                    className="sr-only"
                  />
                  {rec.label}
                </label>
              ))}
            </div>
          </div>

          {!submitted && (
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
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
