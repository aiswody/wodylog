export function PlatformBadge({ platform }: { platform: string | null }) {
  if (!platform) return null
  return <span className="badge badge-neutral">{platform}</span>
}
