import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import type { ResumeVersion } from '../types/database'

export function useApplicationResumes(applicationId: string) {
  const { data, loading, error, refetch } = useSupabaseQuery<ResumeVersion[]>(async () => {
    const res = await supabase
      .from('application_resumes')
      .select('resume_version:resume_versions(*)')
      .eq('application_id', applicationId)
    if (res.error) return { data: null, error: res.error }
    const rows = res.data as unknown as { resume_version: ResumeVersion | null }[]
    const versions = rows.map((row) => row.resume_version).filter((v): v is ResumeVersion => v != null)
    return { data: versions, error: null }
  }, [applicationId])

  const linkedVersions = data ?? []

  async function linkVersion(resumeVersionId: string) {
    const { error } = await supabase
      .from('application_resumes')
      .insert({ application_id: applicationId, resume_version_id: resumeVersionId })
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function unlinkVersion(resumeVersionId: string) {
    const { error } = await supabase
      .from('application_resumes')
      .delete()
      .eq('application_id', applicationId)
      .eq('resume_version_id', resumeVersionId)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { linkedVersions, loading, error, linkVersion, unlinkVersion, refetch }
}
