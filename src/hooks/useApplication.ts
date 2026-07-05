import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import type { Application } from '../types/database'

export function useApplication(id: string) {
  const {
    data: application,
    loading,
    error,
    refetch,
  } = useSupabaseQuery<Application>(() => supabase.from('applications').select('*').eq('id', id).single(), [id])

  async function updateApplication(patch: Partial<Application>) {
    const { error } = await supabase.from('applications').update(patch).eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function deleteApplication() {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    return { error: error?.message ?? null }
  }

  return { application, loading, error, updateApplication, deleteApplication, refetch }
}
