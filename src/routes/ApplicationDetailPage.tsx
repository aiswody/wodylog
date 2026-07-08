import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApplication } from '../hooks/useApplication'
import { useEvents } from '../hooks/useEvents'
import { useApplicationResumes } from '../hooks/useApplicationResumes'
import { useResumeVersions } from '../hooks/useResumeVersions'
import { EventTimeline } from '../components/events/EventTimeline'
import { EventFormModal } from '../components/events/EventFormModal'
import type { EventFormValues } from '../components/events/EventFormModal'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ResumeUsageList } from '../components/resumes/ResumeUsageList'
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
  } = useEvents(applicationId, application?.company_name ?? '')

  const { linkedVersions, linkVersion, unlinkVersion } = useApplicationResumes(applicationId)
  const { versions: allVersions } = useResumeVersions()

  const [showEditApplication, setShowEditApplication] = useState(false)
  const [eventModalTarget, setEventModalTarget] = useState<Event | 'new' | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState('')

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
        is_completed: values.is_completed,
      })
    }
    return createEvent({
      event_type: values.event_type,
      event_date: isoDate,
      location: values.location,
      memo: values.memo,
    })
  }

  const unlinkedVersions = allVersions.filter((v) => !linkedVersions.some((lv) => lv.id === v.id))

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

      {application.memo && (
        <section className="detail-section">
          <h2>메모</h2>
          <p className="application-memo">{application.memo}</p>
        </section>
      )}

      <section className="detail-section">
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
      </section>

      <section className="detail-section">
        <div className="page-header">
          <h2>연결된 자소서 버전</h2>
        </div>
        <ResumeUsageList
          items={linkedVersions.map((v) => ({ id: v.id, label: v.version_name }))}
          emptyText="아직 연결된 자소서 버전이 없어요."
        />
        {linkedVersions.length > 0 && (
          <div className="resume-link-row">
            {linkedVersions.map((v) => (
              <button key={v.id} type="button" onClick={() => void unlinkVersion(v.id)}>
                {v.version_name} 연결 해제
              </button>
            ))}
          </div>
        )}
        {unlinkedVersions.length > 0 && (
          <div className="resume-link-row">
            <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)}>
              <option value="">자소서 버전 선택</option>
              {unlinkedVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedVersionId}
              onClick={() => {
                if (!selectedVersionId) return
                void linkVersion(selectedVersionId).then(() => setSelectedVersionId(''))
              }}
            >
              연결
            </button>
          </div>
        )}
      </section>

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
