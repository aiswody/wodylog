import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import type { Event } from '../types/database'

interface EventInput {
  event_type: string
  event_date: string
  location: string
  memo: string
}

export function useEvents(applicationId: string) {
  const {
    data,
    loading,
    error,
    refetch,
  } = useSupabaseQuery<Event[]>(
    () =>
      supabase
        .from('events')
        .select('*')
        .eq('application_id', applicationId)
        .order('event_date', { ascending: true }),
    [applicationId],
  )
  const events = data ?? []

  async function createEvent(input: EventInput) {
    const { error } = await supabase.from('events').insert({
      application_id: applicationId,
      event_type: input.event_type,
      event_date: input.event_date,
      location: input.location || null,
      memo: input.memo || null,
    })
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function updateEvent(id: string, patch: Partial<Event>) {
    const { error } = await supabase.from('events').update(patch).eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { events, loading, error, createEvent, updateEvent, deleteEvent, refetch }
}
