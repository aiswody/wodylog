import { useState } from 'react'
import { useResumeVersions } from '../hooks/useResumeVersions'
import { ResumeVersionCard } from '../components/resumes/ResumeVersionCard'
import { ResumeVersionForm } from '../components/resumes/ResumeVersionForm'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import type { ResumeVersion } from '../types/database'

export function ResumeVersionsPage() {
  const { versions, loading, error, createVersion, updateVersion, deleteVersion } = useResumeVersions()
  const [showForm, setShowForm] = useState(false)
  const [editingVersion, setEditingVersion] = useState<ResumeVersion | null>(null)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1>자소서 버전 관리</h1>
        <button type="button" onClick={() => setShowForm(true)}>
          + 새 버전 추가
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {versions.length === 0 ? (
        <p className="empty-state">아직 등록된 자소서 버전이 없어요.</p>
      ) : (
        <div className="resume-version-list">
          {versions.map((version) => (
            <ResumeVersionCard
              key={version.id}
              version={version}
              onEdit={setEditingVersion}
              onDelete={(v) => {
                if (confirm(`"${v.version_name}" 버전을 삭제할까요?`)) void deleteVersion(v.id)
              }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>새 자소서 버전</h2>
          <ResumeVersionForm
            submitLabel="추가"
            onCancel={() => setShowForm(false)}
            onSubmit={async (values) => {
              const result = await createVersion(values)
              if (!result.error) setShowForm(false)
              return result
            }}
          />
        </Modal>
      )}

      {editingVersion && (
        <Modal onClose={() => setEditingVersion(null)}>
          <h2>자소서 버전 수정</h2>
          <ResumeVersionForm
            initial={editingVersion}
            submitLabel="저장"
            onCancel={() => setEditingVersion(null)}
            onSubmit={async (values) => {
              const result = await updateVersion(
                editingVersion.id,
                { version_name: values.version_name, content: values.content || null },
                values.file,
              )
              if (!result.error) setEditingVersion(null)
              return result
            }}
          />
        </Modal>
      )}
    </div>
  )
}
