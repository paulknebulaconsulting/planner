# Copilot Instructions for Weekly Planner

## Build & Test Commands

### Development
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build: runs TypeScript check, then vite build
npm run lint         # ESLint check (includes TypeScript, React, React Hooks rules)
npm run preview      # Preview production build
```

**Running a single test:** This project currently has no test suite. Consider adding Jest or Vitest if test coverage is needed.

**Useful during development:**
- TypeScript compiler runs as part of build; fix TS errors before linting
- ESLint enforces React Hook rules (react-hooks/rules-of-hooks) and React Refresh rules

## Architecture Overview

### Data Model
The app uses two complementary Zustand store objects:

- **MasterTask**: The template/definition of a task (id, title, description). Stored in `masterTasks[]` in the TaskBin sidebar.
- **TaskInstance**: A specific placement of a task on the calendar (masterTaskId, dayDate, startHour, duration). Stored in `scheduledInstances[]` on the grid.

This separation allows the same task to be scheduled multiple times in different time slots.

### Component Structure
- **App.tsx**: Main orchestrator. Handles drag-and-drop logic via @dnd-kit/core. Manages activeId for drag overlay and editingData for the modal.
- **TaskBin**: Left sidebar. Lists all MasterTasks. Dragging a master task creates a new instance.
- **DayColumn**: Displays a single day with hour slots (7 AM - 7 PM). Contains TaskCard instances positioned absolutely by `startHour`.
- **TaskCard**: Reusable task display (forwardRef). Handles drag handle attachment, inline edit/delete buttons, and resize handles. Contains careful positioning logic (see "Positioning" below).
- **EditTaskModal**: Modal for editing MasterTask or TaskInstance properties.
- **DraggableTaskCard**: Wrapper around TaskCard that attaches @dnd-kit drag handlers.

### State Management
- **Zustand with persist middleware**: usePlannerStore in `src/store/usePlannerStore.ts`
- Storage key: `planner-storage-v2` (updates when schema changes; increment for breaking changes)
- Actions:
  - Master tasks: addMasterTask, updateMasterTask, deleteMasterTask
  - Instances: addInstance, moveInstance, updateInstance, deleteInstance
  - Navigation: nextWeek, prevWeek, resetToToday
- All state persists to localStorage automatically

### Drag-and-Drop System
- Uses @dnd-kit with PointerSensor (5px activation distance)
- Collision detection: `pointerWithin`
- Drop zones encoded in `over.data.current`: `{ dayDate, startHour, type? }`
- Active item data structure: `{ type: 'master' | 'instance', masterTask, instance? }`
- Drag overlay uses DragOverlay component for smooth visual feedback

## Key Conventions & Patterns

### Positioning (CRITICAL)
TaskCard uses absolute positioning on the grid. The position formula is:
```javascript
top: (instance && !isActuallyFloating) ? `${(instance.startHour - 7) * 4}rem` : undefined
```
- `startHour - 7` converts 24-hour format (7 AM = hour 7) to grid offset
- Multiply by 4 because each hour = 4rem in the CSS grid
- `isActuallyFloating` = true only for DragOverlay; grid items must always set top to prevent dnd-kit transform jitter

### Drag & Drop Animation Rules
**DO NOT** apply CSS transitions while dragging or resizing:
- `isDragging=true`: dnd-kit controls position via `transform`, let it do its job
- `isResizing=true`: Resize handler controls position via store updates, no transitions
- Transitions enabled only when settled: `!(isDragging || isOverlay || isResizing) && 'transition-all duration-200'`
- This prevents conflicting animations between CSS transitions and dnd-kit transforms

### Resize Calculation Strategy
To avoid jitter during resize, **always calculate relative to original values captured in refs**:
```javascript
// On resize start: capture original values
startStartHour.current = instance.startHour
startDuration.current = instance.duration

// During mouse move: calculate from originals, not live instance
const newStartHour = startStartHour.current + deltaHours
const newDuration = startDuration.current + deltaHours
```
Never calculate like `instance.startHour + deltaHours` because `instance` may be stale from previous renders.

### Date Handling
- Dates stored as ISO strings (`YYYY-MM-DD`)
- `currentWeekStart` is always a Monday (handled by `getMonday()` helper)
- 5-day view: Monday–Friday only (weekdays 7 AM – 7 PM)
- Past day detection: compare day to today's date; apply read-only styling and disable drag handles

### ID Generation
All IDs (tasks, instances) use `Math.random().toString(36).substring(2, 9)` (8 chars). Replace with a stronger UUID library if needed for production.

### Tailwind + clsx + twMerge
- Use the `cn()` utility (TaskCard.tsx) for conditional classes: `cn(baseClass, condition && variantClass)`
- Always use `clsx` + `twMerge` to merge and override Tailwind utilities safely

### Component Props
- Pass `isAnyTaskDragging` to components to disable interactions while dragging (improves UX, enables drop-through)
- Use forwardRef for components that receive dnd-kit handlers (TaskCard, DraggableTaskCard)
- Refs are attached via `{...listeners}` and `{...attributes}` from dnd-kit

### TypeScript Types
- Import types from `store/usePlannerStore.ts` where applicable (MasterTask, TaskInstance)
- Use `React.CSSProperties` for inline styles; use `React.MouseEvent` for event handlers
- Component props should be explicit interfaces; avoid implicit `any`

## Git & Commits

- Follow conventional commits where possible
- Include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer in commit messages

## Future Development

See [ROADMAP.md](../ROADMAP.md) for planned features (task resizing, color coding, dark mode, recurring tasks, multi-week support, etc.). The codebase is structured to accommodate these additions without major refactoring.
