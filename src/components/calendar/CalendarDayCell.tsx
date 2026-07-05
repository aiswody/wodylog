import { isSameDay, isSameMonth } from 'date-fns'
import type { EventWithApplication } from '../../types/domain'

interface CalendarDayCellProps {
  date: Date
  currentMonth?: Date
  events: EventWithApplication[]
  isCollision: boolean
  isUrgent: boolean
  onEventClick: (event: EventWithApplication) => void
}

const MAX_VISIBLE = 3

export function CalendarDayCell({
  date,
  currentMonth,
  events,
  isCollision,
  isUrgent,
  onEventClick,
}: CalendarDayCellProps) {
  const isToday = isSameDay(date, new Date())
  const isOutside = currentMonth ? !isSameMonth(date, currentMonth) : false
  const visible = events.slice(0, MAX_VISIBLE)
  const hiddenCount = events.length - visible.length

  const classNames = ['calendar-day-cell']
  if (isToday) classNames.push('today')
  if (isOutside) classNames.push('outside-month')
  if (isCollision) classNames.push('collision')
  if (isUrgent) classNames.push('urgent')

  return (
    <div className={classNames.join(' ')}>
      <div className="calendar-day-number">{date.getDate()}</div>
      <div className="calendar-day-events">
        {visible.map((event) => (
          <button
            key={event.id}
            type="button"
            className={`calendar-event-chip${event.is_completed ? ' completed' : ''}`}
            onClick={() => onEventClick(event)}
            title={`${event.application.company_name} · ${event.event_type}`}
          >
            {event.application.company_name} · {event.event_type}
          </button>
        ))}
        {hiddenCount > 0 && <span className="calendar-more">+{hiddenCount}</span>}
      </div>
    </div>
  )
}
