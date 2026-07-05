interface CalendarViewToggleProps {
  viewMode: 'month' | 'week'
  onChange: (mode: 'month' | 'week') => void
}

export function CalendarViewToggle({ viewMode, onChange }: CalendarViewToggleProps) {
  return (
    <div className="calendar-view-toggle">
      <button type="button" className={viewMode === 'month' ? 'active' : ''} onClick={() => onChange('month')}>
        월간
      </button>
      <button type="button" className={viewMode === 'week' ? 'active' : ''} onClick={() => onChange('week')}>
        주간
      </button>
    </div>
  )
}
