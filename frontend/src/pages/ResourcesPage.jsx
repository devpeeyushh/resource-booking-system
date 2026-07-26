import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import ErrorBanner from '../components/common/ErrorBanner'
import Modal from '../components/common/Modal'
import ResourceForm from '../components/resources/ResourceForm'
import ResourceList from '../components/resources/ResourceList'
import ResourceSelect from '../components/resources/ResourceSelect'
import DayViewGrid from '../components/bookings/DayViewGrid'
import { useResources } from '../hooks/useResources'
import { useDayView } from '../hooks/useDayView'
import { useToast } from '../context/ToastContext'
import { todayIso } from '../utils/dateHelpers'

export default function ResourcesPage() {
  const { resources, loading, refreshing, error, refetch, create, update, remove } = useResources()
  const { showToast } = useToast()

  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [activeResource, setActiveResource] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [dayViewResourceId, setDayViewResourceId] = useState('')
  const [dayViewDate, setDayViewDate] = useState(todayIso())
  const { dayView, loading: dayViewLoading, error: dayViewError, refetch: refetchDayView } = useDayView(
    dayViewResourceId,
    dayViewDate
  )

  const openCreate = () => {
    setActiveResource(null)
    setModalMode('create')
  }

  const openEdit = (resource) => {
    setActiveResource(resource)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setActiveResource(null)
  }

  const handleSubmit = async (data) => {
    if (modalMode === 'edit') {
      await update(activeResource.id, data)
      showToast('Resource updated')
    } else {
      await create(data)
      showToast('Resource created')
    }
    closeModal()
  }

  const handleDeleteConfirm = async () => {
    try {
      await remove(deleteTarget.id)
      showToast('Resource deleted')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleViewDayView = (resource) => {
    setDayViewResourceId(resource.id)
    // Scroll the day view into focus on mobile
    document.getElementById('day-view-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <PageHeader
          title="Resources"
          subtitle="Rooms, equipment, and anything else people can reserve."
          actions={
            <div className="flex items-center gap-3">
              {refreshing && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-ink-faint">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Refreshing
                </span>
              )}
              <Button onClick={openCreate}>Add resource</Button>
            </div>
          }
        />

        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {loading ? (
          <Loader label="Loading resources..." />
        ) : (
          <ResourceList
            resources={resources}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onViewDayView={handleViewDayView}
            onCreate={openCreate}
          />
        )}
      </div>

      <div id="day-view-section">
        <PageHeader title="Day view" subtitle="See booked and free slots for a resource." />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <ResourceSelect
              resources={resources}
              value={dayViewResourceId}
              onChange={setDayViewResourceId}
            />
          </div>
          <input
            type="date"
            value={dayViewDate}
            onChange={(e) => setDayViewDate(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {dayViewError && <ErrorBanner message={dayViewError} onRetry={refetchDayView} />}

        {!dayViewResourceId ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-ink-muted">
            Select a resource above to see its schedule for the day.
          </p>
        ) : dayViewLoading ? (
          <Loader label="Loading day view..." />
        ) : (
          <DayViewGrid dayView={dayView} date={dayViewDate} />
        )}
      </div>

      {modalMode && (
        <Modal title={modalMode === 'edit' ? 'Edit resource' : 'Add resource'} onClose={closeModal}>
          <ResourceForm
            initialValues={activeResource || undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete resource" onClose={() => setDeleteTarget(null)} width="max-w-sm">
          <p className="text-sm text-ink-muted">
            Delete <span className="font-medium text-ink">{deleteTarget.name}</span>? This also
            removes all of its bookings. This can't be undone.
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
