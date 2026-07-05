import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { ResumeVersion } from '../types/database'

export function useResumeVersions() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useSupabaseQuery<ResumeVersion[]>(
    () => supabase.from('resume_versions').select('*').order('created_at', { ascending: false }),
    [user?.id],
  )
  const versions = data ?? []

  async function createVersion(input: { version_name: string; content: string }) {
    if (!user) return { error: '로그인이 필요합니다.' }
    const { error } = await supabase
      .from('resume_versions')
      .insert({ user_id: user.id, version_name: input.version_name, content: input.content || null })
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function updateVersion(id: string, patch: Partial<ResumeVersion>) {
    const { error } = await supabase.from('resume_versions').update(patch).eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function deleteVersion(id: string) {
    const { error } = await supabase.from('resume_versions').delete().eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { versions, loading, error, createVersion, updateVersion, deleteVersion, refetch }
}
