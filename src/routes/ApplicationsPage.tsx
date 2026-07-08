import { useMemo, useState } from 'react'
import { useApplications } from '../hooks/useApplications'
import { useResumeVersions } from '../hooks/useResumeVersions'
import { useApplicationResumeLinks } from '../hooks/useApplicationResumeLinks'
import { ApplicationCard } from '../components/applications/ApplicationCard'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ApplicationFilterBar } from '../components/applications/ApplicationFilterBar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { supabase } from '../lib/supabaseClient'

export function ApplicationsPage() {
  const { applications, loading, error, createApplication } = useApplications()
  const { versions: resumeVersions } = useResumeVersions()
  const { mapByApplicationId: resumeLinks, refetch: refetchResumeLinks } = useApplicationResumeLinks()
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [showForm, setShowForm] = useState(false)

  const visible = useMemo(() => {
    const filtered = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications
    return [...filtered].sort((a, b) => {
      const dateA = a.applied_date ?? ''
      const dateB = b.applied_date ?? ''
      return sortOrder === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)
    })
  }, [applications, statusFilter, sortOrder])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1>지원 목록</h1>
        <button type="button" onClick={() => setShowForm(true)}>
          + 새 지원 추가
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <ApplicationFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {visible.length === 0 ? (
        <p className="empty-state">아직 등록된 지원이 없어요. 새 지원을 추가해보세요.</p>
      ) : (
        <div className="application-list">
          {visible.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              resumeVersionNames={resumeLinks.get(application.id)?.map((v) => v.version_name)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>새 지원 추가</h2>
          <ApplicationForm
            submitLabel="추가"
            resumeVersions={resumeVersions}
            onCancel={() => setShowForm(false)}
            onSubmit={async (values) => {
              const result = await createApplication(values)
              if (result.error || !result.applicationId) return { error: result.error }

              if (values.resume_version_id) {
                const { error: linkError } = await supabase
                  .from('application_resumes')
                  .insert({ application_id: result.applicationId, resume_version_id: values.resume_version_id })
                if (linkError) return { error: linkError.message }
                await refetchResumeLinks()
              }

              setShowForm(false)
              return { error: null }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
