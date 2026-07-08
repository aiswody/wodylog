import { useState } from 'react'
import type { FormEvent } from 'react'
import { EVENT_TYPE_OPTIONS } from '../../lib/constants'
import type { EventTemplate } from '../../types/database'
import type { EventTemplateItemInput } from '../../hooks/useEventTemplates'
import { ErrorBanner } from '../common/ErrorBanner'

interface EventTemplateFormProps {
  initial?: EventTemplate
  submitLabel: string
  onSubmit: (name: string, items: EventTemplateItemInput[]) => Promise<{ error: string | null }>
  onCancel?: () => void
}

const CUSTOM_TYPE = '__custom__'

function toItemInputs(initial?: EventTemplate): EventTemplateItemInput[] {
  if (!initial) return [{ event_type: EVENT_TYPE_OPTIONS[0], day_offset: 0 }]
  return initial.items.map((item) => ({ event_type: item.event_type, day_offset: item.day_offset }))
}

function isKnownType(eventType: string) {
  return (EVENT_TYPE_OPTIONS as readonly string[]).includes(eventType)
}

export function EventTemplateForm({ initial, submitLabel, onSubmit, onCancel }: EventTemplateFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [items, setItems] = useState<EventTemplateItemInput[]>(toItemInputs(initial))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateItem(index: number, patch: Partial<EventTemplateItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { event_type: EVENT_TYPE_OPTIONS[0], day_offset: 0 }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await onSubmit(name, items)
    setSubmitting(false)
    if (result.error) setError(result.error)
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="application-form">
      <label>
        템플릿 이름 *
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 표준 전형" />
      </label>

      <div className="template-item-list">
        {items.map((item, index) => {
          const custom = !isKnownType(item.event_type)
          return (
            <div key={index} className="template-item-row">
              <div className="template-item-type-row">
                <select
                  value={custom ? CUSTOM_TYPE : item.event_type}
                  onChange={(e) =>
                    updateItem(index, { event_type: e.target.value === CUSTOM_TYPE ? '' : e.target.value })
                  }
                >
                  {EVENT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value={CUSTOM_TYPE}>직접 입력</option>
                </select>
                {custom && (
                  <input
                    className="template-item-custom-type"
                    value={item.event_type}
                    onChange={(e) => updateItem(index, { event_type: e.target.value })}
                    placeholder="단계 이름"
                  />
                )}
              </div>
              <div className="template-item-offset-row">
                <input
                  type="number"
                  value={item.day_offset}
                  onChange={(e) => updateItem(index, { day_offset: Number(e.target.value) })}
                  title="기준일로부터 며칠 뒤인지"
                />
                <span className="template-item-day-label">일 뒤</span>
                <button
                  type="button"
                  className="template-remove-btn"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  삭제
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <button type="button" className="template-add-row-btn" onClick={addItem}>
        + 단계 추가
      </button>

      {error && <ErrorBanner message={error} />}

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" disabled={submitting || items.length === 0}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
