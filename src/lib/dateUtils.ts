import { differenceInCalendarDays, startOfDay } from 'date-fns'

export function getDday(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date
  return differenceInCalendarDays(startOfDay(target), startOfDay(new Date()))
}

export function formatDday(days: number): string {
  if (days === 0) return 'D-DAY'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}
