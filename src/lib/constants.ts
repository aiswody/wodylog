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

// event types where a physical/video location is actually meaningful.
// 서류마감/코딩테스트/결과발표 are online-only in practice, so the
// location field only shows up for interviews (and 기타, since it's
// ambiguous by design).
export const EVENT_TYPES_WITH_LOCATION: readonly string[] = ['1차면접', '2차면접', '최종면접', '기타']

// registering one of these events auto-advances the application status
// to the mapped stage. 서류마감/결과발표/기타 aren't here because they
// don't imply a clear forward step (a 결과발표 could be a pass or a reject).
export const EVENT_TYPE_TO_STATUS: Record<string, string> = {
  코딩테스트: '코테대기',
  '1차면접': '면접대기',
  '2차면접': '면접대기',
  최종면접: '면접대기',
}

// status stages in progression order. auto-advance only moves forward
// along this list; 탈락 is intentionally excluded (terminal, off-track).
export const STATUS_PROGRESSION = ['지원완료', '서류합격', '코테대기', '면접대기', '최종합격'] as const

// same-date events highlight the day; events landing within this many
// hours of each other get a tighter "urgent" badge.
export const COLLISION_URGENT_HOURS = 3

export const RESUME_FILE_BUCKET = 'resumes'
export const RESUME_FILE_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
