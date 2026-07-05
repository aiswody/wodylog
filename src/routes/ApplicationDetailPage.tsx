import { useParams } from 'react-router-dom'

export function ApplicationDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1>지원 상세</h1>
      <p>{id}</p>
    </div>
  )
}
