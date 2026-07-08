import { useMemo, useState } from 'react'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { useApplications } from '../hooks/useApplications'
import { useUpcomingEvents } from '../hooks/useUpcomingEvents'
import { useGoogleCalendarSync } from '../context/GoogleCalendarSyncContext'
import { StatusSummaryCards } from '../components/dashboard/StatusSummaryCards'
import { UpcomingEventsList } from '../components/dashboard/UpcomingEventsList'
import { PushReminderPanel } from '../components/dashboard/PushReminderPanel'
import { EventFormModal } from '../components/events/EventFormModal'
import type { EventFormValues } from '../components/events/EventFormModal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { supabase } from '../lib/supabaseClient'
import type { EventWithApplication } from '../types/domain'

export function DashboardPage() {
  const { applications, loading: appsLoading, error: appsError } = useApplications()

  const { rangeStart, rangeEnd } = useMemo(() => {
    const start = startOfDay(new Date())
    const end = endOfDay(addDays(start, 6))
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() }
  }, [])

  const { events, loading: eventsLoading, error: eventsError, refetch } = useUpcomingEvents(rangeStart, rangeEnd)
  const { syncEvent } = useGoogleCalendarSync()
  const [editingEvent, setEditingEvent] = useState<EventWithApplication | null>(null)

  const pendingEvents = useMemo(() => events.filter((e) => !e.is_completed), [events])
  const completedEvents = useMemo(() => events.filter((e) => e.is_completed), [events])

  async function toggleComplete(event: EventWithApplication) {
    await supabase.from('events').update({ is_completed: !event.is_completed }).eq('id', event.id)
    await refetch()
    syncEvent('update', { ...event, is_completed: !event.is_completed }, event.application.company_name)
  }

  async function deleteEvent(event: EventWithApplication) {
    if (!confirm('이 일정을 삭제할까요?')) return
    await supabase.from('events').delete().eq('id', event.id)
    await refetch()
    syncEvent('delete', event, event.application.company_name)
  }

  async function handleEventSubmit(values: EventFormValues) {
    if (!editingEvent) return { error: null }
    const isoDate = new Date(values.event_date).toISOString()
    const patch = {
      event_type: values.event_type,
      event_date: isoDate,
      location: values.location || null,
      memo: values.memo || null,
      is_completed: values.is_completed,
    }
    const { error } = await supabase.from('events').update(patch).eq('id', editingEvent.id)
    if (error) return { error: error.message }
    await refetch()
    syncEvent('update', { ...editingEvent, ...patch }, editingEvent.application.company_name)
    return { error: null }
  }

  return (
    <div>
      <h1>대시보드</h1>

      <PushReminderPanel />

      {appsError && <ErrorBanner message={appsError} />}
      {appsLoading ? <LoadingSpinner /> : <StatusSummaryCards applications={applications} />}

      <h2 className="dashboard-section-title">이번 주 안에 다가오는 일정</h2>
      {eventsError && <ErrorBanner message={eventsError} />}
      {eventsLoading ? (
        <LoadingSpinner />
      ) : (
        <UpcomingEventsList
          events={pendingEvents}
          onToggleComplete={(event) => void toggleComplete(event)}
          onEdit={setEditingEvent}
          onDelete={(event) => void deleteEvent(event)}
        />
      )}

      <h2 className="dashboard-section-title">완료한 일정</h2>
      {!eventsLoading && (
        <UpcomingEventsList
          events={completedEvents}
          emptyText="이번 주 안에 완료 처리한 일정이 없어요."
          onToggleComplete={(event) => void toggleComplete(event)}
          onEdit={setEditingEvent}
          onDelete={(event) => void deleteEvent(event)}
        />
      )}

      {editingEvent && (
        <EventFormModal initial={editingEvent} onClose={() => setEditingEvent(null)} onSubmit={handleEventSubmit} />
      )}
    </div>
  )
}
