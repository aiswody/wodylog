// Runs on a schedule (pg_cron -> pg_net -> this function, every 15 min).
// Sends one Web Push reminder per event that's within 24h of its event_date,
// not completed, and hasn't been reminded yet.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT')!

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_type, event_date, application:applications!inner(user_id, company_name)')
    .eq('is_completed', false)
    .is('reminder_sent_at', null)
    .gte('event_date', now.toISOString())
    .lte('event_date', in24h.toISOString())

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  let sent = 0
  for (const event of events ?? []) {
    const application = event.application as unknown as { user_id: string; company_name: string }

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', application.user_id)

    const payload = JSON.stringify({
      title: `내일: ${application.company_name} ${event.event_type}`,
      body: '일정을 확인해보세요.',
      url: '/',
    })

    for (const sub of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
    }

    await supabase.from('events').update({ reminder_sent_at: now.toISOString() }).eq('id', event.id)
    sent++
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
