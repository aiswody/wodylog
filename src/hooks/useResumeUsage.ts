import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import type { Application } from '../types/database'

type ApplicationRef = Pick<Application, 'id' | 'company_name'>

export function useResumeUsage(resumeVersionId: string) {
  const { data, loading, error } = useSupabaseQuery<ApplicationRef[]>(async () => {
    const res = await supabase
      .from('application_resumes')
      .select('application:applications(id, company_name)')
      .eq('resume_version_id', resumeVersionId)
    if (res.error) return { data: null, error: res.error }
    const rows = res.data as unknown as { application: ApplicationRef | null }[]
    const applications = rows.map((row) => row.application).filter((a): a is ApplicationRef => a != null)
    return { data: applications, error: null }
  }, [resumeVersionId])

  return { applications: data ?? [], loading, error }
}
