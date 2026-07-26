import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import Loader from '../components/common/Loader'
import ErrorBanner from '../components/common/ErrorBanner'
import EmptyState from '../components/common/EmptyState'
import Badge from '../components/common/Badge'
import { useResources } from '../hooks/useResources'
import { useBookings } from '../hooks/useBookings'
import { getHealth } from '../api/health.api'
import { formatTime, formatDate } from '../utils/dateHelpers'

function useTodayRange() {
  return useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [])
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { from, to } = useTodayRange()
  const { resources, loading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useResources()
  const {
    bookings: todaysBookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookings({ from, to, status: 'CONFIRMED' })

  const [health, setHealth] = useState('checking')

  useEffect(() => {
    getHealth()
      .then(() => setHealth('ok'))
      .catch(() => setHealth('down'))
  }, [])

  const resourceMap = useMemo(
    () => Object.fromEntries(resources.map((r) => [r.id, r.name])),
    [resources]
  )

  const loading = resourcesLoading || bookingsLoading
  const error = resourcesError || bookingsError

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A quick look at today's activity across all resources."
        actions={
          <Badge tone={health === 'ok' ? 'accent' : health === 'down' ? 'danger' : 'neutral'}>
            {health === 'ok' ? 'API connected' : health === 'down' ? 'API unreachable' : 'Checking...'}
          </Badge>
        }
      />

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => {
            refetchResources()
            refetchBookings()
          }}
        />
      )}

      {loading ? (
        <Loader label="Loading dashboard..." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total resources" value={resources.length} />
            <StatCard
              label="Active resources"
              value={resources.filter((r) => r.isActive).length}
            />
            <StatCard label="Bookings today" value={todaysBookings.length} />
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Today's bookings</h2>
            {todaysBookings.length === 0 ? (
              <EmptyState
                title="Nothing booked today"
                description="Head to Bookings to reserve a resource for today."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {todaysBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{b.title}</p>
                      <p className="text-xs text-ink-muted">
                        {resourceMap[b.resourceId] || 'Unknown resource'} · {b.bookedBy}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-ink-muted">
                      {formatDate(b.startTime)} · {formatTime(b.startTime)}–{formatTime(b.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/resources"
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-black/5"
            >
              Manage resources →
            </Link>
            <Link
              to="/bookings"
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-black/5"
            >
              Manage bookings →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
