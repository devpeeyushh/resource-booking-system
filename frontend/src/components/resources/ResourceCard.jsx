import Badge from '../common/Badge'
import Button from '../common/Button'

export default function ResourceCard({ resource, onEdit, onDelete, onViewDayView }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{resource.name}</h3>
          {resource.category && (
            <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-faint">
              {resource.category}
            </p>
          )}
        </div>
        <Badge tone={resource.isActive ? 'accent' : 'neutral'}>
          {resource.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {resource.description && (
        <p className="text-sm text-ink-muted line-clamp-2">{resource.description}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="soft" onClick={() => onViewDayView(resource)}>
          Day view
        </Button>
        <Button variant="ghost" onClick={() => onEdit(resource)}>
          Edit
        </Button>
        <Button variant="ghost" onClick={() => onDelete(resource)}>
          Delete
        </Button>
      </div>
    </div>
  )
}
