import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import ErrorBanner from '../components/common/ErrorBanner'
import Modal from '../components/common/Modal'
import BookingForm from '../components/bookings/BookingForm'
import BookingList from '../components/bookings/BookingList'
import ResourceSelect from '../components/resources/ResourceSelect'
import { useResources } from '../hooks/useResources'
import { useBookings } from '../hooks/useBookings'
import { useToast } from '../context/ToastContext'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function BookingsPage() {
  const { resources } = useResources()
  const [resourceFilter, setResourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filters = useMemo(
    () => ({
      ...(resourceFilter && { resourceId: resourceFilter }),
      ...(statusFilter && { status: statusFilter }),
    }),
    [resourceFilter, statusFilter]
  )

  const { bookings, loading, refreshing, error, refetch, create, update, remove } = useBookings(filters)
  const { showToast } = useToast()

  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [activeBooking, setActiveBooking] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const resourceMap = useMemo(
    () => Object.fromEntries(resources.map((r) => [r.id, r.name])),
    [resources]
  )

  const openCreate = () => {
    setActiveBooking(null)
    setModalMode('create')
  }

  const openEdit = (booking) => {
    setActiveBooking(booking)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setActiveBooking(null)
  }

  const handleSubmit = async (data) => {
    if (modalMode === 'edit') {
      await update(activeBooking.id, data)
      showToast('Booking updated')
    } else {
      await create(data)
      showToast('Booking created')
    }
    closeModal()
  }

  const handleDeleteConfirm = async () => {
    try {
      await remove(deleteTarget.id)
      showToast('Booking deleted')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="All reservations across every resource."
        actions={
          <div className="flex items-center gap-3">
            {refreshing && (
              <span className="flex items-center gap-1.5 font-mono text-xs text-ink-faint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Refreshing
              </span>
            )}
            <Button onClick={openCreate}>New booking</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <ResourceSelect resources={resources} value={resourceFilter} onChange={setResourceFilter} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {loading ? (
        <Loader label="Loading bookings..." />
      ) : (
        <BookingList
          bookings={bookings}
          resourceMap={resourceMap}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onCreate={openCreate}
        />
      )}

      {modalMode && (
        <Modal title={modalMode === 'edit' ? 'Edit booking' : 'New booking'} onClose={closeModal}>
          <BookingForm
            resources={resources}
            booking={activeBooking}
            defaultResourceId={resourceFilter}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete booking" onClose={() => setDeleteTarget(null)} width="max-w-sm">
          <p className="text-sm text-ink-muted">
            Delete <span className="font-medium text-ink">{deleteTarget.title}</span>? This can't
            be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
