import { useState } from 'react'
import type { FormEvent } from 'react'
import { EVENT_TYPE_OPTIONS } from '../../lib/constants'
import type { Event } from '../../types/database'
import { Modal } from '../common/Modal'
import { ErrorBanner } from '../common/ErrorBanner'

export interface EventFormValues {
  event_type: string
  event_date: string
  location: string
  memo: string
  is_completed: boolean
}

interface EventFormModalProps {
  initial?: Event
  onClose: () => void
  onSubmit: (values: EventFormValues) => Promise<{ error: string | null }>
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventFormModal({ initial, onClose, onSubmit }: EventFormModalProps) {
  const [values, setValues] = useState<EventFormValues>({
    event_type: initial?.event_type ?? EVENT_TYPE_OPTIONS[0],
    event_date: toDatetimeLocal(initial?.event_date),
    location: initial?.location ?? '',
    memo: initial?.memo ?? '',
    is_completed: initial?.is_completed ?? false,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await onSubmit(values)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h2>{initial ? '일정 수정' : '일정 추가'}</h2>
      <form onSubmit={(e) => void handleSubmit(e)} className="event-form">
        <label>
          종류
          <select
            value={values.event_type}
            onChange={(e) => setValues((v) => ({ ...v, event_type: e.target.value }))}
          >
            {EVENT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          일시 *
          <input
            type="datetime-local"
            required
            value={values.event_date}
            onChange={(e) => setValues((v) => ({ ...v, event_date: e.target.value }))}
          />
        </label>
        <label>
          장소
          <input value={values.location} onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))} />
        </label>
        <label>
          메모
          <textarea
            rows={3}
            value={values.memo}
            onChange={(e) => setValues((v) => ({ ...v, memo: e.target.value }))}
          />
        </label>

        {initial && (
          <label className="event-form-checkbox">
            <input
              type="checkbox"
              checked={values.is_completed}
              onChange={(e) => setValues((v) => ({ ...v, is_completed: e.target.checked }))}
            />
            완료한 일정으로 표시
          </label>
        )}

        {error && <ErrorBanner message={error} />}

        <div className="form-actions">
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button type="submit" disabled={submitting}>
            {initial ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
