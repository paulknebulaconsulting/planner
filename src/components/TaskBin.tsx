import { usePlannerStore, type MasterTask } from '../store/usePlannerStore'
import { useDrag } from '../context/DragContext'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface TaskBinProps {
  onEdit: (task?: MasterTask) => void
}

export function TaskBin({ onEdit }: TaskBinProps) {
  const { masterTasks, deleteMasterTask } = usePlannerStore()
  const { startBinDrag } = useDrag()

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-bold text-gray-700 dark:text-gray-200">Tasks</h2>
        <Tooltip content="Create new task (Shortcut: N)">
          <button
            onClick={() => onEdit()}
            className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {masterTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm group hover:shadow-md transition-all select-none touch-none cursor-grab active:cursor-grabbing"
            style={{ borderColor: task.color || undefined }}
            onPointerDown={(e) => startBinDrag(task, e)}
          >
            <div className="flex items-start gap-2">
              <GripVertical size={14} className="text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: task.color || undefined }}>
                  <span className={task.color ? '' : 'text-gray-800 dark:text-gray-100'}>
                    {task.title}
                  </span>
                </p>
                {task.description && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Tooltip content="Edit task">
                  <button
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    style={{ color: task.color || undefined }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                  >
                    <Edit2 size={11} className={task.color ? '' : 'text-gray-400 dark:text-gray-500'} />
                  </button>
                </Tooltip>
                <Tooltip content="Delete task">
                  <button
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${task.title}" and all its scheduled instances?`)) {
                        deleteMasterTask(task.id)
                      }
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}

        {masterTasks.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-8 italic px-2">
            No tasks yet. Click + to create one.
          </p>
        )}
      </div>
    </div>
  )
}
