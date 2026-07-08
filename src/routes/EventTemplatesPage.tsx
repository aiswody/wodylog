import { useState } from 'react'
import { useEventTemplates } from '../hooks/useEventTemplates'
import { EventTemplateForm } from '../components/templates/EventTemplateForm'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBanner } from '../components/common/ErrorBanner'
import type { EventTemplate } from '../types/database'

export function EventTemplatesPage() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useEventTemplates()
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1>일정 템플릿</h1>
        <button type="button" onClick={() => setShowForm(true)}>
          + 새 템플릿
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {templates.length === 0 ? (
        <p className="empty-state">아직 등록된 템플릿이 없어요. 자주 쓰는 전형 단계를 템플릿으로 만들어두면 지원 상세 페이지에서 한 번에 일정을 추가할 수 있어요.</p>
      ) : (
        <div className="resume-version-list">
          {templates.map((template) => (
            <div key={template.id} className="detail-section template-card">
              <div className="page-header">
                <h2>{template.name}</h2>
                <div className="template-card-actions">
                  <button type="button" onClick={() => setEditingTemplate(template)}>
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${template.name}" 템플릿을 삭제할까요?`)) void deleteTemplate(template.id)
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <ul className="template-item-preview">
                {template.items
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <li key={item.id}>
                      {item.event_type} · D+{item.day_offset}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>새 템플릿</h2>
          <EventTemplateForm
            submitLabel="추가"
            onCancel={() => setShowForm(false)}
            onSubmit={async (name, items) => {
              const result = await createTemplate(name, items)
              if (!result.error) setShowForm(false)
              return result
            }}
          />
        </Modal>
      )}

      {editingTemplate && (
        <Modal onClose={() => setEditingTemplate(null)}>
          <h2>템플릿 수정</h2>
          <EventTemplateForm
            initial={editingTemplate}
            submitLabel="저장"
            onCancel={() => setEditingTemplate(null)}
            onSubmit={async (name, items) => {
              const result = await updateTemplate(editingTemplate.id, name, items)
              if (!result.error) setEditingTemplate(null)
              return result
            }}
          />
        </Modal>
      )}
    </div>
  )
}
