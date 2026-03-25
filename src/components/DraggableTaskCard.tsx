import { useState, useEffect, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { usePlannerStore } from '../store/usePlannerStore'
import { TaskCard } from './TaskCard'

interface DraggableTaskCardProps {
  masterTask: MasterTask
  instance?: TaskInstance
  onEdit?: (task: MasterTask, instance?: TaskInstance) => void
  isPastDay?: boolean
  isAnyTaskDragging?: boolean
}

export function DraggableTaskCard({ masterTask, instance, onEdit, isPastDay, isAnyTaskDragging }: DraggableTaskCardProps) {
  const { deleteInstance, deleteMasterTask, updateInstance } = usePlannerStore()
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instance ? instance.id : masterTask.id,
    disabled: isPastDay || isResizing !== null,
    data: {
      type: instance ? 'instance' : 'master',
      masterTask,
      instance,
    },
  })

  // Resize handling - track original values to avoid jitter from stale instance data
  const startY = useRef(0)
  const startStartHour = useRef(0)
  const startDuration = useRef(0)

  const handleResizeStart = (e: React.MouseEvent, type: 'top' | 'bottom') => {
    e.stopPropagation()
    e.preventDefault()
    if (isPastDay || !instance) return
    
    setIsResizing(type)
    startY.current = e.clientY
    startStartHour.current = instance.startHour
    startDuration.current = instance.duration
  }

  useEffect(() => {
    if (!isResizing || !instance) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY.current
      const actualDeltaHours = deltaY / 64
      
      if (isResizing === 'bottom') {
        // Calculate from original duration to avoid compounding errors
        const newDuration = Math.max(0.5, Math.round((startDuration.current + actualDeltaHours) * 2) / 2)
        if (newDuration !== instance.duration) {
          updateInstance(instance.id, { duration: newDuration })
        }
      } else if (isResizing === 'top') {
        // Calculate from original start hour to avoid compounding errors
        const newStartHour = Math.max(7, Math.min(18.5, Math.round((startStartHour.current + actualDeltaHours) * 2) / 2))
        const actualDelta = newStartHour - startStartHour.current
        if (actualDelta !== 0) {
          const newDuration = Math.max(0.5, startDuration.current - actualDelta)
          updateInstance(instance.id, { 
            startHour: newStartHour,
            duration: newDuration
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, instance, updateInstance])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (instance) {
      deleteInstance(instance.id)
    } else {
      if (confirm('Delete this task and all its scheduled instances?')) {
        deleteMasterTask(masterTask.id)
      }
    }
  }

  return (
    <TaskCard
      ref={setNodeRef}
      masterTask={masterTask}
      instance={instance}
      onEdit={onEdit}
      onDelete={handleDelete}
      onResizeStart={handleResizeStart}
      isDragging={isDragging}
      isResizing={isResizing !== null}
      isPastDay={isPastDay}
      isAnyTaskDragging={isAnyTaskDragging}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      attributes={attributes}
      listeners={listeners}
    />
  )
}
