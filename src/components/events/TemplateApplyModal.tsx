import { useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { useEventTemplates } from '../../hooks/useEventTemplates'
import { Modal } from '../common/Modal'
import { ErrorBanner } from '../common/ErrorBanner'
import type { EventTemplateItem } from '../../types/database'

interface TemplateApplyModalProps {
  onClose: () => void
  onApply: (rows: { event_type: string; event_date: string }[]) => Promise<void>
}

const DEFAULT_HOUR = 10

function resultingDate(baseDate: string, item: EventTemplateItem) {
  const [year, month, day] = baseDate.split('-').map(Number)
  const base = new Date(year, month - 1, day, DEFAULT_HOUR, 0, 0)
  return addDays(base, item.day_offset)
}

export function TemplateApplyModal({ onClose, onApply }: TemplateApplyModalProps) {
  const { templates, loading } = useEventTemplates()
  const [templateId, setTemplateId] = useState('')
  const [baseDate, setBaseDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const template = templates.find((t) => t.id === templateId)
  const sortedItems = useMemo(
    () => (template ? [...template.items].sort((a, b) => a.sort_order - b.sort_order) : []),
    [template],
  )

  function handleTemplateChange(id: string) {
    setTemplateId(id)
    const next = templates.find((t) => t.id === id)
    setCheckedIds(Object.fromEntries((next?.items ?? []).map((item) => [item.id, true])))
  }

  async function handleApply() {
    if (!template) return
    setError(null)
    setApplying(true)
    const rows = sortedItems
      .filter((item) => checkedIds[item.id])
      .map((item) => ({
        event_type: item.event_type,
        event_date: resultingDate(baseDate, item).toISOString(),
      }))
    await onApply(rows)
    setApplying(false)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h2>템플릿으로 일정 추가</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : templates.length === 0 ? (
        <p className="empty-state">등록된 템플릿이 없어요. 먼저 "템플릿" 메뉴에서 템플릿을 만들어주세요.</p>
      ) : (
        <div className="application-form">
          <label>
            템플릿
            <select value={templateId} onChange={(e) => handleTemplateChange(e.target.value)}>
              <option value="">템플릿 선택</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            기준일
            <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
          </label>

          {template && (
            <ul className="template-item-preview">
              {sortedItems.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checkedIds[item.id] ?? false}
                      onChange={(e) => setCheckedIds((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                    />
                    {item.event_type} · {format(resultingDate(baseDate, item), 'yyyy.MM.dd (EEE) HH:mm', { locale: ko })}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {error && <ErrorBanner message={error} />}

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button
              type="button"
              disabled={!template || applying || sortedItems.every((item) => !checkedIds[item.id])}
              onClick={() => void handleApply()}
            >
              {applying ? '추가 중...' : '적용'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
