import { useMemo, useState } from 'react'
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { CalendarViewToggle } from '../components/calendar/CalendarViewToggle'
import { CalendarMonthView } from '../components/calendar/CalendarMonthView'
import { CalendarWeekView } from '../components/calendar/CalendarWeekView'
import { EventFormModal } from '../components/events/EventFormModal'
import type { EventFormValues } from '../components/events/EventFormModal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { groupEventsByDate } from '../lib/dateUtils'
import { supabase } from '../lib/supabaseClient'
import type { EventWithApplication } from '../types/domain'

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [editingEvent, setEditingEvent] = useState<EventWithApplication | null>(null)

  const rangeStart = viewMode === 'month' ? startOfWeek(startOfMonth(anchorDate)) : startOfWeek(anchorDate)
  const rangeEnd = viewMode === 'month' ? endOfWeek(endOfMonth(anchorDate)) : endOfWeek(anchorDate)

  const { events, loading, error, refetch } = useCalendarEvents(rangeStart.toISOString(), rangeEnd.toISOString())
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])

  function goPrev() {
    setAnchorDate((d) => (viewMode === 'month' ? subMonths(d, 1) : subWeeks(d, 1)))
  }
  function goNext() {
    setAnchorDate((d) => (viewMode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)))
  }
  function goToday() {
    setAnchorDate(new Date())
  }

  async function handleEventSubmit(values: EventFormValues) {
    if (!editingEvent) return { error: null }
    const isoDate = new Date(values.event_date).toISOString()
    const { error } = await supabase
      .from('events')
      .update({
        event_type: values.event_type,
        event_date: isoDate,
        location: values.location || null,
        memo: values.memo || null,
        is_completed: values.is_completed,
      })
      .eq('id', editingEvent.id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  const headerLabel =
    viewMode === 'month'
      ? format(anchorDate, 'yyyy년 M월', { locale: ko })
      : `${format(rangeStart, 'M.d', { locale: ko })} - ${format(rangeEnd, 'M.d', { locale: ko })}`

  return (
    <div>
      <div className="page-header">
        <h1>캘린더</h1>
        <CalendarViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      <div className="calendar-nav">
        <button type="button" onClick={goPrev}>
          이전
        </button>
        <strong>{headerLabel}</strong>
        <button type="button" onClick={goNext}>
          다음
        </button>
        <button type="button" onClick={goToday}>
          오늘
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : viewMode === 'month' ? (
        <CalendarMonthView monthDate={anchorDate} eventsByDate={eventsByDate} onEventClick={setEditingEvent} />
      ) : (
        <CalendarWeekView weekDate={anchorDate} eventsByDate={eventsByDate} onEventClick={setEditingEvent} />
      )}

      {editingEvent && (
        <EventFormModal initial={editingEvent} onClose={() => setEditingEvent(null)} onSubmit={handleEventSubmit} />
      )}
    </div>
  )
}
