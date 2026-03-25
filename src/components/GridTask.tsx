import { useRef, useEffect, useState } from 'react'
import { X, Edit2, Clock } from 'lucide-react'
import { useDrag } from '../context/DragContext'
import { usePlannerStore } from '../store/usePlannerStore'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'

const PX_PER_HOUR = 64
const GRID_START = 7
const GRID_END = 19

function formatTime(h: number) {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

interface GridTaskProps {
  masterTask: MasterTask
  instance: TaskInstance
  onEdit: (task: MasterTask, instance: TaskInstance) => void
}

export function GridTask({ masterTask, instance, onEdit }: GridTaskProps) {
  const { startGridDrag, isDragging, source } = useDrag()
  const { deleteInstance, updateInstance } = usePlannerStore()
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)

  const isBeingDragged =
    isDragging && source?.kind === 'grid' && source.instance.id === instance.id

  const top = (instance.startHour - GRID_START) * PX_PER_HOUR
  const height = instance.duration * PX_PER_HOUR

  // Start moving this task by dragging the body
  const handleBodyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isResizing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const grabOffsetHours = (e.clientY - rect.top) / PX_PER_HOUR
    startGridDrag(instance, masterTask, grabOffsetHours, e)
  }

  // Snapshot values at resize start — never read from live instance during resize
  const resizeSnapshot = useRef({ y: 0, startHour: 0, duration: 0 })

  const handleResizePointerDown = (e: React.PointerEvent, edge: 'top' | 'bottom') => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(edge)
    resizeSnapshot.current = {
      y: e.clientY,
      startHour: instance.startHour,
      duration: instance.duration,
    }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ns-resize'
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMove = (e: PointerEvent) => {
      const deltaHours = (e.clientY - resizeSnapshot.current.y) / PX_PER_HOUR

      if (isResizing === 'bottom') {
        const rawDuration = resizeSnapshot.current.duration + deltaHours
        const newDuration = Math.max(0.5, Math.round(rawDuration * 2) / 2)
        const maxDuration = GRID_END - instance.startHour
        updateInstance(instance.id, { duration: Math.min(maxDuration, newDuration) })
      } else {
        const rawStart = resizeSnapshot.current.startHour + deltaHours
        const newStart = Math.max(GRID_START, Math.min(GRID_END - 0.5, Math.round(rawStart * 2) / 2))
        const delta = newStart - resizeSnapshot.current.startHour
        const newDuration = Math.max(0.5, resizeSnapshot.current.duration - delta)
        updateInstance(instance.id, { startHour: newStart, duration: newDuration })
      }
    }

    const handleUp = () => {
      setIsResizing(null)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [isResizing, instance.id, instance.startHour, updateInstance])

  return (
    <div
      className={[
        'rounded-lg shadow-sm group flex flex-col overflow-hidden select-none touch-none',
        isBeingDragged ? 'opacity-20' : 'opacity-100',
        !isDragging && !isResizing ? 'cursor-grab' : '',
      ].join(' ')}
      style={{
        top,
        height,
        left: 2,
        right: 2,
        position: 'absolute',
        backgroundColor: `${masterTask.color || '#3B82F6'}20`,
        borderColor: masterTask.color || '#3B82F6',
        borderWidth: '2px',
      }}
      onPointerDown={handleBodyPointerDown}
    >
      {/* Top resize handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          zIndex: 10,
          cursor: 'ns-resize',
          backgroundColor: `${masterTask.color || '#3B82F6'}40`,
        }}
        className="hover:opacity-60 rounded-t-lg transition-opacity"
        onPointerDown={(e) => handleResizePointerDown(e, 'top')}
      />

      {/* Content */}
      <div className="flex-1 px-2 pt-3 pb-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between gap-1">
          <span
            className="font-semibold text-xs truncate leading-tight flex-1"
            style={{ color: masterTask.color || '#1F2937' }}
          >
            {masterTask.title}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              className="p-0.5 hover:bg-gray-200 rounded"
              style={{ color: masterTask.color || '#3B82F6' }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(masterTask, instance) }}
            >
              <Edit2 size={10} />
            </button>
            <button
              className="p-0.5 text-red-400 hover:bg-red-100 rounded"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); deleteInstance(instance.id) }}
            >
              <X size={10} />
            </button>
          </div>
        </div>

        {height >= 48 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={9} style={{ color: masterTask.color || '#3B82F6' }} className="flex-shrink-0" />
            <span className="text-[9px]" style={{ color: masterTask.color || '#3B82F6' }}>
              {formatTime(instance.startHour)}–{formatTime(instance.startHour + instance.duration)}
            </span>
          </div>
        )}

        {height >= 64 && masterTask.description && (
          <p className="text-[10px] mt-1 line-clamp-2 leading-tight" style={{ color: `${masterTask.color || '#1F2937'}80` }}>
            {masterTask.description}
          </p>
        )}
      </div>

      {/* Bottom resize handle */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          zIndex: 10,
          cursor: 'ns-resize',
          backgroundColor: `${masterTask.color || '#3B82F6'}40`,
        }}
        className="hover:opacity-60 rounded-b-lg transition-opacity"
        onPointerDown={(e) => handleResizePointerDown(e, 'bottom')}
      />
    </div>
  )
}
