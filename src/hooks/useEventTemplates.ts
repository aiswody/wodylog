import { useSupabaseQuery } from './useSupabaseQuery'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { EventTemplate } from '../types/database'

export interface EventTemplateItemInput {
  event_type: string
  day_offset: number
}

export function useEventTemplates() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useSupabaseQuery<EventTemplate[]>(
    () =>
      supabase
        .from('event_templates')
        .select('*, items:event_template_items(*)')
        .order('created_at', { ascending: false })
        .order('sort_order', { referencedTable: 'event_template_items', ascending: true }),
    [user?.id],
  )
  const templates = data ?? []

  async function createTemplate(name: string, items: EventTemplateItemInput[]) {
    if (!user) return { error: '로그인이 필요합니다.' }
    const { data, error } = await supabase
      .from('event_templates')
      .insert({ user_id: user.id, name })
      .select()
      .single()
    if (error) return { error: error.message }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('event_template_items').insert(
        items.map((item, index) => ({
          template_id: data.id as string,
          event_type: item.event_type,
          day_offset: item.day_offset,
          sort_order: index,
        })),
      )
      if (itemsError) return { error: itemsError.message }
    }

    await refetch()
    return { error: null }
  }

  async function updateTemplate(id: string, name: string, items: EventTemplateItemInput[]) {
    const { error } = await supabase.from('event_templates').update({ name }).eq('id', id)
    if (error) return { error: error.message }

    const { error: deleteError } = await supabase.from('event_template_items').delete().eq('template_id', id)
    if (deleteError) return { error: deleteError.message }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('event_template_items').insert(
        items.map((item, index) => ({
          template_id: id,
          event_type: item.event_type,
          day_offset: item.day_offset,
          sort_order: index,
        })),
      )
      if (itemsError) return { error: itemsError.message }
    }

    await refetch()
    return { error: null }
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase.from('event_templates').delete().eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, refetch }
}
