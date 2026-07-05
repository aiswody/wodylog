import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { buildWeekGrid, dateKey, hasCollision, hasUrgentCollision } from '../../lib/dateUtils'
import { DdayPill } from '../common/DdayPill'
import type { EventWithApplication } from '../../types/domain'

interface CalendarWeekViewProps {
  weekDate: Date
  eventsByDate: Map<string, EventWithApplication[]>
  onEventClick: (event: EventWithApplication) => void
}

export function CalendarWeekView({ weekDate, eventsByDate, onEventClick }: CalendarWeekViewProps) {
  const days = buildWeekGrid(weekDate)

  return (
    <div className="calendar-week-view">
      {days.map((date) => {
        const events = (eventsByDate.get(dateKey(date)) ?? [])
          .slice()
          .sort((a, b) => a.event_date.localeCompare(b.event_date))
        const collision = hasCollision(events)
        const urgent = hasUrgentCollision(events)
        return (
          <div
            key={date.toISOString()}
            className={`calendar-week-day${collision ? ' collision' : ''}${urgent ? ' urgent' : ''}`}
          >
            <div className="calendar-week-day-header">{format(date, 'M.d (EEE)', { locale: ko })}</div>
            {events.length === 0 ? (
              <p className="calendar-week-empty">일정 없음</p>
            ) : (
              <ul className="calendar-week-event-list">
                {events.map((event) => (
                  <li key={event.id}>
                    <button type="button" onClick={() => onEventClick(event)} className="calendar-week-event">
                      <span>{format(new Date(event.event_date), 'HH:mm')}</span>
                      <span>
                        {event.application.company_name} · {event.event_type}
                      </span>
                      <DdayPill date={event.event_date} isCompleted={event.is_completed} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
