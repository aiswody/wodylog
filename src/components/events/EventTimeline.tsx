import { EventCard } from './EventCard'
import type { Event } from '../../types/database'

interface EventTimelineProps {
  events: Event[]
  onToggleComplete: (event: Event) => void
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

export function EventTimeline({ events, onToggleComplete, onEdit, onDelete }: EventTimelineProps) {
  if (events.length === 0) return <p className="empty-state">아직 등록된 일정이 없어요.</p>

  return (
    <div className="event-timeline">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
