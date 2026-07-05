import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DdayPill } from '../common/DdayPill'
import type { Event } from '../../types/database'

interface EventCardProps {
  event: Event
  onToggleComplete: (event: Event) => void
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

export function EventCard({ event, onToggleComplete, onEdit, onDelete }: EventCardProps) {
  return (
    <div className={`event-card${event.is_completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        checked={event.is_completed}
        onChange={() => onToggleComplete(event)}
        aria-label="완료 여부"
      />
      <div className="event-card-body">
        <div className="event-card-header">
          <strong>{event.event_type}</strong>
          <DdayPill date={event.event_date} isCompleted={event.is_completed} />
        </div>
        <div className="event-card-meta">
          {format(new Date(event.event_date), 'yyyy.MM.dd (EEE) HH:mm', { locale: ko })}
          {event.location && ` · ${event.location}`}
        </div>
        {event.memo && <p className="event-card-memo">{event.memo}</p>}
      </div>
      <div className="event-card-actions">
        <button type="button" onClick={() => onEdit(event)}>
          수정
        </button>
        <button type="button" onClick={() => onDelete(event)}>
          삭제
        </button>
      </div>
    </div>
  )
}
