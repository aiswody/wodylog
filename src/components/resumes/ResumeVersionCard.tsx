import { useResumeUsage } from '../../hooks/useResumeUsage'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { RESUME_FILE_BUCKET } from '../../lib/constants'
import { ResumeUsageList } from './ResumeUsageList'
import type { ResumeVersion } from '../../types/database'

interface ResumeVersionCardProps {
  version: ResumeVersion
  onEdit: (version: ResumeVersion) => void
  onDelete: (version: ResumeVersion) => void
}

export function ResumeVersionCard({ version, onEdit, onDelete }: ResumeVersionCardProps) {
  const { applications } = useResumeUsage(version.id)
  const fileUrl = useSignedUrl(RESUME_FILE_BUCKET, version.file_path)

  return (
    <div className="resume-version-card">
      <div className="resume-version-card-header">
        <h3>{version.version_name}</h3>
        <span className="resume-usage-count">{applications.length}곳에 사용</span>
      </div>
      {version.content && <p className="resume-version-preview">{version.content.slice(0, 120)}</p>}
      {version.file_name && (
        <p className="resume-file-link">
          📎{' '}
          {fileUrl ? (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              {version.file_name}
            </a>
          ) : (
            version.file_name
          )}
        </p>
      )}
      <ResumeUsageList
        items={applications.map((a) => ({ id: a.id, label: a.company_name }))}
        emptyText="아직 연결된 지원이 없어요."
      />
      <div className="event-card-actions">
        <button type="button" onClick={() => onEdit(version)}>
          수정
        </button>
        <button type="button" onClick={() => onDelete(version)}>
          삭제
        </button>
      </div>
    </div>
  )
}
