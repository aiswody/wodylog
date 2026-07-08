import { useState } from 'react'
import { useGoogleCalendarSync } from '../../context/GoogleCalendarSyncContext'
import { ErrorBanner } from '../common/ErrorBanner'

export function GoogleCalendarSyncPanel() {
  const { connected, connecting, syncProgress, connect, disconnect, resyncAll } = useGoogleCalendarSync()
  const [error, setError] = useState<string | null>(null)
  const [resyncing, setResyncing] = useState(false)

  async function handleConnect() {
    setError(null)
    const result = await connect()
    if (result.error) setError(result.error)
  }

  async function handleResync() {
    setError(null)
    setResyncing(true)
    const result = await resyncAll()
    setResyncing(false)
    if (result.error) setError(result.error)
  }

  return (
    <section className="detail-section google-sync-panel">
      <div className="page-header">
        <div>
          <h2>구글 캘린더 연동</h2>
          {!connected && (
            <p className="google-sync-description">
              Wodylog라는 이름의 구글 캘린더에 일정을 자동으로 동기화해요. 구글 계정을 아이폰에 추가해두면 몇 분 안에
              반영돼요.
            </p>
          )}
          {connected && !syncProgress && (
            <p className="google-sync-description">
              Wodylog 캘린더에 연동됨 · 일정이 안 보이면 재동기화를 눌러주세요.
            </p>
          )}
          {syncProgress && (
            <p className="google-sync-description">
              기존 일정 {syncProgress.done}/{syncProgress.total}개 동기화 중...
            </p>
          )}
        </div>
        {!connected ? (
          <button type="button" onClick={() => void handleConnect()} disabled={connecting}>
            {connecting ? '연동 중...' : '연동하기'}
          </button>
        ) : (
          <div className="google-sync-actions">
            <button type="button" onClick={() => void handleResync()} disabled={resyncing}>
              {resyncing ? '재동기화 중...' : '재동기화'}
            </button>
            <button type="button" onClick={() => void disconnect()}>
              연동 해제
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
    </section>
  )
}
