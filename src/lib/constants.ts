export const PLATFORM_OPTIONS = ['원티드', '잡코리아', '사람인', '자체홈페이지', '기타'] as const

export const STATUS_OPTIONS = [
  '지원완료',
  '서류합격',
  '코테대기',
  '면접대기',
  '최종합격',
  '탈락',
] as const

export const EVENT_TYPE_OPTIONS = [
  '서류마감',
  '코딩테스트',
  '1차면접',
  '2차면접',
  '최종면접',
  '결과발표',
  '기타',
] as const

// same-date events highlight the day; events landing within this many
// hours of each other get a tighter "urgent" badge.
export const COLLISION_URGENT_HOURS = 3
