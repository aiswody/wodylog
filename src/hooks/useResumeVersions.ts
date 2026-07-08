import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { RESUME_FILE_BUCKET } from '../lib/constants'
import type { ResumeVersion } from '../types/database'

export function useResumeVersions() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useSupabaseQuery<ResumeVersion[]>(
    () => supabase.from('resume_versions').select('*').order('created_at', { ascending: false }),
    [user?.id],
  )
  const versions = data ?? []

  async function uploadFile(versionId: string, file: File) {
    const ext = file.name.split('.').pop()
    const path = `${user!.id}/${versionId}.${ext}`
    const { error: uploadError } = await supabase.storage.from(RESUME_FILE_BUCKET).upload(path, file, {
      upsert: true,
    })
    if (uploadError) return { error: uploadError.message }
    const { error: patchError } = await supabase
      .from('resume_versions')
      .update({ file_path: path, file_name: file.name })
      .eq('id', versionId)
    return { error: patchError?.message ?? null }
  }

  async function createVersion(input: { version_name: string; content: string; file?: File | null }) {
    if (!user) return { error: '로그인이 필요합니다.' }
    const { data, error } = await supabase
      .from('resume_versions')
      .insert({ user_id: user.id, version_name: input.version_name, content: input.content || null })
      .select()
      .single()
    if (error) return { error: error.message }

    if (input.file) {
      const { error: fileError } = await uploadFile(data.id, input.file)
      if (fileError) return { error: fileError }
    }

    await refetch()
    return { error: null }
  }

  async function updateVersion(id: string, patch: Partial<ResumeVersion>, file?: File | null) {
    const { error } = await supabase.from('resume_versions').update(patch).eq('id', id)
    if (error) return { error: error.message }

    if (file) {
      const { error: fileError } = await uploadFile(id, file)
      if (fileError) return { error: fileError }
    }

    await refetch()
    return { error: null }
  }

  async function deleteVersion(id: string) {
    const version = versions.find((v) => v.id === id)
    if (version?.file_path) {
      await supabase.storage.from(RESUME_FILE_BUCKET).remove([version.file_path])
    }
    const { error } = await supabase.from('resume_versions').delete().eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { versions, loading, error, createVersion, updateVersion, deleteVersion, refetch }
}
