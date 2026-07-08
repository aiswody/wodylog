import { useState } from 'react'
import { usePushNotification } from '../../context/PushNotificationContext'
import { ErrorBanner } from '../common/ErrorBanner'

export function PushReminderPanel() {
  const { supported, subscribed, subscribing, subscribe, unsubscribe } = usePushNotification()
  const [error, setError] = useState<string | null>(null)

  if (!supported) return null

  async function handleSubscribe() {
    setError(null)
    const result = await subscribe()
    if (result.error) setError(result.error)
  }

  async function handleUnsubscribe() {
    setError(null)
    const result = await unsubscribe()
    if (result.error) setError(result.error)
  }

  return (
    <div className="push-reminder-banner">
      <span className="push-reminder-text">
        {subscribed ? '🔔 리마인더 알림이 켜져 있어요.' : '🔔 마감·면접 하루 전에 알림을 받아보세요.'}
      </span>
      {!subscribed ? (
        <button type="button" className="push-reminder-btn" onClick={() => void handleSubscribe()} disabled={subscribing}>
          {subscribing ? '설정 중...' : '알림 받기'}
        </button>
      ) : (
        <button type="button" className="push-reminder-btn" onClick={() => void handleUnsubscribe()}>
          알림 해제
        </button>
      )}

      {error && <ErrorBanner message={error} />}
    </div>
  )
}
