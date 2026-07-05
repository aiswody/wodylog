import {
  differenceInCalendarDays,
  differenceInHours,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { COLLISION_URGENT_HOURS } from './constants'

export function getDday(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date
  return differenceInCalendarDays(startOfDay(target), startOfDay(new Date()))
}

export function formatDday(days: number): string {
  if (days === 0) return 'D-DAY'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}

export function buildMonthGrid(monthDate: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthDate)),
    end: endOfWeek(endOfMonth(monthDate)),
  })
}

export function buildWeekGrid(weekDate: Date): Date[] {
  return eachDayOfInterval({ start: startOfWeek(weekDate), end: endOfWeek(weekDate) })
}

export function dateKey(date: Date | string): string {
  return format(typeof date === 'string' ? new Date(date) : date, 'yyyy-MM-dd')
}

export function groupEventsByDate<T extends { event_date: string }>(events: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const event of events) {
    const key = dateKey(event.event_date)
    const list = map.get(key) ?? []
    list.push(event)
    map.set(key, list)
  }
  return map
}

export function hasCollision(events: { event_date: string }[]): boolean {
  return events.length >= 2
}

export function hasUrgentCollision(events: { event_date: string }[]): boolean {
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const hours = Math.abs(differenceInHours(new Date(events[i].event_date), new Date(events[j].event_date)))
      if (hours <= COLLISION_URGENT_HOURS) return true
    }
  }
  return false
}
