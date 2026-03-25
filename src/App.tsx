import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { DragProvider } from './context/DragContext'
import { TaskBin } from './components/TaskBin'
import { TimeColumn } from './components/TimeColumn'
import { DayColumn } from './components/DayColumn'
import { DragPreview } from './components/DragPreview'
import { EditTaskModal } from './components/EditTaskModal'
import { usePlannerStore, type MasterTask, type TaskInstance } from './store/usePlannerStore'

function App() {
  const {
    masterTasks,
    scheduledInstances,
    currentWeekStart,
    nextWeek,
    prevWeek,
    resetToToday,
  } = usePlannerStore()

  const [editingData, setEditingData] = useState<{ task?: MasterTask; instance?: TaskInstance } | null>(null)

  const weekStart = new Date(currentWeekStart)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  return (
    <DragProvider>
      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Calendar size={22} />
              Weekly Planner
            </h1>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={prevWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={resetToToday} className="px-3 py-1 text-sm font-medium hover:bg-white hover:shadow-sm rounded-md transition-all">
                Today
              </button>
              <button onClick={nextWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
            <span className="font-semibold text-gray-600 text-sm">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <TaskBin onEdit={(task) => setEditingData({ task })} />

          {/* Calendar grid — scrollable */}
          <div className="flex-1 overflow-auto">
            <div className="flex bg-white m-3 rounded-xl shadow-inner border border-gray-200 min-w-fit">
              <TimeColumn />
              {weekDays.map((day) => {
                const dayStr = day.toISOString().split('T')[0]
                const dayInstances = scheduledInstances
                  .filter(inst => inst.dayDate === dayStr)
                  .map(inst => ({ instance: inst, master: masterTasks.find(m => m.id === inst.masterTaskId)! }))
                  .filter(item => item.master)

                return (
                  <DayColumn
                    key={dayStr}
                    dayDate={day}
                    instances={dayInstances}
                    onEdit={(task, instance) => setEditingData({ task, instance })}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Floating drag preview — pointer-events: none so it doesn't block drops */}
        <DragPreview />

        {editingData && (
          <EditTaskModal
            task={editingData.task}
            instance={editingData.instance}
            onClose={() => setEditingData(null)}
          />
        )}
      </div>
    </DragProvider>
  )
}

export default App
