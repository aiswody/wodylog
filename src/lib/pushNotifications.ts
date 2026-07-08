import { supabase } from './supabaseClient'

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

async function registerServiceWorker() {
  return navigator.serviceWorker.register('/sw.js')
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export async function subscribeToPush(userId: string) {
  if (!isPushSupported()) return { error: '이 브라우저는 푸시 알림을 지원하지 않아요.' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { error: '알림 권한이 허용되지 않았어요.' }

  const registration = await registerServiceWorker()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
  })

  const { endpoint } = subscription
  const keys = subscription.toJSON().keys
  if (!keys?.p256dh || !keys?.auth) return { error: '구독 정보를 가져오지 못했어요.' }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint' })
  if (error) return { error: error.message }

  return { error: null }
}

export async function unsubscribeFromPush() {
  const subscription = await getCurrentSubscription()
  if (!subscription) return { error: null }

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) return { error: error.message }

  return { error: null }
}
