import { useMemo } from 'react'
import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'

interface LinkedVersion {
  id: string
  version_name: string
}

interface LinkRow {
  application_id: string
  resume_version: LinkedVersion | null
}

export function useApplicationResumeLinks() {
  const { data, loading, error, refetch } = useSupabaseQuery<LinkRow[]>(async () => {
    const res = await supabase.from('application_resumes').select('application_id, resume_version:resume_versions(id, version_name)')
    if (res.error) return { data: null, error: res.error }
    return { data: res.data as unknown as LinkRow[], error: null }
  }, [])

  const mapByApplicationId = useMemo(() => {
    const map = new Map<string, LinkedVersion[]>()
    for (const row of data ?? []) {
      if (!row.resume_version) continue
      const list = map.get(row.application_id) ?? []
      list.push(row.resume_version)
      map.set(row.application_id, list)
    }
    return map
  }, [data])

  return { mapByApplicationId, loading, error, refetch }
}
