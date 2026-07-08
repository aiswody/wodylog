import { useState } from 'react'
import type { FormEvent } from 'react'
import { PLATFORM_OPTIONS, STATUS_OPTIONS } from '../../lib/constants'
import type { Application, ResumeVersion } from '../../types/database'
import { ErrorBanner } from '../common/ErrorBanner'

export interface ApplicationFormValues {
  company_name: string
  position: string
  platform: string
  status: string
  applied_date: string
  memo: string
  resume_version_id: string
}

interface ApplicationFormProps {
  initial?: Partial<Application>
  submitLabel: string
  onSubmit: (values: ApplicationFormValues) => Promise<{ error: string | null }>
  onCancel?: () => void
  resumeVersions?: ResumeVersion[]
}

export function ApplicationForm({ initial, submitLabel, onSubmit, onCancel, resumeVersions }: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>({
    company_name: initial?.company_name ?? '',
    position: initial?.position ?? '',
    platform: initial?.platform ?? PLATFORM_OPTIONS[0],
    status: initial?.status ?? STATUS_OPTIONS[0],
    applied_date: initial?.applied_date ?? '',
    memo: initial?.memo ?? '',
    resume_version_id: '',
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
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="application-form">
      <label>
        회사명 *
        <input
          required
          value={values.company_name}
          onChange={(e) => setValues((v) => ({ ...v, company_name: e.target.value }))}
        />
      </label>
      <label>
        직무
        <input value={values.position} onChange={(e) => setValues((v) => ({ ...v, position: e.target.value }))} />
      </label>
      <label>
        플랫폼
        <select value={values.platform} onChange={(e) => setValues((v) => ({ ...v, platform: e.target.value }))}>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        상태
        <select value={values.status} onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        지원일
        <input
          type="date"
          value={values.applied_date}
          onChange={(e) => setValues((v) => ({ ...v, applied_date: e.target.value }))}
        />
      </label>
      <label>
        메모
        <textarea rows={3} value={values.memo} onChange={(e) => setValues((v) => ({ ...v, memo: e.target.value }))} />
      </label>
      {resumeVersions && (
        <label>
          자소서 버전
          <select
            value={values.resume_version_id}
            onChange={(e) => setValues((v) => ({ ...v, resume_version_id: e.target.value }))}
          >
            <option value="">나중에 연결</option>
            {resumeVersions.map((rv) => (
              <option key={rv.id} value={rv.id}>
                {rv.version_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <ErrorBanner message={error} />}

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" disabled={submitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
