export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3">
      <div className="flex gap-2 text-sm text-danger">
        <span aria-hidden="true">⚠</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-danger underline underline-offset-2 hover:text-danger-hover"
        >
          Retry
        </button>
      )}
    </div>
  )
}
