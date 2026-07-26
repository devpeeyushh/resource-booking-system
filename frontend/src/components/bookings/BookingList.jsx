import BookingRow from './BookingRow'
import EmptyState from '../common/EmptyState'
import Button from '../common/Button'

export default function BookingList({ bookings, resourceMap, onEdit, onDelete, onCreate }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Create a booking to reserve a resource for a specific time."
        action={<Button onClick={onCreate}>New booking</Button>}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-5 py-3 font-medium">Booking</th>
            <th className="px-0 py-3 font-medium">Resource</th>
            <th className="px-0 py-3 font-medium">When</th>
            <th className="px-0 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="px-5">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              resourceName={resourceMap[booking.resourceId] || 'Unknown resource'}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
