import { useMemo, useState } from 'react'
import { useApplications } from '../hooks/useApplications'
import { ApplicationCard } from '../components/applications/ApplicationCard'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ApplicationFilterBar } from '../components/applications/ApplicationFilterBar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'

export function ApplicationsPage() {
  const { applications, loading, error, createApplication } = useApplications()
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
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>새 지원 추가</h2>
          <ApplicationForm
            submitLabel="추가"
            onCancel={() => setShowForm(false)}
            onSubmit={async (values) => {
              const result = await createApplication(values)
              if (!result.error) setShowForm(false)
              return result
            }}
          />
        </Modal>
      )}
    </div>
  )
}
