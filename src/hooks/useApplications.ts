import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { Application } from '../types/database'
import type { ApplicationFormValues } from '../components/applications/ApplicationForm'

export function useApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setApplications(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  async function createApplication(values: ApplicationFormValues) {
    if (!user) return { error: '로그인이 필요합니다.' }
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        company_name: values.company_name,
        position: values.position || null,
        platform: values.platform || null,
        status: values.status,
        applied_date: values.applied_date || null,
        memo: values.memo || null,
      })
      .select()
      .single()
    if (error) return { error: error.message }
    setApplications((prev) => [data, ...prev])
    return { error: null }
  }

  async function updateApplication(id: string, patch: Partial<Application>) {
    const { data, error } = await supabase.from('applications').update(patch).eq('id', id).select().single()
    if (error) return { error: error.message }
    setApplications((prev) => prev.map((a) => (a.id === id ? data : a)))
    return { error: null }
  }

  async function deleteApplication(id: string) {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) return { error: error.message }
    setApplications((prev) => prev.filter((a) => a.id !== id))
    return { error: null }
  }

  return { applications, loading, error, createApplication, updateApplication, deleteApplication, refetch: fetchApplications }
}
