import { useDroppable } from '@dnd-kit/core'
import type { MasterTask } from '../store/usePlannerStore'
import { DraggableTaskCard } from './DraggableTaskCard'
import { Plus } from 'lucide-react'

interface TaskBinProps {
  tasks: MasterTask[]
  onEdit: (task?: MasterTask) => void
  isAnyTaskDragging?: boolean
}

export function TaskBin({ tasks, onEdit, isAnyTaskDragging }: TaskBinProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'task-bin',
    data: {
      type: 'bin'
    },
  })

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-gray-700">Tasks</h2>
        <button 
          onClick={() => onEdit()}
          className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      <div 
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 overflow-y-auto ${isOver ? 'bg-blue-50/50' : ''}`}
      >
        {tasks.map((task) => (
          <DraggableTaskCard 
            key={task.id} 
            masterTask={task} 
            onEdit={(t) => onEdit(t)} 
            isAnyTaskDragging={isAnyTaskDragging}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-8 italic px-4">
            No tasks. Click + to create your first master task.
          </div>
        )}
      </div>
    </div>
  )
}
