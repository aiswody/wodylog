import { buildMonthGrid, dateKey, hasCollision, hasUrgentCollision } from '../../lib/dateUtils'
import { CalendarDayCell } from './CalendarDayCell'
import type { EventWithApplication } from '../../types/domain'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarMonthViewProps {
  monthDate: Date
  eventsByDate: Map<string, EventWithApplication[]>
  onEventClick: (event: EventWithApplication) => void
}

export function CalendarMonthView({ monthDate, eventsByDate, onEventClick }: CalendarMonthViewProps) {
  const days = buildMonthGrid(monthDate)

  return (
    <div className="calendar-month-view">
      <div className="calendar-weekday-row">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((date) => {
          const events = eventsByDate.get(dateKey(date)) ?? []
          return (
            <CalendarDayCell
              key={date.toISOString()}
              date={date}
              currentMonth={monthDate}
              events={events}
              isCollision={hasCollision(events)}
              isUrgent={hasUrgentCollision(events)}
              onEventClick={onEventClick}
            />
          )
        })}
      </div>
    </div>
  )
}
