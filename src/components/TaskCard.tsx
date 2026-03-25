import { forwardRef } from 'react'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { X, Edit2, Clock } from 'lucide-react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatHour = (hour: number) => {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

interface TaskCardProps {
  masterTask: MasterTask
  instance?: TaskInstance
  onEdit?: (task: MasterTask, instance?: TaskInstance) => void
  onDelete?: (e: React.MouseEvent) => void
  onResizeStart?: (e: React.MouseEvent, type: 'top' | 'bottom') => void
  isDragging?: boolean
  isOverlay?: boolean
  isResizing?: boolean
  isPastDay?: boolean
  isAnyTaskDragging?: boolean
  style?: React.CSSProperties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({
  masterTask,
  instance,
  onEdit,
  onDelete,
  onResizeStart,
  isDragging,
  isOverlay,
  isResizing,
  isPastDay,
  isAnyTaskDragging,
  style: passedStyle,
  attributes,
  listeners
}, ref) => {
  
  // CRITICAL: isActuallyFloating is ONLY for the DragOverlay instance.
  // The grid item (isDragging) MUST keep its 'top' offset even when hidden, 
  // so that dnd-kit's transform doesn't jump due to layout changes.
  const isActuallyFloating = isOverlay
  
  const combinedStyle: React.CSSProperties = {
    ...passedStyle,
    // When on grid, use absolute top. When in overlay, use undefined/0 and let dnd-kit handle it.
    top: (instance && !isActuallyFloating) ? `${(instance.startHour - 7) * 4}rem` : undefined,
    height: instance ? `${instance.duration * 4}rem` : undefined,
    zIndex: isActuallyFloating || isResizing ? 100 : (isDragging ? 0 : undefined),
    width: isOverlay ? '14rem' : undefined,
    // Only apply transform from passedStyle; don't let it combine with top/height transitions
    transform: passedStyle?.transform,
  }

  return (
    <div
      ref={ref}
      style={combinedStyle}
      {...listeners}
      {...attributes}
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm group flex flex-col',
        // Only apply transitions when not being manipulated by dnd-kit
        !(isDragging || isOverlay || isResizing) && 'transition-all duration-200',
        isDragging && 'opacity-0 pointer-events-none', // Hide source, prevent interaction
        isOverlay && 'opacity-100 border-blue-500 ring-4 ring-blue-100 shadow-2xl scale-105 rotate-1 cursor-grabbing z-[100]',
        (isAnyTaskDragging && !isOverlay) && 'pointer-events-none', // Allow drop-through
        (instance && !isActuallyFloating) ? 'absolute left-1 right-1' : 'relative w-full mb-3',
        isResizing && 'border-blue-400 ring-2 ring-blue-100 shadow-lg select-none z-50',
        isPastDay && 'cursor-default opacity-75'
      )}
    >
      {/* Top Resize Handle */}
      {instance && !isPastDay && !isOverlay && (
        <div 
          onMouseDown={(e) => onResizeStart?.(e, 'top')}
          className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-blue-400/30 z-20 transition-colors rounded-t-lg"
        />
      )}

      <div className="flex-1 flex flex-col p-2 relative overflow-hidden">
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-gray-900 truncate leading-tight">
              {masterTask.title}
            </h4>
          </div>
          
          {!isDragging && !isOverlay && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(masterTask, instance)
                }}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
              >
                <Edit2 size={10} />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>

        {instance && (
          <div className="flex items-center gap-1 text-[9px] font-medium text-blue-600 mb-1">
            <Clock size={10} />
            <span>{formatHour(instance.startHour)} - {formatHour(instance.startHour + instance.duration)}</span>
          </div>
        )}

        {(!instance || instance.duration > 0.75) && masterTask.description && (
          <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
            {masterTask.description}
          </p>
        )}
      </div>

      {/* Bottom Resize Handle */}
      {instance && !isPastDay && !isOverlay && (
        <div 
          onMouseDown={(e) => onResizeStart?.(e, 'bottom')}
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-blue-400/30 z-20 transition-colors rounded-b-lg"
        />
      )}
    </div>
  )
})

TaskCard.displayName = 'TaskCard'
