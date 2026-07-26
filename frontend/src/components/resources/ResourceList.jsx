import ResourceCard from './ResourceCard'
import EmptyState from '../common/EmptyState'
import Button from '../common/Button'

export default function ResourceList({ resources, onEdit, onDelete, onViewDayView, onCreate }) {
  if (resources.length === 0) {
    return (
      <EmptyState
        title="No resources yet"
        description="Add a room, a piece of equipment, or anything else people need to book."
        action={<Button onClick={onCreate}>Add resource</Button>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDayView={onViewDayView}
        />
      ))}
    </div>
  )
}
