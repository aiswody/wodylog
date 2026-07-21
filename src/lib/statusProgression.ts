import { EVENT_TYPE_TO_STATUS, STATUS_PROGRESSION } from './constants'

// Given the application's current status and a newly-registered event type,
// returns the status it should advance to, or null if it shouldn't change.
// Only moves forward along STATUS_PROGRESSION — never rewinds — and leaves
// off-track statuses (e.g. 탈락) untouched since they aren't in the list.
export function nextStatusForEvent(currentStatus: string, eventType: string): string | null {
  const target = EVENT_TYPE_TO_STATUS[eventType]
  if (!target) return null
  const currentRank = STATUS_PROGRESSION.indexOf(currentStatus as (typeof STATUS_PROGRESSION)[number])
  const targetRank = STATUS_PROGRESSION.indexOf(target as (typeof STATUS_PROGRESSION)[number])
  if (currentRank === -1 || targetRank === -1) return null
  return targetRank > currentRank ? target : null
}
