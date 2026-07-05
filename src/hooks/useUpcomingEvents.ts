import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import type { EventWithApplication } from '../types/domain'

export function useUpcomingEvents(rangeStart: string, rangeEnd: string) {
  const { data, loading, error, refetch } = useSupabaseQuery<EventWithApplication[]>(
    () =>
      supabase
        .from('events')
        .select('*, application:applications!inner(id, company_name, platform, status)')
        .eq('is_completed', false)
        .gte('event_date', rangeStart)
        .lte('event_date', rangeEnd)
        .order('event_date', { ascending: true }),
    [rangeStart, rangeEnd],
  )

  return { events: data ?? [], loading, error, refetch }
}
