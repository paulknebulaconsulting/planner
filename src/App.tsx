import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { DragProvider } from './context/DragContext'
import { TaskBin } from './components/TaskBin'
import { TimeColumn } from './components/TimeColumn'
import { DayColumn } from './components/DayColumn'
import { DragPreview } from './components/DragPreview'
import { EditTaskModal } from './components/EditTaskModal'
import { Tooltip } from './components/Tooltip'
import { usePlannerStore, type MasterTask, type TaskInstance } from './store/usePlannerStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './context/ThemeContext'

function App() {
  const {
    masterTasks,
    scheduledInstances,
    currentWeekStart,
    nextWeek,
    prevWeek,
    resetToToday,
  } = usePlannerStore()

  const { theme, toggleTheme } = useTheme()

  const [editingData, setEditingData] = useState<{ task?: MasterTask; instance?: TaskInstance } | null>(null)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setEditingData({ task: undefined }),
    onCloseModal: () => setEditingData(null),
  })

  const weekStart = new Date(currentWeekStart)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  return (
    <DragProvider>
      <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme === 'dark' ? 'dark' : ''}`} style={{
        backgroundColor: theme === 'dark' ? '#1F2937' : '#F3F4F6',
        color: theme === 'dark' ? '#F3F4F6' : '#111827',
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
          borderBottomColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        }} className="border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Calendar size={22} />
              Weekly Planner
            </h1>
            <div style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }} className="flex items-center rounded-lg p-0.5">
              <Tooltip content="Previous week">
                <button onClick={prevWeek} className="p-1.5 hover:shadow-sm rounded-md transition-all" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}>
                  <ChevronLeft size={18} />
                </button>
              </Tooltip>
              <Tooltip content="Go to today (Shortcut: Today)">
                <button onClick={resetToToday} className="px-3 py-1 text-sm font-medium hover:shadow-sm rounded-md transition-all" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}>
                  Today
                </button>
              </Tooltip>
              <Tooltip content="Next week">
                <button onClick={nextWeek} className="p-1.5 hover:shadow-sm rounded-md transition-all" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}>
                  <ChevronRight size={18} />
                </button>
              </Tooltip>
            </div>
            <span className="font-semibold text-sm" style={{ color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}>
              Week of {format(weekStart, 'MMM d, yyyy')}
            </span>
          </div>
          <Tooltip content={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </Tooltip>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <TaskBin onEdit={(task) => setEditingData({ task })} />

          {/* Calendar grid — scrollable */}
          <div className="flex-1 overflow-auto">
            <div style={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
            }} className="flex m-3 rounded-xl shadow-inner border min-w-fit">
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
