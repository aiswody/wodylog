import { STATUS_OPTIONS } from '../../lib/constants'

interface ApplicationFilterBarProps {
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  sortOrder: 'newest' | 'oldest'
  onSortOrderChange: (value: 'newest' | 'oldest') => void
}

export function ApplicationFilterBar({
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: ApplicationFilterBarProps) {
  return (
    <div className="application-filter-bar">
      <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
        <option value="">전체 상태</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as 'newest' | 'oldest')}>
        <option value="newest">최신 지원순</option>
        <option value="oldest">오래된 지원순</option>
      </select>
    </div>
  )
}
