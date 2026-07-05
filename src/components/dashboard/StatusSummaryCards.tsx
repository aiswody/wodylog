import { STATUS_OPTIONS } from '../../lib/constants'
import { StatusBadge } from '../common/StatusBadge'
import type { Application } from '../../types/database'

export function StatusSummaryCards({ applications }: { applications: Application[] }) {
  const counts = new Map<string, number>()
  for (const app of applications) counts.set(app.status, (counts.get(app.status) ?? 0) + 1)

  return (
    <div className="status-summary-cards">
      <div className="status-summary-card">
        <span className="status-summary-count">{applications.length}</span>
        <span>전체 지원</span>
      </div>
      {STATUS_OPTIONS.map((status) => (
        <div key={status} className="status-summary-card">
          <span className="status-summary-count">{counts.get(status) ?? 0}</span>
          <StatusBadge status={status} />
        </div>
      ))}
    </div>
  )
}
