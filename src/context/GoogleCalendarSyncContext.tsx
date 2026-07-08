import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabaseClient'
import { deleteGoogleEvent, findOrCreateCalendar, getAccessToken, toGoogleEventBody, upsertGoogleEvent } from '../lib/googleCalendar'
import type { Event, GoogleCalendarConnection } from '../types/database'

interface SyncProgress {
  done: number
  total: number
}

interface GoogleCalendarSyncContextValue {
  connected: boolean
  connecting: boolean
  syncProgress: SyncProgress | null
  connect: () => Promise<{ error: string | null }>
  disconnect: () => Promise<void>
  resyncAll: () => Promise<{ error: string | null; synced: number; failed: number }>
  syncEvent: (action: 'create' | 'update' | 'delete', event: Event, companyName: string) => void
  syncDeleteMany: (events: Pick<Event, 'google_event_id'>[]) => void
}

const GoogleCalendarSyncContext = createContext<GoogleCalendarSyncContextValue | null>(null)

const BACKFILL_DELAY_MS = 180

async function syncOneEvent(calendarId: string, token: string, event: Event, companyName: string) {
  const body = toGoogleEventBody(event, companyName)
  const googleEventId = await upsertGoogleEvent(token, calendarId, event.google_event_id, body)
  if (googleEventId !== event.google_event_id) {
    await supabase.from('events').update({ google_event_id: googleEventId }).eq('id', event.id)
  }
}

export function GoogleCalendarSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [connection, setConnection] = useState<GoogleCalendarConnection | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null)
  const connectionRef = useRef<GoogleCalendarConnection | null>(null)
  connectionRef.current = connection

  useEffect(() => {
    if (!user) {
      setConnection(null)
      return
    }
    let cancelled = false
    void supabase
      .from('google_calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setConnection(data)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const connected = connection?.active === true

  const syncEvent = useCallback((action: 'create' | 'update' | 'delete', event: Event, companyName: string) => {
    const current = connectionRef.current
    if (!current || !current.active) return
    void (async () => {
      try {
        const token = await getAccessToken({ interactive: false })
        if (!token) return
        if (action === 'delete') {
          if (event.google_event_id) await deleteGoogleEvent(token, current.calendar_id, event.google_event_id)
          return
        }
        await syncOneEvent(current.calendar_id, token, event, companyName)
      } catch {
        // routine sync failures are silent by design — the manual resync button reconciles later
      }
    })()
  }, [])

  const syncDeleteMany = useCallback((events: Pick<Event, 'google_event_id'>[]) => {
    const current = connectionRef.current
    if (!current || !current.active) return
    const toDelete = events.filter((e): e is { google_event_id: string } => e.google_event_id != null)
    if (toDelete.length === 0) return
    void (async () => {
      try {
        const token = await getAccessToken({ interactive: false })
        if (!token) return
        for (const event of toDelete) {
          try {
            await deleteGoogleEvent(token, current.calendar_id, event.google_event_id)
          } catch {
            // best-effort — continue deleting the rest even if one fails
          }
        }
      } catch {
        // silent by design, same as syncEvent
      }
    })()
  }, [])

  async function backfillAll(calendarId: string, token: string) {
    const { data } = await supabase
      .from('events')
      .select('*, application:applications!inner(company_name)')
      .order('event_date', { ascending: true })
    const rows = (data ?? []) as unknown as (Event & { application: { company_name: string } })[]

    setSyncProgress({ done: 0, total: rows.length })
    let synced = 0
    let failed = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        await syncOneEvent(calendarId, token, row, row.application.company_name)
        synced++
      } catch {
        failed++
      }
      setSyncProgress({ done: i + 1, total: rows.length })
      await new Promise((resolve) => setTimeout(resolve, BACKFILL_DELAY_MS))
    }
    setSyncProgress(null)
    return { synced, failed }
  }

  async function connect() {
    if (!user) return { error: '로그인이 필요합니다.' }
    setConnecting(true)
    try {
      const token = await getAccessToken({ interactive: true })
      if (!token) return { error: '구글 인증에 실패했어요.' }

      const calendarId = await findOrCreateCalendar(token, connection?.calendar_id ?? null)

      const { data, error } = await supabase
        .from('google_calendar_connections')
        .upsert({ user_id: user.id, calendar_id: calendarId, active: true, disconnected_at: null })
        .select()
        .single()
      if (error) return { error: error.message }
      setConnection(data)

      await backfillAll(calendarId, token)
      return { error: null }
    } catch (e) {
      return { error: e instanceof Error ? e.message : '연동에 실패했어요.' }
    } finally {
      setConnecting(false)
    }
  }

  async function disconnect() {
    if (!user) return
    const { data } = await supabase
      .from('google_calendar_connections')
      .update({ active: false, disconnected_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()
    if (data) setConnection(data)
  }

  async function resyncAll() {
    if (!connection) return { error: '먼저 연동해주세요.', synced: 0, failed: 0 }
    try {
      const token = await getAccessToken({ interactive: true })
      if (!token) return { error: '구글 인증에 실패했어요.', synced: 0, failed: 0 }
      const result = await backfillAll(connection.calendar_id, token)
      return { error: null, ...result }
    } catch (e) {
      return { error: e instanceof Error ? e.message : '재동기화에 실패했어요.', synced: 0, failed: 0 }
    }
  }

  const value: GoogleCalendarSyncContextValue = {
    connected,
    connecting,
    syncProgress,
    connect,
    disconnect,
    resyncAll,
    syncEvent,
    syncDeleteMany,
  }

  return <GoogleCalendarSyncContext.Provider value={value}>{children}</GoogleCalendarSyncContext.Provider>
}

export function useGoogleCalendarSync() {
  const ctx = useContext(GoogleCalendarSyncContext)
  if (!ctx) throw new Error('useGoogleCalendarSync must be used within GoogleCalendarSyncProvider')
  return ctx
}
