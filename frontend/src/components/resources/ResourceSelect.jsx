export default function ResourceSelect({ resources, value, onChange, error, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-black/5"
      >
        <option value="">Select a resource...</option>
        {resources.map((r) => (
          <option key={r.id} value={r.id} disabled={!r.isActive}>
            {r.name}
            {!r.isActive ? ' (inactive)' : ''}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
