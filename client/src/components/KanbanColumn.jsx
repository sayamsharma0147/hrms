import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'
import { STAGE_COLORS } from '../utils/pipelineUtils'

export default function KanbanColumn({
  title,
  stage,
  applications,
  onCardClick,
}) {
  const colorClass = STAGE_COLORS[stage] || 'bg-gray-50 border-gray-200'

  return (
    <div
      className={`flex flex-col w-[280px] min-w-[280px] shrink-0 rounded-xl border ${colorClass}`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-inherit">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <span className="bg-white/80 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)] min-h-[120px] ${
              snapshot.isDraggingOver ? 'bg-white/50' : ''
            }`}
          >
            {applications.map((app, index) => (
              <KanbanCard
                key={app._id}
                application={app}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

