import { useState, useMemo } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects,
  pointerWithin,
  type DragEndEvent, 
  type DragStartEvent,
  type DropAnimation
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { addDays, format } from 'date-fns'
import { TaskBin } from './components/TaskBin'
import { DayColumn } from './components/DayColumn'
import { TaskCard } from './components/TaskCard'
import { EditTaskModal } from './components/EditTaskModal'
import { usePlannerStore, type MasterTask, type TaskInstance } from './store/usePlannerStore'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

function App() {
  const { 
    masterTasks, 
    scheduledInstances, 
    currentWeekStart,
    nextWeek,
    prevWeek,
    resetToToday,
    moveInstance,
    addInstance,
    deleteInstance
  } = usePlannerStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    task?: MasterTask
    instance?: TaskInstance
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const weekStart = new Date(currentWeekStart)
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i))

  // Find the active drag item and its master task from latest store state
  const activeInstance = useMemo(() => 
    scheduledInstances.find(i => i.id === activeId),
    [scheduledInstances, activeId]
  )
  
  const activeMaster = useMemo(() => {
    if (!activeId) return null
    // Could be a master task (from bin) or an instance
    const master = masterTasks.find(m => m.id === activeId)
    if (master) return master
    if (activeInstance) return masterTasks.find(m => m.id === activeInstance.masterTaskId)
    return null
  }, [masterTasks, activeId, activeInstance])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over) {
      const overData = over.data.current as { dayDate: string; startHour: number; type?: string }
      const activeData = active.data.current as { type: 'master' | 'instance'; masterTask: MasterTask; instance?: TaskInstance }

      if (overData.type === 'bin') {
        if (activeData.type === 'instance' && activeData.instance) {
          deleteInstance(activeData.instance.id)
        }
      } else if (overData.dayDate && overData.startHour !== undefined) {
        if (activeData.type === 'master') {
          addInstance({
            masterTaskId: activeData.masterTask.id,
            dayDate: overData.dayDate,
            startHour: overData.startHour,
            duration: 1,
          })
        } else if (activeData.type === 'instance' && activeData.instance) {
          moveInstance(activeData.instance.id, overData.dayDate, overData.startHour)
        }
      }
    }
    
    // Clear active ID last to allow animation to new position
    setActiveId(null)
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex flex-col h-screen bg-gray-100 text-gray-900 overflow-hidden font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Calendar size={24} />
              Weekly Planner
            </h1>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button 
                onClick={prevWeek}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={resetToToday}
                className="px-3 py-1 text-sm font-medium hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                Today
              </button>
              <button 
                onClick={nextWeek}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <span className="font-semibold text-gray-700">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="text-sm text-gray-500 italic">
            Weekdays Only (7 AM - 7 PM)
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <TaskBin 
            tasks={masterTasks} 
            onEdit={(task) => setEditingData({ task })}
            isAnyTaskDragging={!!activeId}
          />

          {/* Main Planner Grid */}
          <div className="flex-1 overflow-x-auto overflow-y-auto flex bg-white m-4 rounded-xl shadow-inner border border-gray-200">
            {weekDays.map((day, index) => {
              const dayStr = day.toISOString().split('T')[0]
              const dayInstances = scheduledInstances
                .filter(inst => inst.dayDate === dayStr)
                .map(inst => ({
                  instance: inst,
                  master: masterTasks.find(m => m.id === inst.masterTaskId)!
                }))
                .filter(item => item.master)

              return (
                <DayColumn 
                  key={day.toISOString()} 
                  dayDate={day} 
                  instances={dayInstances}
                  isFirstDay={index === 0}
                  onEdit={(task, instance) => setEditingData({ task, instance })}
                  isAnyTaskDragging={!!activeId}
                />
              )
            })}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeMaster ? (
          <TaskCard 
            masterTask={activeMaster} 
            instance={activeInstance}
            isOverlay
          />
        ) : null}
      </DragOverlay>

      {editingData && (
        <EditTaskModal 
          task={editingData.task} 
          instance={editingData.instance}
          onClose={() => setEditingData(null)} 
        />
      )}
    </DndContext>
  )
}

export default App
