import { useState } from 'react'
import type { FormEvent } from 'react'
import { RESUME_FILE_ACCEPT } from '../../lib/constants'
import type { ResumeVersion } from '../../types/database'
import { ErrorBanner } from '../common/ErrorBanner'

export interface ResumeVersionFormValues {
  version_name: string
  content: string
  file: File | null
}

interface ResumeVersionFormProps {
  initial?: Partial<ResumeVersion>
  submitLabel: string
  onSubmit: (values: ResumeVersionFormValues) => Promise<{ error: string | null }>
  onCancel?: () => void
}

export function ResumeVersionForm({ initial, submitLabel, onSubmit, onCancel }: ResumeVersionFormProps) {
  const [values, setValues] = useState<ResumeVersionFormValues>({
    version_name: initial?.version_name ?? '',
    content: initial?.content ?? '',
    file: null,
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
        버전 이름 *
        <input
          required
          value={values.version_name}
          onChange={(e) => setValues((v) => ({ ...v, version_name: e.target.value }))}
        />
      </label>
      <label>
        내용
        <textarea
          rows={8}
          value={values.content}
          onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
        />
      </label>
      <label>
        파일 첨부 (PDF, Word)
        <input
          type="file"
          accept={RESUME_FILE_ACCEPT}
          onChange={(e) => setValues((v) => ({ ...v, file: e.target.files?.[0] ?? null }))}
        />
        {initial?.file_name && !values.file && (
          <span className="resume-existing-file">현재 첨부: {initial.file_name}</span>
        )}
      </label>

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
