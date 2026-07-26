import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDate, formatTime, formatDuration } from '../../utils/dateHelpers'

export default function BookingRow({ booking, resourceName, onEdit, onDelete }) {
  const isCancelled = booking.status === 'CANCELLED'

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-5 pr-4">
        <div className="font-medium text-ink">{booking.title}</div>
        <div className="text-xs text-ink-faint">{booking.bookedBy}</div>
      </td>
      <td className="py-3 pr-4 text-sm text-ink-muted">{resourceName}</td>
      <td className="py-3 pr-4 text-sm text-ink">
        {formatDate(booking.startTime)}
        <div className="font-mono text-xs text-ink-muted">
          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          <span className="text-ink-faint"> ({formatDuration(booking.startTime, booking.endTime)})</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <Badge tone={isCancelled ? 'neutral' : 'accent'}>{booking.status}</Badge>
      </td>
      <td className="py-3 pr-5 text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onEdit(booking)}>
            Edit
          </Button>
          <Button variant="ghost" onClick={() => onDelete(booking)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  )
}
