interface ResumeUsageListProps {
  items: { id: string; label: string }[]
  emptyText: string
}

export function ResumeUsageList({ items, emptyText }: ResumeUsageListProps) {
  if (items.length === 0) return <p className="empty-state">{emptyText}</p>

  return (
    <ul className="resume-usage-list">
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  )
}
