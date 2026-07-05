import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApplication } from '../hooks/useApplication'
import { useEvents } from '../hooks/useEvents'
import { EventTimeline } from '../components/events/EventTimeline'
import { EventFormModal } from '../components/events/EventFormModal'
import type { EventFormValues } from '../components/events/EventFormModal'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { Modal } from '../components/common/Modal'
import { StatusBadge } from '../components/common/StatusBadge'
import { PlatformBadge } from '../components/common/PlatformBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import type { Event } from '../types/database'

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const applicationId = id as string
  const { application, loading: appLoading, error: appError, updateApplication } = useApplication(applicationId)
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents(applicationId)

  const [showEditApplication, setShowEditApplication] = useState(false)
  const [eventModalTarget, setEventModalTarget] = useState<Event | 'new' | null>(null)

  if (appLoading) return <LoadingSpinner />
  if (!application) return <ErrorBanner message={appError ?? '지원 정보를 찾을 수 없어요.'} />

  async function handleEventSubmit(values: EventFormValues) {
    const isoDate = new Date(values.event_date).toISOString()
    if (eventModalTarget && eventModalTarget !== 'new') {
      return updateEvent(eventModalTarget.id, {
        event_type: values.event_type,
        event_date: isoDate,
        location: values.location || null,
        memo: values.memo || null,
      })
    }
    return createEvent({ ...values, event_date: isoDate })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{application.company_name}</h1>
          <div className="application-card-meta">
            <StatusBadge status={application.status} />
            <PlatformBadge platform={application.platform} />
          </div>
        </div>
        <button type="button" onClick={() => setShowEditApplication(true)}>
          정보 수정
        </button>
      </div>

      {application.memo && <p className="application-memo">{application.memo}</p>}

      <div className="page-header">
        <h2>일정</h2>
        <button type="button" onClick={() => setEventModalTarget('new')}>
          + 일정 추가
        </button>
      </div>

      {eventsError && <ErrorBanner message={eventsError} />}
      {eventsLoading ? (
        <LoadingSpinner />
      ) : (
        <EventTimeline
          events={events}
          onToggleComplete={(event) => void updateEvent(event.id, { is_completed: !event.is_completed })}
          onEdit={(event) => setEventModalTarget(event)}
          onDelete={(event) => {
            if (confirm('이 일정을 삭제할까요?')) void deleteEvent(event.id)
          }}
        />
      )}

      {eventModalTarget && (
        <EventFormModal
          initial={eventModalTarget === 'new' ? undefined : eventModalTarget}
          onClose={() => setEventModalTarget(null)}
          onSubmit={handleEventSubmit}
        />
      )}

      {showEditApplication && (
        <Modal onClose={() => setShowEditApplication(false)}>
          <h2>지원 정보 수정</h2>
          <ApplicationForm
            initial={application}
            submitLabel="저장"
            onCancel={() => setShowEditApplication(false)}
            onSubmit={async (values) => {
              const result = await updateApplication({
                company_name: values.company_name,
                position: values.position || null,
                platform: values.platform || null,
                status: values.status,
                applied_date: values.applied_date || null,
                memo: values.memo || null,
              })
              if (!result.error) setShowEditApplication(false)
              return result
            }}
          />
        </Modal>
      )}
    </div>
  )
}
