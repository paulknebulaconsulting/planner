import { useRef, useCallback } from 'react'
import { format, isToday } from 'date-fns'
import { useDrag } from '../context/DragContext'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { GridTask } from './GridTask'

const PX_PER_HOUR = 64
const GRID_START = 7
const GRID_END = 19
const TOTAL_HOURS = GRID_END - GRID_START

interface DayColumnProps {
  dayDate: Date
  instances: { instance: TaskInstance; master: MasterTask }[]
  onEdit: (task: MasterTask, instance: TaskInstance) => void
}

export function DayColumn({ dayDate, instances, onEdit }: DayColumnProps) {
  const { isDragging, source, dropTarget, setDropTarget } = useDrag()
  const containerRef = useRef<HTMLDivElement>(null)
  const dayDateStr = dayDate.toISOString().split('T')[0]

  // Calculate which grid hour corresponds to a clientY position
  const getHourFromY = useCallback((clientY: number) => {
    if (!containerRef.current) return GRID_START
    const rect = containerRef.current.getBoundingClientRect()
    const raw = GRID_START + (clientY - rect.top) / PX_PER_HOUR
    const snapped = Math.round(raw * 2) / 2
    return Math.max(GRID_START, Math.min(GRID_END - 0.5, snapped))
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setDropTarget({ dayDate: dayDateStr, startHour: getHourFromY(e.clientY) })
  }, [isDragging, setDropTarget, dayDateStr, getHourFromY])

  const handlePointerLeave = useCallback(() => {
    if (isDragging) setDropTarget(null)
  }, [isDragging, setDropTarget])

  // Ghost preview: where the task will land if dropped here
  const isTargetColumn = isDragging && dropTarget?.dayDate === dayDateStr
  const ghostStart = isTargetColumn && dropTarget && source ? (() => {
    if (source.kind === 'bin') return dropTarget.startHour
    const raw = dropTarget.startHour - source.grabOffsetHours
    return Math.max(GRID_START, Math.min(GRID_END - 0.5, Math.round(raw * 2) / 2))
  })() : null
  const ghostDuration = source?.kind === 'grid' ? source.instance.duration : 1

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START + i)

  return (
    <div className="flex flex-col flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-w-[140px]">
      {/* Day header */}
      <div className={`p-2 text-center border-b border-gray-200 dark:border-gray-700 ${
        isToday(dayDate)
          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
          : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
      }`}>
        <div className="text-xs uppercase tracking-wider font-semibold">{format(dayDate, 'EEE')}</div>
        <div className={`text-lg ${isToday(dayDate) ? 'font-bold' : ''}`}>{format(dayDate, 'd')}</div>
      </div>

      {/* Grid body */}
      <div
        ref={containerRef}
        style={{ height: TOTAL_HOURS * PX_PER_HOUR }}
        className="relative flex-shrink-0 bg-white dark:bg-gray-900"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Hour rows */}
        {hours.map((h) => (
          <div
            key={h}
            style={{ top: (h - GRID_START) * PX_PER_HOUR, height: PX_PER_HOUR }}
            className="absolute left-0 right-0 border-b border-gray-200 dark:border-gray-700/60"
          >
            {/* Half-hour line */}
            <div
              className="absolute left-0 right-0 border-b border-gray-100 dark:border-gray-800"
              style={{ top: PX_PER_HOUR / 2 }}
            />
          </div>
        ))}

        {/* Drop ghost */}
        {ghostStart !== null && (
          <div
            style={{
              top: (ghostStart - GRID_START) * PX_PER_HOUR,
              height: ghostDuration * PX_PER_HOUR,
              left: 2,
              right: 2,
            }}
            className="absolute bg-blue-200/50 dark:bg-blue-800/30 border-2 border-blue-400 dark:border-blue-500 border-dashed rounded-lg pointer-events-none z-10"
          />
        )}

        {/* Task instances */}
        {instances.map(({ instance, master }) => (
          <GridTask
            key={instance.id}
            masterTask={master}
            instance={instance}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}
