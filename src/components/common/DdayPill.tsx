import { formatDday, getDday } from '../../lib/dateUtils'

export function DdayPill({ date, isCompleted }: { date: string; isCompleted?: boolean }) {
  const days = getDday(date)
  const isOverdue = days < 0 && !isCompleted

  return (
    <span className={`dday-pill${isOverdue ? ' overdue' : ''}${isCompleted ? ' completed' : ''}`}>
      {formatDday(days)}
    </span>
  )
}
