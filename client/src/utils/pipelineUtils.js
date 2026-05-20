export const PIPELINE_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
]

export const STAGE_COLORS = {
  Applied: 'bg-blue-50 border-blue-200',
  Screening: 'bg-yellow-50 border-yellow-200',
  Interview: 'bg-purple-50 border-purple-200',
  Offer: 'bg-orange-50 border-orange-200',
  Hired: 'bg-green-50 border-green-200',
  Rejected: 'bg-red-50 border-red-200',
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function daysInStage(application) {
  const history = application.stageHistory || []
  const entries = [...history].reverse()
  const currentEntry =
    entries.find((h) => h.stage === application.stage) ||
    application.latestStage

  const date =
    currentEntry?.changedAt || application.updatedAt || application.createdAt

  if (!date) return 0

  const diff = Date.now() - new Date(date).getTime()
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0)
}

export function formatRelativeTime(date) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
