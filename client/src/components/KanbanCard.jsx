import { Draggable } from '@hello-pangea/dnd'
import { daysInStage, getInitials } from '../utils/pipelineUtils'

const avatarColors = [
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-amber-500',
]

function getAvatarColor(name = '') {
  const index = name.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
}

export default function KanbanCard({ application, index, onClick }) {
  const candidate = application.candidate
  const name = candidate?.name || 'Unknown'
  const days = daysInStage(application)

  return (
    <Draggable draggableId={application._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(application._id)}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-300' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getAvatarColor(name)}`}
            >
              {getInitials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">
                {application.job?.title || 'Job'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {days === 0 ? 'Today' : `${days}d in stage`}
            </span>
            {application.source && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                {application.source}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
