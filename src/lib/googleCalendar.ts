import type { Event } from '../types/database'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPE = 'https://www.googleapis.com/auth/calendar.app.created'
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

interface GoogleTokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string }): void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (error: { type: string; message?: string }) => void
          }): GoogleTokenClient
        }
      }
    }
  }
}

let gisLoadPromise: Promise<void> | null = null
let cachedToken: { accessToken: string; expiresAt: number } | null = null

function loadGisScript(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise
  gisLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('구글 로그인 스크립트를 불러오지 못했어요.'))
    document.head.appendChild(script)
  })
  return gisLoadPromise
}

export async function getAccessToken(opts: { interactive: boolean }): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > now) {
    return cachedToken.accessToken
  }

  await loadGisScript()

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          if (opts.interactive) reject(new Error(response.error ?? '구글 인증에 실패했어요.'))
          else resolve(null)
          return
        }
        cachedToken = {
          accessToken: response.access_token,
          expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
        }
        resolve(cachedToken.accessToken)
      },
      error_callback: (error) => {
        if (opts.interactive) reject(new Error(error?.message ?? '구글 인증 창이 닫혔어요.'))
        else resolve(null)
      },
    })

    try {
      client.requestAccessToken({ prompt: opts.interactive ? 'consent' : '' })
    } catch (e) {
      if (opts.interactive) reject(e instanceof Error ? e : new Error(String(e)))
      else resolve(null)
    }
  })
}

export async function findOrCreateCalendar(token: string, existingCalendarId: string | null): Promise<string> {
  if (existingCalendarId) return existingCalendarId

  const res = await fetch(`${CALENDAR_API_BASE}/calendars`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: 'Wodylog' }),
  })
  if (!res.ok) throw new Error(`구글 캘린더 생성 실패: ${res.status}`)
  const data = await res.json()
  return data.id as string
}

export async function upsertGoogleEvent(
  token: string,
  calendarId: string,
  googleEventId: string | null,
  body: Record<string, unknown>,
): Promise<string> {
  const encodedCalendarId = encodeURIComponent(calendarId)

  if (googleEventId) {
    const patchRes = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events/${encodeURIComponent(googleEventId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    if (patchRes.ok) {
      const data = await patchRes.json()
      return data.id as string
    }
    if (patchRes.status !== 404 && patchRes.status !== 410) {
      throw new Error(`구글 일정 업데이트 실패: ${patchRes.status}`)
    }
    // stale/orphaned id (404/410) — fall through and create a fresh event instead
  }

  const createRes = await fetch(`${CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!createRes.ok) throw new Error(`구글 일정 생성 실패: ${createRes.status}`)
  const data = await createRes.json()
  return data.id as string
}

export async function deleteGoogleEvent(token: string, calendarId: string, googleEventId: string): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`구글 일정 삭제 실패: ${res.status}`)
  }
}

export function toGoogleEventBody(event: Event, companyName: string) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const start = new Date(event.event_date)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  return {
    summary: `${companyName} · ${event.event_type}`,
    description: event.memo || undefined,
    location: event.location || undefined,
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
  }
}
