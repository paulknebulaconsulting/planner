import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, startOfWeek, subDays } from 'date-fns'

export interface MasterTask {
  id: string
  title: string
  description?: string
}

export interface TaskInstance {
  id: string
  masterTaskId: string
  dayDate: string // ISO string date
  startHour: number
  duration: number
}

interface PlannerState {
  masterTasks: MasterTask[]
  scheduledInstances: TaskInstance[]
  currentWeekStart: string // ISO string of Monday
  
  // Master Task Actions
  addMasterTask: (task: Omit<MasterTask, 'id'>) => string
  updateMasterTask: (id: string, updates: Partial<MasterTask>) => void
  deleteMasterTask: (id: string) => void
  
  // Instance Actions
  addInstance: (instance: Omit<TaskInstance, 'id'>) => void
  moveInstance: (id: string, dayDate: string, startHour: number) => void
  updateInstance: (id: string, updates: Partial<TaskInstance>) => void
  deleteInstance: (id: string) => void
  
  // Navigation
  nextWeek: () => void
  prevWeek: () => void
  resetToToday: () => void
}

const getMonday = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return start.toISOString()
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      masterTasks: [],
      scheduledInstances: [],
      currentWeekStart: getMonday(new Date()),

      addMasterTask: (task) => {
        const id = Math.random().toString(36).substring(2, 9)
        set((state) => ({
          masterTasks: [...state.masterTasks, { ...task, id }],
        }))
        return id
      },

      updateMasterTask: (id, updates) =>
        set((state) => ({
          masterTasks: state.masterTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteMasterTask: (id) =>
        set((state) => ({
          masterTasks: state.masterTasks.filter((t) => t.id !== id),
          scheduledInstances: state.scheduledInstances.filter((inst) => inst.masterTaskId !== id),
        })),

      addInstance: (instance) =>
        set((state) => ({
          scheduledInstances: [
            ...state.scheduledInstances,
            { ...instance, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),

      moveInstance: (id, dayDate, startHour) =>
        set((state) => ({
          scheduledInstances: state.scheduledInstances.map((inst) =>
            inst.id === id ? { ...inst, dayDate, startHour } : inst
          ),
        })),

      updateInstance: (id, updates) =>
        set((state) => ({
          scheduledInstances: state.scheduledInstances.map((inst) =>
            inst.id === id ? { ...inst, ...updates } : inst
          ),
        })),

      deleteInstance: (id) =>
        set((state) => ({
          scheduledInstances: state.scheduledInstances.filter((inst) => inst.id !== id),
        })),

      nextWeek: () =>
        set((state) => ({
          currentWeekStart: addDays(new Date(state.currentWeekStart), 7).toISOString(),
        })),

      prevWeek: () =>
        set((state) => ({
          currentWeekStart: subDays(new Date(state.currentWeekStart), 7).toISOString(),
        })),

      resetToToday: () =>
        set(() => ({
          currentWeekStart: getMonday(new Date()),
        })),
    }),
    {
      name: 'planner-storage-v2',
    }
  )
)
