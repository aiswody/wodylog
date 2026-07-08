import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getCurrentSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from '../lib/pushNotifications'

interface PushNotificationContextValue {
  supported: boolean
  subscribed: boolean
  subscribing: boolean
  subscribe: () => Promise<{ error: string | null }>
  unsubscribe: () => Promise<{ error: string | null }>
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null)

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const supported = isPushSupported()
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!supported || !user) {
      setSubscribed(false)
      return
    }
    let cancelled = false
    void getCurrentSubscription().then((sub) => {
      if (!cancelled) setSubscribed(sub != null)
    })
    return () => {
      cancelled = true
    }
  }, [supported, user])

  async function subscribe() {
    if (!user) return { error: '로그인이 필요합니다.' }
    setSubscribing(true)
    const result = await subscribeToPush(user.id)
    setSubscribing(false)
    if (!result.error) setSubscribed(true)
    return result
  }

  async function unsubscribe() {
    const result = await unsubscribeFromPush()
    if (!result.error) setSubscribed(false)
    return result
  }

  const value: PushNotificationContextValue = { supported, subscribed, subscribing, subscribe, unsubscribe }

  return <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
}

export function usePushNotification() {
  const ctx = useContext(PushNotificationContext)
  if (!ctx) throw new Error('usePushNotification must be used within PushNotificationProvider')
  return ctx
}
