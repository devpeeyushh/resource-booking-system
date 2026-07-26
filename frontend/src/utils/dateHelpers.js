// Formats an ISO string / Date as a local time, e.g. "9:00 AM"
export function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Formats an ISO string / Date as a local date, e.g. "Fri, Jul 25"
export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Today's date as YYYY-MM-DD, for date input defaults and API params
export function todayIso() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Converts a YYYY-MM-DD + HH:mm local pair into an ISO string (UTC) for the API
export function toIsoDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

// Splits an ISO datetime into local { date: 'YYYY-MM-DD', time: 'HH:mm' } --
// used to prefill the booking edit form's separate date/time inputs.
export function fromIsoDateTime(iso) {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` }
}

// Duration between two ISO timestamps as "1h 30m"
export function formatDuration(startIso, endIso) {
  const ms = new Date(endIso) - new Date(startIso)
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
