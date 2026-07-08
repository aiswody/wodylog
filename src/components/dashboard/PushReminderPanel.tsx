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
    <section className="detail-section google-sync-panel">
      <div className="page-header">
        <div>
          <h2>리마인더 알림</h2>
          {!subscribed && (
            <p className="google-sync-description">마감·면접 하루 전에 브라우저 알림을 받아요. 앱을 열어두지 않아도 와요.</p>
          )}
          {subscribed && <p className="google-sync-description">알림이 켜져 있어요.</p>}
        </div>
        {!subscribed ? (
          <button type="button" onClick={() => void handleSubscribe()} disabled={subscribing}>
            {subscribing ? '설정 중...' : '알림 받기'}
          </button>
        ) : (
          <div className="google-sync-actions">
            <button type="button" onClick={() => void handleUnsubscribe()}>
              알림 해제
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
    </section>
  )
}
