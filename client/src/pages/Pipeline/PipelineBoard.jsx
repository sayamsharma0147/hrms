import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from '../../components/KanbanColumn'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SkeletonCard } from '../../components/Skeleton'
import useToast from '../../hooks/useToast'
import { getJobs } from '../../services/jobService'
import {
  getApplicationsByJob,
  updateStage,
} from '../../services/applicationService'
import { PIPELINE_STAGES } from '../../utils/pipelineUtils'

function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage} className="w-[280px] min-w-[280px] shrink-0 space-y-2">
          <SkeletonCard className="h-8 w-24" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      ))}
    </div>
  )
}

export default function PipelineBoard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [pendingReject, setPendingReject] = useState(null)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await getJobs({ limit: 100 })
        setJobs(data.jobs)
      } catch {
        setJobs([])
      } finally {
        setLoadingJobs(false)
      }
    }
    loadJobs()
  }, [])

  const fetchApplications = useCallback(async () => {
    if (!selectedJobId) return
    setLoading(true)
    try {
      const { data } = await getApplicationsByJob(selectedJobId)
      setApplications(data)
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [selectedJobId])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const applyStageChange = async (draggableId, newStage, previous) => {
    setApplications((prev) =>
      prev.map((a) =>
        a._id === draggableId ? { ...a, stage: newStage } : a
      )
    )

    try {
      await updateStage(draggableId, newStage, `Moved to ${newStage}`)
      showToast(`Candidate moved to ${newStage}`, 'success')
      await fetchApplications()
    } catch {
      setApplications(previous)
    }
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStage = destination.droppableId
    const app = applications.find((a) => a._id === draggableId)
    if (!app || app.stage === newStage) return

    const previous = applications

    if (newStage === 'Rejected') {
      setPendingReject({ draggableId, newStage, previous })
      return
    }

    await applyStageChange(draggableId, newStage, previous)
  }

  const appsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.stage === stage)
    return acc
  }, {})

  const hasApplications = applications.length > 0

  return (
    <div className="max-w-full">
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Hiring Pipeline</h1>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={loadingJobs}
            className="flex-1 min-w-[200px] max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a job...</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.department})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchApplications}
            disabled={!selectedJobId || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {!selectedJobId ? (
        <EmptyState
          icon="🔄"
          title="Select a job"
          message="Select a job above to view its pipeline"
        />
      ) : loading ? (
        <PipelineSkeleton />
      ) : !hasApplications ? (
        <EmptyState
          icon="👤"
          title="No applications yet"
          message="No applications yet for this job"
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                title={stage}
                stage={stage}
                applications={appsByStage[stage] || []}
                onCardClick={(id) => navigate(`/applications/${id}`)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingReject)}
        title="Reject candidate"
        message="Move this candidate to Rejected? They will be removed from the active pipeline."
        confirmLabel="Reject"
        destructive
        onConfirm={async () => {
          const { draggableId, newStage, previous } = pendingReject
          setPendingReject(null)
          await applyStageChange(draggableId, newStage, previous)
        }}
        onCancel={() => setPendingReject(null)}
      />
    </div>
  )
}
