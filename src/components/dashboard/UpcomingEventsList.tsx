import { EventCard } from '../events/EventCard'
import { StatusBadge } from '../common/StatusBadge'
import type { EventWithApplication } from '../../types/domain'

interface UpcomingEventsListProps {
  events: EventWithApplication[]
  onToggleComplete: (event: EventWithApplication) => void
  onEdit: (event: EventWithApplication) => void
  onDelete: (event: EventWithApplication) => void
}

export function UpcomingEventsList({ events, onToggleComplete, onEdit, onDelete }: UpcomingEventsListProps) {
  if (events.length === 0) {
    return <p className="empty-state">이번 주(오늘부터 7일) 안에 예정된 일정이 없어요.</p>
  }

  return (
    <div className="event-timeline">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          meta={
            <>
              {event.application.company_name} <StatusBadge status={event.application.status} />
            </>
          }
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
