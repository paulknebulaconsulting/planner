import { useDroppable } from '@dnd-kit/core'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { DraggableTaskCard } from './DraggableTaskCard'
import { format, isPast, isToday, startOfDay } from 'date-fns'

interface TimeSlotProps {
  dayDate: string
  hour: number
  isPastDay: boolean
  isFirstDay: boolean
}

function TimeSlot({ dayDate, hour, isPastDay, isFirstDay }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dayDate}-${hour}`,
    data: {
      dayDate,
      startHour: hour,
    },
    disabled: isPastDay,
  })

  // Only show label on the hour (e.g., 7.0, 8.0)
  const isFullHour = Number.isInteger(hour)

  return (
    <div 
      ref={setNodeRef}
      className={`h-8 border-b border-gray-50 relative ${isOver ? 'bg-blue-100/50' : ''} ${isFullHour ? 'border-b-gray-200' : 'border-b-gray-50'}`}
    >
      {isFirstDay && isFullHour && (
        <span className="absolute -top-2 left-0 text-[10px] text-gray-400 px-1 font-medium bg-white z-10">
          {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
        </span>
      )}
    </div>
  )
}

interface DayColumnProps {
  dayDate: Date
  instances: { instance: TaskInstance, master: MasterTask }[]
  onEdit: (task: MasterTask, instance?: TaskInstance) => void
  isFirstDay: boolean
  isAnyTaskDragging?: boolean
}

export function DayColumn({ dayDate, instances, onEdit, isFirstDay, isAnyTaskDragging }: DayColumnProps) {
  const isPastDay = isPast(startOfDay(dayDate)) && !isToday(dayDate)
  const dayDateStr = dayDate.toISOString().split('T')[0]

  // Create 30-minute slots from 7:00 to 19:00 (end of 18:30 slot)
  const slots = []
  for (let hour = 7; hour < 19; hour += 0.5) {
    slots.push(hour)
  }

  return (
    <div className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0 min-w-[150px]">
      <div className={
        `p-2 text-center border-b border-gray-200 
        ${isToday(dayDate) ? 'bg-blue-50 font-bold text-blue-700' : 'bg-gray-50 text-gray-600'}
        ${isPastDay ? 'opacity-50' : ''}`
      }>
        <div className="text-xs uppercase tracking-wider font-semibold">{format(dayDate, 'EEE')}</div>
        <div className="text-lg">{format(dayDate, 'd')}</div>
      </div>
      
      <div 
        className={`relative flex-1 bg-white min-h-[48rem] ${isPastDay ? 'bg-gray-50/50' : ''}`}
      >
        {/* Hour markers/slots */}
        {slots.map((hour) => (
          <TimeSlot 
            key={hour} 
            dayDate={dayDateStr}
            hour={hour} 
            isPastDay={isPastDay} 
            isFirstDay={isFirstDay}
          />
        ))}

        {/* Tasks */}
        {instances.map(({ instance, master }) => (
          <DraggableTaskCard 
            key={instance.id} 
            masterTask={master} 
            instance={instance} 
            onEdit={onEdit} 
            isPastDay={isPastDay}
            isAnyTaskDragging={isAnyTaskDragging}
          />
        ))}
      </div>
    </div>
  )
}
