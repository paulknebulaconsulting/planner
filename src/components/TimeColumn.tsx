import { format } from 'date-fns'

const PX_PER_HOUR = 64
const GRID_START = 7
const TOTAL_HOURS = 19 - GRID_START

export function TimeColumn() {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START + i)

  return (
    <div className="w-12 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Header spacer to align with day headers */}
      <div className="h-16 border-b border-gray-200" />

      {/* Time labels */}
      <div style={{ height: TOTAL_HOURS * PX_PER_HOUR }} className="relative">
        {hours.map((h) => (
          <div
            key={h}
            style={{ top: (h - GRID_START) * PX_PER_HOUR, height: PX_PER_HOUR }}
            className="absolute left-0 right-0"
          >
            <span className="absolute -top-2 right-1 text-[10px] text-gray-400 font-medium leading-none">
              {format(new Date().setHours(h, 0), 'HH:mm')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
