import { Clock } from 'lucide-react'
import { useDrag } from '../context/DragContext'

const PX_PER_HOUR = 64
const PREVIEW_WIDTH = 200

function formatTime(h: number) {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

export function DragPreview() {
  const { isDragging, source, cursor } = useDrag()

  if (!isDragging || !source) return null

  const masterTask = source.masterTask
  const duration = source.kind === 'grid' ? source.instance.duration : 1
  const height = Math.max(32, duration * PX_PER_HOUR)
  const grabOffsetPx = source.kind === 'grid' ? source.grabOffsetHours * PX_PER_HOUR : 0

  return (
    <div
      style={{
        position: 'fixed',
        left: cursor.x - PREVIEW_WIDTH / 2,
        top: cursor.y - grabOffsetPx,
        width: PREVIEW_WIDTH,
        height,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'rotate(1.5deg)',
        backgroundColor: `${masterTask.color || '#3B82F6'}20`,
        borderColor: masterTask.color || '#3B82F6',
      }}
      className="border-2 rounded-lg shadow-2xl flex flex-col p-2 overflow-hidden opacity-90"
    >
      <span className="font-bold text-xs truncate" style={{ color: masterTask.color || '#1F2937' }}>
        {masterTask.title}
      </span>
      {height >= 40 && source.kind === 'grid' && (
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={9} style={{ color: masterTask.color || '#3B82F6' }} className="flex-shrink-0" />
          <span className="text-[9px]" style={{ color: masterTask.color || '#3B82F6' }}>
            {formatTime(source.instance.startHour)}–{formatTime(source.instance.startHour + duration)}
          </span>
        </div>
      )}
    </div>
  )
}
