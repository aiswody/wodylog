const STATUS_COLORS: Record<string, string> = {
  지원완료: '#6b7280',
  서류합격: '#0891b2',
  코테대기: '#a855f7',
  면접대기: '#f59e0b',
  최종합격: '#16a34a',
  탈락: '#dc2626',
}

const FALLBACK_COLOR = '#6b7280'

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? FALLBACK_COLOR
  return (
    <span className="badge" style={{ color, borderColor: color, background: `${color}1a` }}>
      {status}
    </span>
  )
}
