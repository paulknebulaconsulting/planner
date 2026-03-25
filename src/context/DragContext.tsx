import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { usePlannerStore } from '../store/usePlannerStore'

const GRID_START = 7
const GRID_END = 19

export type DragSource =
  | { kind: 'bin'; masterTask: MasterTask }
  | { kind: 'grid'; instance: TaskInstance; masterTask: MasterTask; grabOffsetHours: number }

export type DropTarget = {
  dayDate: string   // YYYY-MM-DD
  startHour: number // e.g. 9, 9.5, 10 — the hour under the cursor
}

interface DragContextValue {
  isDragging: boolean
  source: DragSource | null
  cursor: { x: number; y: number }
  dropTarget: DropTarget | null
  startBinDrag: (masterTask: MasterTask, e: React.PointerEvent) => void
  startGridDrag: (
    instance: TaskInstance,
    masterTask: MasterTask,
    grabOffsetHours: number,
    e: React.PointerEvent,
  ) => void
  setDropTarget: (target: DropTarget | null) => void
}

const DragContext = createContext<DragContextValue | null>(null)

export function DragProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<DragSource | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  // Refs so the pointerup handler always reads the latest values without
  // needing to be recreated on every state change.
  const sourceRef = useRef(source)
  const dropTargetRef = useRef(dropTarget)
  useEffect(() => { sourceRef.current = source }, [source])
  useEffect(() => { dropTargetRef.current = dropTarget }, [dropTarget])

  const { addInstance, moveInstance } = usePlannerStore()

  const isDragging = source !== null

  const startBinDrag = useCallback((masterTask: MasterTask, e: React.PointerEvent) => {
    e.preventDefault()
    setSource({ kind: 'bin', masterTask })
    setCursor({ x: e.clientX, y: e.clientY })
  }, [])

  const startGridDrag = useCallback((
    instance: TaskInstance,
    masterTask: MasterTask,
    grabOffsetHours: number,
    e: React.PointerEvent,
  ) => {
    e.preventDefault()
    setSource({ kind: 'grid', instance, masterTask, grabOffsetHours })
    setCursor({ x: e.clientX, y: e.clientY })
  }, [])

  // Attach/detach global pointer listeners only while dragging.
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent) => {
      setCursor({ x: e.clientX, y: e.clientY })
    }

    const handleUp = () => {
      const src = sourceRef.current
      const target = dropTargetRef.current

      if (src && target) {
        if (src.kind === 'bin') {
          addInstance({
            masterTaskId: src.masterTask.id,
            dayDate: target.dayDate,
            startHour: target.startHour,
            duration: 1,
          })
        } else {
          // Adjust start so the grabbed point aligns with the drop cursor hour
          const rawStart = target.startHour - src.grabOffsetHours
          const snapped = Math.round(rawStart * 2) / 2
          const clamped = Math.max(GRID_START, Math.min(GRID_END - 0.5, snapped))
          moveInstance(src.instance.id, target.dayDate, clamped)
        }
      }

      setSource(null)
      setDropTarget(null)
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)

    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging, addInstance, moveInstance])

  return (
    <DragContext.Provider value={{
      isDragging,
      source,
      cursor,
      dropTarget,
      startBinDrag,
      startGridDrag,
      setDropTarget,
    }}>
      {children}
    </DragContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDrag() {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDrag must be used within DragProvider')
  return ctx
}
