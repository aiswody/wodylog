import { Link } from 'react-router-dom'
import { StatusBadge } from '../common/StatusBadge'
import { PlatformBadge } from '../common/PlatformBadge'
import type { Application } from '../../types/database'

interface ApplicationCardProps {
  application: Application
  resumeVersionNames?: string[]
}

export function ApplicationCard({ application, resumeVersionNames }: ApplicationCardProps) {
  return (
    <Link to={`/applications/${application.id}`} className="application-card">
      <div className="application-card-header">
        <h3>{application.company_name}</h3>
        <StatusBadge status={application.status} />
      </div>
      {application.position && <p className="application-position">{application.position}</p>}
      <div className="application-card-meta">
        <PlatformBadge platform={application.platform} />
        {application.applied_date && <span>지원일 {application.applied_date}</span>}
      </div>
      {resumeVersionNames && resumeVersionNames.length > 0 && (
        <div className="application-card-resumes">
          {resumeVersionNames.map((name) => (
            <span key={name} className="badge badge-neutral">
              📎 {name}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
