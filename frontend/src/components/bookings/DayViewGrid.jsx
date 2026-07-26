import { formatTime, formatDuration, todayIso } from '../../utils/dateHelpers'

const MINUTES_IN_DAY = 24 * 60
const PX_PER_MINUTE = 1.1 // 24h * 60 * 1.1 ≈ 1584px tall

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

export default function DayViewGrid({ dayView, date, onSlotClick }) {
  if (!dayView) return null

  const dayStart = new Date(dayView.dayStart)
  const isToday = date === todayIso()
  const now = new Date()
  const nowOffsetMinutes = isToday ? minutesSinceMidnight(now) : null

  const toOffset = (iso) => {
    const d = new Date(iso)
    return ((d - dayStart) / 60000) * PX_PER_MINUTE
  }
  const toHeight = (startIso, endIso) => {
    const startD = new Date(startIso)
    const endD = new Date(endIso)
    return Math.max(((endD - startD) / 60000) * PX_PER_MINUTE, 20)
  }

  const hourMarks = Array.from({ length: 25 }, (_, h) => h)

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="relative flex" style={{ height: MINUTES_IN_DAY * PX_PER_MINUTE }}>
        {/* Hour ruler */}
        <div className="relative w-14 shrink-0 select-none font-mono text-xs text-ink-faint">
          {hourMarks.map((h) => (
            <div
              key={h}
              className="absolute -translate-y-1/2"
              style={{ top: h * 60 * PX_PER_MINUTE }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Timeline track */}
        <div className="relative flex-1 border-l border-border">
          {/* Hour gridlines */}
          {hourMarks.map((h) => (
            <div
              key={h}
              className="absolute inset-x-0 border-t border-border/70"
              style={{ top: h * 60 * PX_PER_MINUTE }}
            />
          ))}

          {/* Free slots (hatched) */}
          {dayView.freeSlots.map((slot, i) => (
            <button
              key={`free-${i}`}
              onClick={() => onSlotClick?.(slot)}
              className="pattern-free absolute inset-x-1 rounded-md text-left transition-opacity hover:opacity-80"
              style={{ top: toOffset(slot.start), height: toHeight(slot.start, slot.end) }}
              title={`Free ${formatTime(slot.start)} – ${formatTime(slot.end)}`}
            >
              {toHeight(slot.start, slot.end) > 32 && (
                <span className="absolute left-2 top-1 font-mono text-[11px] text-ink-faint">
                  Free · {formatDuration(slot.start, slot.end)}
                </span>
              )}
            </button>
          ))}

          {/* Booked slots (solid) */}
          {dayView.bookedSlots.map((slot) => (
            <div
              key={slot.bookingId}
              className="absolute inset-x-1 overflow-hidden rounded-md bg-accent px-2 py-1 text-white shadow-sm"
              style={{ top: toOffset(slot.start), height: toHeight(slot.start, slot.end) }}
              title={`${slot.title}: ${formatTime(slot.start)} – ${formatTime(slot.end)}`}
            >
              <p className="truncate text-xs font-semibold">{slot.title}</p>
              <p className="truncate font-mono text-[11px] text-white/80">
                {formatTime(slot.start)} – {formatTime(slot.end)}
              </p>
            </div>
          ))}

          {/* "Now" marker */}
          {nowOffsetMinutes !== null && (
            <div
              className="absolute inset-x-0 z-10 flex items-center"
              style={{ top: nowOffsetMinutes * PX_PER_MINUTE }}
            >
              <span className="-ml-1 h-2 w-2 rounded-full bg-danger" />
              <span className="h-px flex-1 bg-danger" />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-accent" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="pattern-free h-3 w-3 rounded border border-border" /> Free
        </span>
        {isToday && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Now
          </span>
        )}
      </div>
    </div>
  )
}
